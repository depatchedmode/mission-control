export class DummyStorageAdapter {
    #data = {};
    #keyToString(key) {
        return key.join(".");
    }
    #stringToKey(key) {
        return key.split(".");
    }
    async loadRange(keyPrefix) {
        const range = Object.entries(this.#data)
            .filter(([key, _]) => key.startsWith(this.#keyToString(keyPrefix)))
            .map(([key, data]) => ({ key: this.#stringToKey(key), data }));
        return Promise.resolve(range);
    }
    async removeRange(keyPrefix) {
        Object.entries(this.#data)
            .filter(([key, _]) => key.startsWith(this.#keyToString(keyPrefix)))
            .forEach(([key, _]) => delete this.#data[key]);
    }
    async load(key) {
        return new Promise(resolve => resolve(this.#data[this.#keyToString(key)]));
    }
    async save(key, binary) {
        this.#data[this.#keyToString(key)] = binary;
        return Promise.resolve();
    }
    async remove(key) {
        delete this.#data[this.#keyToString(key)];
    }
    keys() {
        return Object.keys(this.#data);
    }
}
