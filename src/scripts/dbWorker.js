import Dexie from "dexie";
import TransitAccess from "./transitAccess";

/*

e.data: {
    message: string;
    payload?: {
        [key: string]: string;
    }
}

*/

const send = async (message, payload) => {
    postMessage({ message, payload });
}

const log = message => {
    send('log', { message });
}

let transitAccess;

self.onmessage = async e => {
    if (e.data.message.includes('get')) {
        if (transitAccess) {
            const [ _, command ] = e.data.message.split('_');
            const { table, key, value } = e.data.payload;
            let data;
            switch (command) {
                case 'all':
                    data = await transitAccess.table(table).toArray();
                    break;
                case 'where':
                    if (value) {
                        data = await transitAccess.table(table).where(key).equals(value).toArray();
                    } else {
                        data = await transitAccess.table(table).where(key).toArray();
                    }
                    break;
                case 'whereFirst':
                    if (value) {
                        data = await transitAccess.table(table).where(key).equals(value).first();
                    } else {
                        data = await transitAccess.table(table).where(key).first();
                    }
                    break;
                case 'whereCount':
                    if (value) {
                        data = await transitAccess.table(table).where(key).equals(value).count();
                    } else {
                        data = await transitAccess.table(table).where(key).count();
                    }
                    break;
                default:
                    log(`${e.data.message} not yet implemented!`);
            }
            send(`${e.data.message}_${table}`, data);
        } else {
            log('Database not yet loaded!');
            send(e.data.message, 'Database not yet loaded!');
        }
    } else {
        switch (e.data.message) {
            case 'startAccess':
                const checkUpdate = e.data.payload.checkUpdate;
                const dbVersion = e.data.payload.dbVersion;
    
                transitAccess = await new TransitAccess(checkUpdate, dbVersion, log, send).instance;
                send('dbLoaded', {
                    version: transitAccess.verno
                });
                break;

            default:
                log(`${e.data.message} not yet implemented!`);
        }
    }
    
};

log('Loaded db-worker.js');