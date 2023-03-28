import axios from "axios";
const fs = require('fs')
export const fileCreate = (options: any) => axios({url: options.image, responseType: 'stream'}).then((response) => {
    return new Promise((resolve, reject) => {
        response.data
          .pipe(fs.createWriteStream('test-image.png'))
          .on('finish', () => resolve('done'))
          .on('error', (e: any) => reject(e));
      })
})

export const getFileExtension = (filename: any) => {
    return filename.toLowerCase().split(".").pop();
};