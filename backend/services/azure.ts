export class Azure {
    containerName: string;
    connectionString: string;
    fileName: string;
    blobService: any;
    getStream: (buffer: Buffer) => any
    constructor(data: any) {
        this.containerName = process.env.AZURE_STORAGE_CONTAINER_NAME!
        this.connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!
        const { BlockBlobClient } = require('@azure/storage-blob');
        this.getStream = require('into-stream')
        this.fileName = data.blobName
        this.blobService = new BlockBlobClient(process.env.AZURE_STORAGE_CONNECTION_STRING,this.containerName,this.fileName)
    }
    async getBlogUrlFromBase (base64: string) {
        const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if(matches?.length) {
            var type = matches[1];
            var buffer = Buffer.from(matches[2], 'base64');
            const stream = this.getStream(buffer)
            const streamLength = buffer.length
            try {
                const res = await this.blobService.uploadStream(stream,streamLength)
                return {
                    url:  `${process.env.AZURE_STORAGE_BASE_URL}/${this.fileName}`
                }
            } catch (e) {
                throw e
            } 
        } else {
            throw "Base 64 format is invalid"
        }

    }
}