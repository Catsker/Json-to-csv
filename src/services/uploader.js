const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

function getDriveClient() {
    const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI || 'https://developers.google.com/oauthplayground';
    const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error('The .env file does not contain the keys required to connect to Google Drive (CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN).');
    }

    const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUri
    );

    oauth2Client.setCredentials({ refresh_token: refreshToken });

    return google.drive({ version: 'v3', auth: oauth2Client });
}

async function uploadToGoogleDrive(filePath, folderId = process.env.GOOGLE_DRIVE_FOLDER_ID) {
    const absolutePath = path.resolve(filePath);

    if (!fs.existsSync(absolutePath)) {
        throw new Error(`The file to upload was not found at the specified path: ${absolutePath}`);
    }

    const drive = getDriveClient();
    const fileName = path.basename(absolutePath);

    const fileMetadata = {
        name: fileName,
        parents: folderId ? [folderId] : []
    };

    const media = {
        mimeType: 'text/csv',
        body: fs.createReadStream(absolutePath)
    };

    console.log(`Start uploading the file "${fileName}" to the Google Drive...`);

    const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink'
    });

    console.log(`The file uploaded successfully!`);
    console.log(`Link: ${response.data.webViewLink}`);

    return response.data.id;
}

module.exports = { uploadToGoogleDrive };
