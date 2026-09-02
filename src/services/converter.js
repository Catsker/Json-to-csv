const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');

const CustomJsonParser = require('../utils/jsonParser');
const JsonToCsvTransform = require('../utils/csvTransform');

async function convertJsonToCsv(sourceFilePath, resultFilePath, separator = ',') {
    const dir = path.dirname(resultFilePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const readStream = fs.createReadStream(sourceFilePath, {
        highWaterMark: 64 * 1024 * 1024
    });
    const writeStream = fs.createWriteStream(resultFilePath, {
        highWaterMark: 64 * 1024 * 1024
    });

    await pipeline(
        readStream,
        new CustomJsonParser(),
        new JsonToCsvTransform(separator),
        writeStream
    );

    return resultFilePath;
}

module.exports = { convertJsonToCsv };
