const fs = require('fs');
const path = require('path');

function generateLargeJson(outputFilePath, targetSizeBytes, templateArray) {
    return new Promise((resolve, reject) => {
        const dir = path.dirname(outputFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const writeStream = fs.createWriteStream(outputFilePath, {
            highWaterMark: 64 * 1024 * 1024
        });

        let currentSize = 0;
        let templateIndex = 0;
        let isFirstItem = true;

        writeStream.write('[\n');

        function writeChunk() {
            let canWrite = true;

            while (canWrite && currentSize < targetSizeBytes) {
                const item = templateArray[templateIndex];
                templateIndex = (templateIndex + 1) % templateArray.length;

                const prefix = isFirstItem ? '' : ',\n';
                const jsonString = prefix + JSON.stringify(item);

                isFirstItem = false;

                const byteSize = Buffer.byteLength(jsonString, 'utf8');
                currentSize += byteSize;

                canWrite = writeStream.write(jsonString);
            }

            if (currentSize >= targetSizeBytes) {
                writeStream.write('\n]');
                writeStream.end();
            } else if (!canWrite) {
                writeStream.once('drain', writeChunk);
            }
        }

        writeStream.on('finish', () => {
            resolve(outputFilePath);
        });

        writeStream.on('error', (error) => {
            reject(error);
        });

        writeChunk();
    });
}

module.exports = { generateLargeJson };
