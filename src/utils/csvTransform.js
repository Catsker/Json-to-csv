const { Transform } = require('stream');

class JsonToCsvTransform extends Transform {
    constructor(separator = ',') {
        super({ objectMode: true });
        this.separator = separator;
        this.isFirst = true;
    }

    _transform(chunk, encoding, callback) {
        const obj = chunk.value || chunk;

        if (this.isFirst) {
            const headers = Object.keys(obj).join(this.separator);
            this.push(headers + '\n');
            this.isFirst = false;
        }

        const row = Object.values(obj).map(val => {
            let str = String(val);
            if (str.includes(this.separator) || str.includes('"') || str.includes('\n')) {
                str = `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        }).join(this.separator);

        this.push(row + '\n');

        callback();
    }
}

module.exports = JsonToCsvTransform;
