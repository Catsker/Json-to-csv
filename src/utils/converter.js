const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');
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
                this.push(JSON.parse(jsonStr));
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

async function convertJsonToCsv(inputPath, outputPath, separator) {
    const readStream = fs.createReadStream(inputPath);
    const writeStream = fs.createWriteStream(outputPath);
    const jsonParser = new CustomJsonParser();
    const csvTransform = new JsonToCsvTransform(separator);

    await pipeline(readStream, jsonParser, csvTransform, writeStream);
}

module.exports = async function converterAction(options) {
    try {
        const absoluteSource = path.resolve(options.input);
        const absoluteResult = path.resolve(options.output);

        console.log('--- START CONVERTATION ---');
        const startTime = Date.now();

        await convertJsonToCsv(absoluteSource, absoluteResult, options.separator);

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`Convertation completed in ${duration} sec!`);
    } catch (error) {
        console.error('Error convertation:', error.message);
        process.exit(1);
    }
};
