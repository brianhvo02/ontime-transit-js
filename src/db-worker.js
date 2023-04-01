import TransitAccess from "./scripts/transitAccess";
import { csvParse, autoType } from 'd3';
import { ZipReader, BlobReader, TextWriter } from "@zip.js/zip.js";

const access = await new TransitAccess().instance;
self.postMessage('Loaded db-worker.js');

if (access.needsUpdate) {
    self.postMessage('Running update.');

    const agencyPromises = access.agencies.map(async agency => {
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

    const data = Object.fromEntries(await Promise.all(agencyPromises));
    self.postMessage('Data received.');

    if (!access.firstTime) {
        const clearTables = access.tables.map(table => table.where('agency_id').anyOf(access.agencies.map(agency => agency['Id'])).delete());
        await Promise.all(clearTables);
        self.postMessage('Cleared tables.')
    }
    
    for (let agency_id in data) {
        const agency = data[agency_id];
        for (let table in agency) {
            if (TransitAccess.TABLES.includes(table)) {
                const records = agency[table].map(record => {
                    return { 
                        id: [ agency_id ].concat(TransitAccess.TABLE_MAP[table].map(id => record[id])).join('_'),
                        agency_id,
                        ...record 
                    } 
                });
    
                access.queue[table] = access.queue[table].concat(records);
            }
        }
    }

    access.queue['LastGenerated'] = access.agencies.map(agency => {
        agency.id = agency.Id;
        return agency;
    });

    access.totalQueue = Object.values(access.queue).reduce((acc, arr) => acc + arr.length, 0);
    access.currentQueue = 0;
    
    access.batchAdd();
}

postMessage('completed');