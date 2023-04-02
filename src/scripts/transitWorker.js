export default class TransitWorker extends EventTarget {
    data = {};

    constructor(checkUpdate, dbVersion) {
        super();
        
        this.worker = new Worker(new URL('./dbWorker.js', import.meta.url));
        this.worker.onmessage = e => this.manageMessage(e, checkUpdate, dbVersion);
        this.checkUpdate = checkUpdate;
        this.worker.postMessage({
            message: 'startAccess',
            payload: { checkUpdate, dbVersion }
        });
    }

    async send(message, payload) {
        this.worker.postMessage({ message, payload });
    }

    async manageMessage(e) {
        if (e.data.message.includes('get_')) {
            const tableName = e.data.message.slice(4);
            this.data[tableName] = e.data.payload;
            this.dispatchEvent(new Event(e.data.message));
        } else {
            switch (e.data.message) {
                case 'dbLoaded':
                    this.dispatchEvent(new Event('dbLoaded'));
                    localStorage.setItem('dbVersion', e.data.payload.version); 
                    if (this.checkUpdate) localStorage.setItem('dateLastChecked', new Date().getTime().toString());
                    break;
                case 'updateProgress':
                    if (e.data.payload.progress === 1) {
                        this.feedProgress = 'Feed downloaded.';
                    } else {
                        this.feedProgress = `Feed ${Math.round(e.data.payload.progress * 100)}% downloaded.`;
                    }
                    this.dispatchEvent(new Event('updateProgress'));
                    break;
                case 'log':
                    console.log(e.data.payload.message);
                    break;
                default:
                    console.log(`${e.data.message} not yet implemented!`);
            }
        }
    }

    async getTable(table) {
        return new Promise(resolve => {
            const handler = () => {
                resolve(this.data[table]);
                this.removeEventListener(`get_${table}`, handler);
            }
            this.addEventListener(`get_${table}`, handler);
            this.send(`get_${table}`);
        })
    }
}