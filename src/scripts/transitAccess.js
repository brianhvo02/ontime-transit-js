import Dexie from 'dexie';
import { csvParse, autoType } from 'd3';
import { ZipReader, BlobReader, TextWriter } from "@zip.js/zip.js";

export default class TransitAccess extends Dexie {
    queue = Object.fromEntries(TransitAccess.TABLES.map(table => [table, new Array()]));

    static PROCESSING_COUNT = 200000;
    // static SUPPORTED_AGENCIES = ['BA', 'SC'];
    static TABLE_MAP = {
        'agency': ['agency_id'],
        'mtc_feed_versions': ['agency_id'],
        'routes': ['route_id'],
        // 'route_attributes': ['route_id'],
        'stops': ['stop_id'],
        'trips': ['trip_id', 'route_id', '[agency_id+route_id]'],
        // 'areas': ['area_id'],
        'shapes': ['[shape_id+shape_pt_sequence]', '[shape_id+agency_id]'],
        'levels': ['level_id'],
        'calendar': ['service_id'],
        'calendar_dates': ['[service_id+date]'],
        'calendar_attributes': ['service_id'],
        // 'directions': ['route_id', 'direction_id'],
        // 'fare_products': ['[fare_product_id+fare_media_id]'],
        // 'pathways': ['pathway_id'],
        // 'rider_categories': ['rider_category_id'],
        // 'stop_areas': [['area_id', 'stop_id']],
        // 'stop_times': ['trip_id', 'stop_sequence'],
        'LastGenerated': [],
    }

    static TABLES = Object.keys(this.TABLE_MAP);

    constructor(checkUpdate, version, log, send) {
        super("GTFS");
        this.checkUpdate = checkUpdate;
        this.log = log;
        this.send = send;
        this.dbVersion = version;
        this.instance = this.newInstance();
    }

    async getGTFSFeeds() {
        const agencyPromises = this.agencies.map(async agency => {
            const agencyGTFSZip = await fetch(`https://api.511.org/transit/datafeeds?operator_id=${agency['Id']}&api_key=7cf5660e-215b-489d-87b1-78bb3ee006b7`)
            const agencyGTFSBlob = await agencyGTFSZip.blob();
            const agencyGTFSZipFileReader = new BlobReader(agencyGTFSBlob);
            const agencyGTFSZipReader = new ZipReader(agencyGTFSZipFileReader);
            const agencyGTFSEntries = await agencyGTFSZipReader.getEntries();
            const entryPromises = agencyGTFSEntries.map(async entry => {
                const name = entry.filename.slice(0, entry.filename.indexOf('.'));
                const writer = new TextWriter();
                const text = await entry.getData(writer);
                const parsed = csvParse(text, autoType);
                return [name, parsed];
            });
    
            const entries = Object.fromEntries(await Promise.all(entryPromises));
            await agencyGTFSZipReader.close();
    
            return [agency['Id'], entries];
        });
    
        const agencyDataEntries = await Promise.all(agencyPromises);
    
        this.log('GTFS feeds retreived.');
    
        return Object.fromEntries(agencyDataEntries);
    }

    async newInstance() {
        if (this.checkUpdate) {
            const agenciesData = await fetch('https://api.511.org/transit/gtfsoperators?api_key=7cf5660e-215b-489d-87b1-78bb3ee006b7');
            this.agencies = (await agenciesData.json()).filter(agency => agency['Id'] !== 'RG')
            // .filter(agency => TransitAccess.SUPPORTED_AGENCIES.includes(agency['Id']));
            this.dbVersion = this.agencies.reduce((acc, agency) => acc + new Date(agency['LastGenerated']).getTime(), 0);
            
            let openedDb;
            let verno;
            try {
                openedDb = await this.open();
                verno = openedDb.verno;

                if (this.dbVersion === verno) {
                    this.checkUpdate = false;
                } else {
                    const lastGenerated = await openedDb.table('LastGenerated').toArray();
                    this.agencies = this.agencies.filter(agency => !lastGenerated.find(obj => obj['Id'] === agency['Id']) || new Date(agency['LastGenerated']) > new Date(lastGenerated.find(obj => obj['Id'] === agency['Id'])['LastGenerated']));
                }
            } catch(e) {
                this.log(e.toString());
                this.firstTime = true;
            } finally {
                if (openedDb) openedDb.close();
            }
        }
        
        const schema = Object.fromEntries(TransitAccess.TABLES.map(table => [ table, [ 'id' ].concat(TransitAccess.TABLE_MAP[table].includes('agency_id') ? [] : [ 'agency_id' ]).concat(TransitAccess.TABLE_MAP[table]).join(', ') ]));
        this.version(this.dbVersion).stores(schema);
        await this.open();

        if (this.checkUpdate) {
            const data = await this.getGTFSFeeds();

            if (!this.firstTime) {
                const clearTables = this.tables.map(table => table.where('agency_id').anyOf(this.agencies.map(agency => agency['Id'])).delete());
                await Promise.all(clearTables);
                this.log('Cleared tables.');
            }
            
            for (let agency_id in data) {
                const agency = data[agency_id];
                for (let table in agency) {
                    if (TransitAccess.TABLES.includes(table)) {
                        const records = agency[table].map((record, i) => {
                            const pk = TransitAccess.TABLE_MAP[table][0];
                            let id;
                            if (pk.includes('+')) {
                                const [ key1, key2 ] = pk.slice(1, pk.length - 1).split('+');
                                id = [ agency_id, record[key1], record[key2] ].join('_');
                            } else {
                                id = [ agency_id, record[pk] ].join('_');
                            }
                            return { 
                                id,
                                agency_id,
                                ...record 
                            }
                        });
            
                        this.queue[table] = this.queue[table].concat(records);
                    }
                }
            }
        
            this.queue['LastGenerated'] = this.agencies.map(agency => {
                agency.id = agency.Id;
                return agency;
            });
        
            this.totalQueue = Object.values(this.queue).reduce((acc, arr) => acc + arr.length, 0);
            this.currentQueue = 0;
            
            this.batchAdd();
        }

        return this;
    }

    async batchAdd() {
        const currentTable = TransitAccess.TABLES.find(table => this.queue[table].length > 0);
        const batch = this.queue[currentTable].splice(0, TransitAccess.PROCESSING_COUNT);
        const startTime = new Date();
        this.log(`Writing ${batch.length} records to table "${currentTable}"`);
        await this.table(currentTable).bulkAdd(batch);
        const timeElapsed = new Date(new Date() - startTime);
        this.log(`Finished in ${timeElapsed.getSeconds()} sec, ${timeElapsed.getMilliseconds()} ms`);
        this.currentQueue += batch.length;
        this.send('updateProgress', {
            progress: this.currentQueue / this.totalQueue
        });
        if (Object.values(this.queue).reduce((acc, queue) => acc + queue.length) > 0) this.batchAdd();
    }
}