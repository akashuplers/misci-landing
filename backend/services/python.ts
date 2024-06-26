import axios from "axios"
import FormData from "form-data"

const fs = require('fs')
export class Python {
    userId: string | null
    companyId: string
    constructor(data: {
        userId: string | null
    }) {
        this.userId = data.userId
        this.companyId = "nowigence"
    }

    async uploadUrl(data: {
        url: string
    }) {
        try {
            const uploadData = JSON.stringify(
                {
                    "user_id": this.userId,
                    "company_id": this.companyId,
                    "url": data.url,
                    "share_all": false,
                    "user_relationship_type": "default",
                    "user_relationship_value": "default",
                    "tags": [],
                    "share_to": []
                }
            );
            console.log(uploadData)  
            const config: any = {
                method: 'post',
                url: `${process.env.PYTHON_REST_BASE_ENDPOINT}/quick_upload/url`,
                headers: { 
                    'Content-Type': 'application/json'
                },
                data : uploadData
            };
            const pythonRes = await axios(config)
            console.log(pythonRes.data, "python response for url")
            if(pythonRes.data && pythonRes.data.length) {
                return pythonRes.data[0]
            }
        }catch(e){
            console.log(e, "error from python")
            throw e
        }
    }
    async uploadKeyword(data: {
        keyword: String,
        timeout?: number
    }) {
        try {
            const uploadData = JSON.stringify(
                {
                    "userId": this.userId,
                    "comp": "nowigence",
                    "topic": `${data.keyword}`,
                    "topicType": "other",
                    "subscriptionReason": "Select how this topic relates to you",
                    "excludedTopicKeywords": [],
                    "marketCode": [
                      "en-US"
                    ]
                }
            );
            const config: any = {
                method: 'post',
                url: `${process.env.PYTHON_REST_BASE_ENDPOINT}/topics_check`,
                headers: { 
                    'Content-Type': 'application/json'
                },
                data : uploadData,
                timeout: data.timeout || 0
            };
            console.log(config)
            const pythonRes = await axios(config)
            console.log(pythonRes.data, pythonRes)
            return pythonRes.data
        }catch(e){
            console.log(e, "error from python")
            console.log(e?.response?.data, "error from python")
            throw e
        }
    }

    async uploadFile(data: {
        file: any
    }) {
        console.log(data.file)
        const file = await data.file.buffer
        var buffer = Buffer.from(file, 'base64');
        const newFileName = data.file.originalname;
        await fs.writeFileSync(`./${newFileName}`, buffer);
        const formData = new FormData()
        formData.append('user_id', this.userId)
        formData.append('company_id', this.companyId)
        formData.append('files', fs.createReadStream(data.file.originalname))
        try {
            const config: any = {
                method: 'post',
                url: `${process.env.PYTHON_REST_BASE_ENDPOINT}/quick_upload/file`,
                headers: { 
                    ...formData.getHeaders()
                },
                data : formData,
            };
            const pythonRes = await axios(config)
            await fs.unlinkSync(data.file.originalname)
            console.log(pythonRes.data, "python response for file")
            if(pythonRes.data && pythonRes.data.length) {
                return pythonRes.data[0]
            }
        }catch(e){
            console.log(e, "error from python")
            console.log(e.response.data, "error from python")
            throw e
        }
    }

    async getReferences(data: {
        text: string,
        article_ids?: string[]
    }) {
        try {
            const uploadData = JSON.stringify(
                {
                    text: data.text,
                    article_ids: data.article_ids
                }
            );
            const config: any = {
                method: 'post',
                url: `${process.env.PYTHON_REST_BASE_ENDPOINT_BACKLINGING}/backlinking_url`,
                headers: { 
                    'Content-Type': 'application/json'
                },
                data : uploadData,
                timeout: 20000
            };
            console.log(config)
            const pythonRes = await axios(config)
            console.log(pythonRes.data, pythonRes)
            return pythonRes.data
        }catch(e){
            console.log(e, "error from python")
            console.log(e?.response?.data, "error from python for backlinkings")
            throw e
        }
    }
    async getAskMeAnswers (question: string){
        try {
            let data = JSON.stringify([
                {
                    'user_id': this.userId, 
                    'company_id': 'nowigence', 
                    'question': question,
                }
            ]);
            const config: any = {
                method: 'post',
                url: `${process.env.PLUARIS_PYTHON_REST_BASE_ENDPOINT}/ask-me`,
                headers: { 
                    'Content-Type': 'application/json'
                },
                data,
                timeout: 60000
            }
            console.log(config, "config")
            const pythonRes = await axios(config)
            console.log(pythonRes.data, "python response")
            if(!pythonRes.data || !pythonRes?.data.length ) {
                return null
            }
            const res = pythonRes?.data[0]
            console.log(res?.internal_results?.main_document?.answer, "answer")
            console.log(!res?.internal_results?.main_document?.id?.length, "answer")
            if(res && !res?.internal_results?.main_document?.id?.length) {
                return null
            }
            if(!res || !Object.keys(res).length || !Object.keys(res).length) {
                return null
            }
            return res
        }catch(e){
            console.log(e.message, "error")
            console.log(e, "error from python for ask me")
            console.log(e?.response?.data, "error from python for ask me")
            throw e
        }
    }
}