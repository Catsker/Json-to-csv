const fs = require('fs');
const path = require('path');
const { getGoogleDriveClient } = require('../services/google.service');

async function uploadToGoogleDrive(filePath, folderId) {
    const drive = getGoogleDriveClient();
    const fileName = path.basename(filePath);

    const fileMetadata = {
        name: fileName,
        parents: folderId ? [folderId] : []
    };

    const media = {
        mimeType: 'text/csv',
        body: fs.createReadStream(filePath)
    };

    const response = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink'
    });

    return response.data;
}

module.exports = async function uploaderAction(options) {
    try {
        console.log('--- START UPLOADING TO THE GOOGLE DRIVE ---');
        const startTime = Date.now();

        const absoluteFilePath = path.resolve(options.file);
        if (!fs.existsSync(absoluteFilePath)) {
            throw new Error(`File not found: ${absoluteFilePath}`);
        }

        const folderId = options.folder || process.env.GOOGLE_DRIVE_FOLDER_ID;

        const fileData = await uploadToGoogleDrive(absoluteFilePath, folderId);

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log(`Uploading completed in ${duration} sec!`);
        console.log(`File ID: ${fileData.id}`);
        console.log(`Direct Link: ${fileData.webViewLink}`);
        if (folderId) {
            console.log(`Target Folder: https://drive.google.com/drive/folders/${folderId}`);
        }
    } catch (error) {
        console.error('Error uploading:', error.message);
        process.exit(1);
    }
};
