import initSqlJs from 'sql.js';
import Timer from './timer';
import localforage from 'localforage';

export default class TransitAccess {
    constructor() {
        this.instance = this.initialize();
    }

    async initialize() {
        const loadTimer = new Timer('load');
        this.agencies = localStorage.getItem('agencies');
        if (!this.agencies) {
            const agenciesData = await fetch('https://api.511.org/transit/gtfsoperators?api_key=7cf5660e-215b-489d-87b1-78bb3ee006b7').then(res => res.json());
            this.agencies = agenciesData.filter(agency => agency['Id'] !== 'RG');
            localStorage.setItem('agencies', JSON.stringify(this.agencies));
        } else {
            this.agencies = JSON.parse(this.agencies);
        }
        const SQL = await initSqlJs();
        this.databases = [];

        this.agencies = await Promise.all(this.agencies.map(async agency => {
            const dbChecksumRemote = await fetch(`https://brianhvo02.github.io/ontime-transit-feeds/checksums/${agency['Id']}.checksum`).then(res => res.text());
            const dbChecksumLocal = await localforage.getItem(`${agency['Id']}_checksum`);
            let dbFile;
            if (dbChecksumLocal && dbChecksumLocal === dbChecksumRemote) {
                dbFile = await localforage.getItem(`${agency['Id']}_db`);
            } else {
                dbFile = await fetch(`https://brianhvo02.github.io/ontime-transit-feeds/feeds/${agency['Id']}.db`).then(res => res.arrayBuffer());
                localforage.setItem(`${agency['Id']}_db`, dbFile);
                localforage.setItem(`${agency['Id']}_checksum`, dbChecksumRemote);
            }
            const database = new SQL.Database(new Uint8Array(dbFile));
            this.databases.push(database);
            return { database, ...agency };
        }));
        loadTimer.stop();
        return this;
    }

    wrap(dbRes) {
        if (dbRes.length === 0) return [];
        return dbRes[0].values.map(row => Object.fromEntries(row.map((value, i) => [ dbRes[0].columns[i], value ])));
    }

    wrapAgency(agency_id, dbRes) {
        if (dbRes.length === 0) return [];
        return dbRes[0].values.map(row => { 
            return {
                agency_id,
                ...Object.fromEntries(row.map((value, i) => [ dbRes[0].columns[i], value ])) 
            }
        });
    }
    
    execOnAll(query) {
        return this.databases.map(db => this.wrap(db.exec(query))).flat();
    }

    execOnAgency(agency_id, query, debug) {
        if (debug) console.log(query);
        return this.wrap(this.agencies.find(agency => agency['Id'] === agency_id).database.exec(query));
    }

    execOnAllAgency(query) {
        return this.agencies.map(agency => this.wrapAgency(agency['Id'], agency.database.exec(query)));
    }
}