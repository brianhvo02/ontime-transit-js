export default class Timer {
    constructor(name) {
        this.name = name;
        this.start = new Date();
    }

    stop() {
        const elapsed = new Date(new Date() - this.start);
        console.log(`Finished "${this.name}" in ${elapsed.getMinutes()}m, ${elapsed.getSeconds()}s, ${elapsed.getMilliseconds()}ms`)
    }
}