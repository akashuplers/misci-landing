import axios from "axios";
import GPT3Tokenizer from 'gpt3-tokenizer';

export class ChatGPT {
    text: string = "";
    apiKey: string = ""
    db: any = null
    constructor(data: any) {
        this.text = data.text;
        this.apiKey = data.apiKey
        this.db = data.db
    }
    async textCompletion (timeout: number = 0) {
        const tokenizer = new GPT3Tokenizer({ type: 'gpt3' }); // or 'codex'
        const encoded: { bpe: number[]; text: string[] } = tokenizer.encode(this.text);
        var config: any = {
            method: 'post',
            url: 'https://nowigencegpt3.openai.azure.com/openai/deployments/text_completion/completions?api-version=2022-12-01',
            headers: { 
              'Content-Type': 'application/json', 
              'api-key': `${this.apiKey}`,
            },
            data : {
              "model": "text-davinci-003",
              "prompt": `${this.text}`,
              "temperature": 0,
              "max_tokens": 4096 - encoded.text?.length
            },
            timeout: timeout || 0
        };
        try {
            const res = await axios(config)
            return res?.data?.choices?.length && res?.data?.choices?.[0].text
        }catch(err){
            console.log(err)
            console.log(err.response.data)
            console.log(err?.response?.data?.error?.type)
            if(err?.response?.data?.error?.type && err?.response?.data?.error?.type === "insufficient_quota") {
                await this.db.db('lilleAdmin').collection('chatGPT').updateOne({}, {
                $set: {
                    "apis.$[d].quotaFull":true
                },
                },{ 
                arrayFilters: [
                    {
                    "d.key": this.apiKey,
                    }
                ]
                })
                throw "The auto expansion service is under maintenance, please contact the support team."
            }
            if(err?.response?.data?.error?.type && err?.response?.data?.error?.type === "server_error") {
                throw "There is a delay in the auto expansion, please try after some time."
            }
            throw err.message
        }
    }
    async fetchImage() {
        var config: any = {
            method: 'post',
            url: 'https://api.openai.com/v1/images/generations',
            headers: { 
              'Content-Type': 'application/json', 
              'Authorization': `Bearer ${this.apiKey}`,
              "Access-Control-Allow-Headers": "X-Requested-With, privatekey"
            },
            data : {
              "prompt": `${this.text}`,
              "n": 1,
              "size": "512x512"
            }
        };
        try {
            const {data} = await axios(config)
            return data?.data?.length && data?.data?.[0].url
        }catch(err){
            console.log(err)
            console.log(err.response.data)
            console.log(err?.response?.data?.error?.type)
            if(err?.response?.data?.error?.type && err?.response?.data?.error?.type === "insufficient_quota") {
                await this.db.db('admin').collection('chatGPT').updateOne({}, {
                $set: {
                    "apis.$[d].quotaFull":true
                },
                },{ 
                arrayFilters: [
                    {
                    "d.key": this.apiKey,
                    }
                ]
                })
                throw "The auto expansion service is under maintenance, please contact the support team."
            }
            if(err?.response?.data?.error?.type && err?.response?.data?.error?.type === "server_error") {
                throw "There is a delay in the auto expansion, please try after some time."
            }
            throw err.message
        }
    }
    
}