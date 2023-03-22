const getStream = require('into-stream')
const express = require("express");
const multer = require("multer");
const { BlockBlobClient } = require('@azure/storage-blob');
const router = express.Router();
const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({ storage: inMemoryStorage }).single('file');

const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

const getBlobName = (originalName: any) => {
    return `blogs/${originalName}`;
};


router.post('/', uploadStrategy, async (req: any, res: any) => {
    const
          blobName = getBlobName(req.file.originalname)
        , blobService = new BlockBlobClient(process.env.AZURE_STORAGE_CONNECTION_STRING,containerName,blobName)
        , stream = getStream(req.file.buffer)
        , streamLength = req.file.buffer.length
    ;
    blobService.uploadStream(stream, streamLength)
    .then(
        (data: any)=>{
            res.status(200).send({ 
                message: 'File uploaded to Azure Blob storage.',
                url:  `${process.env.AZURE_STORAGE_BASE_URL}/${blobName}`
            });
        }
    ).catch(
        (err: any)=>{
        console.log(err)
        if(err) {
            // handleError(err, res);
            res.status(500);
            res.send({ 
                type: 'ERROR',
                message:  err.message
            });
        }
    })    
})

module.exports = router