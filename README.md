# JSON to CSV CLI Tool

A robust, memory-efficient Node.js CLI utility designed for generating, converting, and uploading gigabyte-sized JSON files to Google Drive without loading entire datasets into memory.

Built with **zero external dependencies** for JSON stream parsing, ensuring low RAM footprint even with large (10GB+) files.

---

## Features

- **Streaming Architecture:** Uses custom Node.js `Transform` streams to process multi-gigabyte JSON files chunk-by-chunk without hitting V8 `heap out of memory` limits.
- **Zero-Dependency Core:** Custom-built JSON chunk parser replacing heavy third-party parsing dependencies.
- **Data Generator:** Generates large mock JSON datasets based on custom templates for benchmark testing.
- **Google Drive Integration:** Automates uploading converted CSV result files directly to a designated Google Drive folder via OAuth 2.0.
- **Flexible Configuration:** Fully configurable via CLI flags, `.env` file environment variables, or fallback defaults.

---

## Installation

### Global Installation (CLI Utility)
```bash
npm install -g catsker-jsontocsv
```

### Local Development / Repository Setup
```bash
git clone https://github.com/Catsker/Json-to-csv.git
cd Json-to-csv
npm install
```

---

## Environment Setup

Create a `.env` file in the root directory (or copy `.env.example`):

```env
# Generation & Conversion Paths
TARGET_SIZE_GB=10
TEMPLATE_PATH=assets/test.json
SOURCE_PATH=assets/source.json
RESULT_PATH=assets/result.csv

# Google Drive API (OAuth 2.0)
GOOGLE_DRIVE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_DRIVE_CLIENT_SECRET=your_client_secret
GOOGLE_DRIVE_REDIRECT_URI=https://developers.google.com/oauthplayground
GOOGLE_DRIVE_REFRESH_TOKEN=your_refresh_token
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
```

---

## Usage

### 1. Generate Large JSON Dataset
Generate a mock JSON array file according to a schema template:

```bash
# Using default options (or values from .env)
catker-json-to-csv generate

# Custom target size (e.g., 0.01 GB / ~10MB) and output path
catker-json-to-csv generate --size 0.01 --output ./data/sample.json --template ./my-template.json
```

**Options:**
- `-s, --size ` — Target file size in GB (Default: `10` or `TARGET_SIZE_GB`).
- `-t, --template ` — Path to JSON structure template (Default: `TEMPLATE_PATH` or package default).
- `-o, --output ` — Output JSON file path (Default: `SOURCE_PATH` or `./source.json`).

---

### 2. Convert JSON to CSV
Stream-convert the generated JSON file to CSV:

```bash
catker-json-to-csv convert

# Custom input/output paths and separator
catker-json-to-csv convert --input ./data/sample.json --output ./data/result.csv --separator ";"
```

**Options:**
- `-i, --input ` — Input JSON file path (Default: `SOURCE_PATH` or `./source.json`).
- `-o, --output ` — Target CSV file path (Default: `RESULT_PATH` or `./result.csv`).
- `-s, --separator ` — CSV column separator character (Default: `,`).

---

### 3. Upload Result to Google Drive
Upload the converted CSV file to Google Drive:

```bash
catker-json-to-csv upload

# Custom file and folder target
catker-json-to-csv upload --file ./data/result.csv --folder 1A2b3C4d5E6f7G8h9I0j
```

**Options:**
- `-f, --file ` — File path to upload (Default: `RESULT_PATH` or `./result.csv`).
- `-F, --folder ` — Destination Google Drive Folder ID (Default: `GOOGLE_DRIVE_FOLDER_ID`).

---

## Project Structure

```text
├── assets/
│   └── test.json             # Default schema template
├── src/
│   ├── main.js               # CLI Entry point & Commander setup
│   └── services/
│       ├── generator.js      # Stream-based mock JSON file writer
│       ├── jsonParser.js     # Custom Transform stream for memory-safe JSON chunk parsing
│       ├── converter.js      # Stream-based JSON to CSV transformer
│       └── uploader.js       # Google Drive OAuth2 upload service
├── .env.example              # Environment variables template
├── package.json
└── README.md
```
