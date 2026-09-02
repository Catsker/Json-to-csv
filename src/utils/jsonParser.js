const { Transform } = require('stream');

class CustomJsonParser extends Transform {
    constructor() {
        super({ objectMode: true });
        this.buffer = '';
    }

    _transform(chunk, encoding, callback) {
        this.buffer += chunk.toString('utf8');

        let startIndex = this.buffer.indexOf('{');
        let endIndex = this.buffer.indexOf('}');

        while (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
            const jsonStr = this.buffer.slice(startIndex, endIndex + 1);

            try {
                const parsedObject = JSON.parse(jsonStr);

                this.push(parsedObject);

                this.buffer = this.buffer.slice(endIndex + 1);
            } catch (err) {
                endIndex = this.buffer.indexOf('}', endIndex + 1);
                continue;
            }

            startIndex = this.buffer.indexOf('{');
            endIndex = this.buffer.indexOf('}');
        }

        callback();
    }

    _flush(callback) {
        this.buffer = '';
        callback();
    }
}

module.exports = CustomJsonParser;
