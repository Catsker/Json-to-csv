#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { program } = require('commander');
const { generateLargeJson } = require('./services/generator');
const { convertJsonToCsv } = require('./services/converter');
const { uploadToGoogleDrive } = require('./services/uploader');

const gbToBytes = (gb) => Math.round(Number(gb) * 1024 * 1024 * 1024);

program
    .name('json-to-csv-cli')
    .description('A CLI-utility for generating and processing gigabyte‑sized JSON files.')
    .version('1.0.0');

program
    .command('generate')
    .description('Generation of the big JSON-file based on the example')
    .option('-s, --size <gb>', 'File size in GB', process.env.TARGET_SIZE_GB || '10')
    .option('-t, --template <path>', 'Path to the template', process.env.TEMPLATE_PATH || path.join(__dirname, '../assets/test.json'))
    .option('-o, --output <path>', 'Path to save', process.env.SOURCE_PATH || path.join(process.cwd(), 'source.json'))
    .action(async (options) => {
        try {
            const absoluteTemplatePath = path.resolve(options.template);
            const absoluteOutputPath = path.resolve(options.output);
            const targetSizeBytes = gbToBytes(options.size);

            console.log('--- START GENERATION ---');
            console.log(`Size: ${options.size} GB (${targetSizeBytes} b)`);
            console.log(`Template: ${absoluteTemplatePath}`);
            console.log(`Output file: ${absoluteOutputPath}`);

            if (!fs.existsSync(absoluteTemplatePath)) {
                throw new Error(`The template file was not found at the specified: ${absoluteTemplatePath}`);
            }

            const templateData = JSON.parse(fs.readFileSync(absoluteTemplatePath, 'utf8'));
            const templateArray = Array.isArray(templateData) ? templateData : [templateData];

            const startTime = Date.now();
            await generateLargeJson(absoluteOutputPath, targetSizeBytes, templateArray);

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`Generation completed successfully in ${duration} sec!`);
        } catch (error) {
            console.error('Generation error:', error.message);
            process.exit(1);
        }
    });

program
    .command('convert')
    .description('Convert JSON to CSV')
    .option('-s, --separator <char>', 'Separator', ',')
    .option('-i, --input <path>', 'Input JSON path', process.env.SOURCE_PATH || path.join(process.cwd(), 'source.json'))
    .option('-o, --output <path>', 'Output CSV path', process.env.RESULT_PATH || path.join(process.cwd(), 'result.csv'))
    .action(async (options) => {
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
    });

program
    .command('upload')
    .description('Upload generated CSV-file to Google Drive')
    .option('-f, --file <path>', 'Path to the file', process.env.RESULT_PATH || path.join(process.cwd(), 'result.csv'))
    .option('-F, --folder <id>', 'Folder ID on Google Drive', process.env.GOOGLE_DRIVE_FOLDER_ID)
    .action(async (options) => {
        try {
            console.log('--- START UPLOADING TO THE GOOGLE DRIVE ---');
            const startTime = Date.now();

            await uploadToGoogleDrive(options.file, options.folder);

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`Uploading completed in ${duration} sec!`);
        } catch (error) {
            console.error('Error uploading:', error.message);
            process.exit(1);
        }
    });

if (process.argv.length <= 2) {
    program.outputHelp();
} else {
    program.parse();
}
