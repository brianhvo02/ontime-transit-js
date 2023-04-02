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
    if (e.data.message.includes('get_')) {
        if (transitAccess) {
            const tableName = e.data.message.slice(4);
            const table = await transitAccess.table(tableName).toArray();
            send(e.data.message, table);
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