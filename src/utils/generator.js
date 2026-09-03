const fs = require('fs');
const path = require('path');

const gbToBytes = (gb) => Math.round(Number(gb) * 1024 * 1024 * 1024);

async function generateLargeJson(outputPath, targetSizeBytes, templateArray) {
    return new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(outputPath);

        writeStream.write('[\n');
        let currentBytes = 2;
        let i = 0;

        function writeChunk() {
            let canWrite = true;
            while (currentBytes < targetSizeBytes && canWrite) {
                const item = templateArray[i % templateArray.length];
                const chunk = JSON.stringify(item) + (currentBytes + 1024 < targetSizeBytes ? ',\n' : '\n');
                const chunkBytes = Buffer.byteLength(chunk, 'utf8');

                canWrite = writeStream.write(chunk);
                currentBytes += chunkBytes;
                i++;
            }

            if (currentBytes >= targetSizeBytes) {
                writeStream.write(']');
                writeStream.end();
            } else {
                writeStream.once('drain', writeChunk);
            }
        }

        writeStream.on('error', reject);
        writeStream.on('finish', resolve);

        writeChunk();
    });
}

module.exports = async function generatorAction(options) {
    try {
        const absoluteTemplatePath = path.resolve(options.template);
        const absoluteOutputPath = path.resolve(options.output);
        const targetSizeBytes = gbToBytes(options.size);

        console.log('--- START GENERATION ---');
        console.log(`Size: ${options.size} GB (${targetSizeBytes} b)`);

        if (!fs.existsSync(absoluteTemplatePath)) {
            throw new Error(`The template file was not found: ${absoluteTemplatePath}`);
        }

        const templateData = JSON.parse(fs.readFileSync(absoluteTemplatePath, 'utf8'));
        const templateArray = Array.isArray(templateData) ? templateData : [templateData];

        const startTime = Date.now();

        const folderPath = path.dirname(absoluteOutputPath);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        await generateLargeJson(absoluteOutputPath, targetSizeBytes, templateArray);

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`Generation completed successfully in ${duration} sec!`);
    } catch (error) {
        console.error('Generation error:', error.message);
        process.exit(1);
    }
};
