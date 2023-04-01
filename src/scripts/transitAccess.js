import Dexie from 'dexie';

export default class TransitAccess extends Dexie {
    queue = Object.fromEntries(TransitAccess.TABLES.map(table => [table, new Array()]));

    static PROCESSING_COUNT = 200000;
    static SUPPORTED_AGENCIES = ['BA', 'SC'];
    static TABLE_MAP = {
        'LastGenerated': ['Id'],
        'agency': ['agency_id'],
        'mtc_feed_versions': ['agency_id'],
        'routes': ['route_id'],
        // 'route_attributes': ['route_id'],
        'stops': ['stop_id'],
        'trips': ['trip_id'],
        'areas': ['area_id'],
        'shapes': ['shape_id', 'shape_pt_sequence'],
        'levels': ['level_id'],
        'calendar': ['service_id'],
        'calendar_dates': ['service_id', 'date'],
        'calendar_attributes': ['service_id'],
        'directions': ['route_id', 'direction_id'],
        'fare_products': ['fare_product_id', 'fare_media_id'],
        'pathways': ['pathway_id'],
        'rider_categories': ['rider_category_id'],
        'stop_areas': ['area_id', 'stop_id'],
        'stop_times': ['trip_id', 'stop_sequence'],
    }

    static TABLES = Object.keys(this.TABLE_MAP);

    constructor() {
        super("GTFS");
        this.instance = this.newInstance();
    }

    async newInstance() {
        const agenciesData = await fetch('https://api.511.org/transit/gtfsoperators?api_key=7cf5660e-215b-489d-87b1-78bb3ee006b7');
        this.agencies = (await agenciesData.json()).filter(agency => TransitAccess.SUPPORTED_AGENCIES.includes(agency['Id']));
        const version = this.agencies.reduce((acc, agency) => acc + new Date(agency['LastGenerated']).getTime(), 0);

        let openedDb;
        let verno;
        try {
            openedDb = await this.open();
            verno = openedDb.verno;
            if (version > verno) {
                this.needsUpdate = true;
                const lastGenerated = await openedDb.table('LastGenerated').toArray();
                // console.log(new Date(this.agencies[0]['LastGenerated']) > new Date(lastGenerated.find(obj => obj['Id'] === this.agencies[0]['Id'])['LastGenerated']))
                this.agencies = this.agencies.filter(agency => !lastGenerated.find(obj => obj['Id'] === agency['Id']) || new Date(agency['LastGenerated']) > new Date(lastGenerated.find(obj => obj['Id'] === agency['Id'])['LastGenerated']));
            }
        } catch(e) {
            console.log(e)
            this.firstTime = true;
            this.needsUpdate = true;
        } finally {
            if (openedDb) openedDb.close();
        }
        // throw new Error();
        
        const schema = Object.fromEntries(TransitAccess.TABLES.map(table => [ table, ['id'].concat(TransitAccess.TABLE_MAP[table].includes('agency_id') ? [] : [ 'agency_id' ]).concat(TransitAccess.TABLE_MAP[table].length > 1 ? `[${TransitAccess.TABLE_MAP[table].join('+')}]` : TransitAccess.TABLE_MAP[table][0]).join(', ') ]));
        
        this.version(version).stores(schema);
        await this.open();

        return this;
    }

    async batchAdd(func) {
        const currentTable = TransitAccess.TABLES.find(table => this.queue[table].length > 0);
        const batch = this.queue[currentTable].splice(0, TransitAccess.PROCESSING_COUNT);
        const startTime = new Date();
        console.log(`Writing ${batch.length} records to table "${currentTable}"`);
        await this.table(currentTable).bulkAdd(batch);
        const timeElapsed = new Date(new Date() - startTime);
        console.log(`Finished in ${timeElapsed.getSeconds()} sec, ${timeElapsed.getMilliseconds()} ms`);
        this.currentQueue += batch.length;
        self.postMessage(this.currentQueue / this.totalQueue);
        if (Object.values(this.queue).reduce((acc, queue) => acc + queue.length) > 0) this.batchAdd();
    }
}