const axios = require('axios')
export const  getBase64Image = async (img: any)  => {
    var request = require('request').defaults({ encoding: null });
    console.log(img)
    // request.get(img, (error: any, response: any, body: any) =>  {
    //     if (!error && response.statusCode == 200) {
    //         const data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
    //         return data
    //     } else {
    //         console.log(error)
    //         return error
    //     }
    // });
    let image = await axios.get(img, {responseType: 'arraybuffer'});
    let returnedB64 = Buffer.from(image.data).toString('base64');
    return "data:" + image.headers["content-type"] + ";base64," + returnedB64;
}