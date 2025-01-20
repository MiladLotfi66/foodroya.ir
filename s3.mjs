import { S3Client, ListObjectsCommand, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
dotenv.config();

// برای استفاده از __dirname در ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const domain = process.env.S3_ENDPOINT;
const bucketName = 'c716244';
// const bucketName = 'nibero';
const accessKey = process.env.S3_ACCESSKEY;
const secretkey = process.env.S3_SECRETKEY;

const s3 = new S3Client({
    region: 'default',
    endpoint: domain,
    forcePathStyle: true,
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretkey,
    },
});
console.log("domain",domain,"bucketName",bucketName,"accessKey",accessKey,"secretkey",secretkey);


const run = async () => {
    try {
        const action = process.argv[2];
        switch (action) {
            case 'list':
                const listResponse = await s3.send(new ListObjectsCommand({ Bucket: bucketName }));
                console.log('Files in bucket:', listResponse.Contents);
                break;
            case 'put':
                const putFile = path.join(__dirname, 'parspack.png');
                const putFilePath = 'parspack.png';
                const putFileStream = fs.createReadStream(putFile);
                const uploadParams = {
                    Bucket: bucketName,
                    Key: putFilePath,
                    ACL: 'public-read',
                    Body: putFileStream,
                };
                
                putFileStream.on('error', (err) => {
                    console.error('File Error', err);
                });
                
                try {
                    const uploadData = await s3.send(new PutObjectCommand(uploadParams));
                    console.log('File uploaded successfully', uploadData);
                } catch (err) {
                    console.error('Upload Error', err);
                }
                break;
            case 'get':
                const getFilePath = 'parspack.png';
                const getParams = { Bucket: bucketName, Key: getFilePath };
                const getData = await s3.send(new GetObjectCommand(getParams));
                const downloadPath = path.join(__dirname, 'parspack-downloaded.png');
                const writeStream = fs.createWriteStream(downloadPath);
                
                getData.Body.pipe(writeStream);
                writeStream.on('close', () => {
                    console.log('File downloaded successfully');
                });
                break;
            case 'delete':
                const deleteFilePath = 'parspack.png';
                const deleteParams = { Bucket: bucketName, Key: deleteFilePath };
                const deleteData = await s3.send(new DeleteObjectCommand(deleteParams));
                console.log('File deleted successfully', deleteData);
                break;
            default:
                console.log('Please provide a valid action: list | put | get | delete');
        }
    } catch (err) {
        console.error('Upload Error', err);
        if (err.$response) {
            console.error('Raw Response:', err.$response);
        }    }
};

run();
