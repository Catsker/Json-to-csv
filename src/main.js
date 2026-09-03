#!/usr/bin/env node

const path = require('path');
require('dotenv').config();
const { program } = require('commander');

const generatorAction = require('./utils/generator');
const converterAction = require('./utils/converter');
const uploaderAction = require('./utils/uploader');

program
    .name('json-to-csv-cli')
    .description('A CLI-utility for generating and processing gigabyte-sized JSON files.')
    .version('1.0.0');

program
    .command('generate')
    .description('Generation of the big JSON-file based on the example')
    .option('-s, --size <gb>', 'File size in GB', process.env.TARGET_SIZE_GB || '10')
    .option('-t, --template <path>', 'Path to the template', process.env.TEMPLATE_PATH || path.join(__dirname, '../assets/test.json'))
    .option('-o, --output <path>', 'Path to save', process.env.SOURCE_PATH || path.join(process.cwd(), 'source.json'))
    .action(generatorAction);

program
    .command('convert')
    .description('Convert JSON to CSV')
    .option('-s, --separator <char>', 'Separator', ',')
    .option('-i, --input <path>', 'Input JSON path', process.env.SOURCE_PATH || path.join(process.cwd(), 'source.json'))
    .option('-o, --output <path>', 'Output CSV path', process.env.RESULT_PATH || path.join(process.cwd(), 'result.csv'))
    .action(converterAction);

program
    .command('upload')
    .description('Upload generated CSV-file to Google Drive')
    .option('-f, --file <path>', 'Path to the file', process.env.RESULT_PATH || path.join(process.cwd(), 'result.csv'))
    .option('-F, --folder <id>', 'Folder ID on Google Drive', process.env.GOOGLE_DRIVE_FOLDER_ID)
    .action(uploaderAction);

program.parse();
