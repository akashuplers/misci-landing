import { ObjectID } from "bson";
import { GenerateBlogMutationArg, ReGenerateBlogMutationArg } from "interfaces";
import { getBase64Image } from "../../../utils/image";
import { ChatGPT } from "../../../services/chatGPT";
import { Azure } from "../../../services/azure";

export const fetchBlog = async ({id, db}: {
    id: string;
    db: any
}) => {
   return await db.db('lilleBlogs').collection('blogs').findOne({_id: new ObjectID(id)})
}

export const fetchBlogIdeas = async ({id, db}: {
    id: string;
    db: any
}) => {
   return await db.db('lilleBlogs').collection('blogIdeas').findOne({blog_id: new ObjectID(id)})
}

export const blogGeneration = async ({db, text, regenerate = false, title, imageUrl = null}: {
    db: any;
    text: String;
    regenerate: Boolean;
    title?: String | null;
    imageUrl?: String | null
}) => {
    const chatgptApis = await db.db('admin').collection('chatGPT').findOne()
    let availableApi: any = null
    if(chatgptApis) {
        availableApi = chatgptApis.apis?.find((api: any) => !api.quotaFull)
    } else {
        throw "Something went wrong! Please connect with support team";
    }
    if(!availableApi) {
        throw "Something went wrong! Please connect with support team";
    }
    let newsLetter: any = {
        linkedin: null,
        twitter: null,
        wordpress: null,
        image: null
    }
    await (
        Promise.all(
            Object.keys(newsLetter).map(async (key: string) => {
                try {
                    if(key === "wordpress") {
                        const chatGPTText = await new ChatGPT({apiKey: availableApi.key, text: `
                            ${regenerate ? `write a large blog for ${key} on topic ${title} using below points: \n "${text}" with title and content` : `write a large blog for ${key} on  "${text}" with title and content`}
                        `, db}).textCompletion()
                        newsLetter = {...newsLetter, [key]: chatGPTText}
                    } else {
                        const chatGPTText = await new ChatGPT({apiKey: availableApi.key, text: `
                        ${regenerate ? `write a blog using points: "${text}" on topic ${title} for a ${key}` : `write a blog on "${text}" for a ${key}`}
                        `, db}).textCompletion()
                        newsLetter = {...newsLetter, [key]: chatGPTText}
                    }
                } catch(e: any) {
                    console.log(e, "error from chat gpt")
                    throw e
                }
            })
        )
    )
    try {
        // const chatGPTImage = await new ChatGPT({apiKey: availableApi.key, text, db}).fetchImage()
        // newsLetter = {...newsLetter, image: chatGPTImage}
        // const base64 = await getBase64Image(newsLetter.image)
        // let imageUrl: string | null = null
        // try {
        //     const blobName = `blogs/${new Date().getTime()}.jpeg`;
        //     const {url} = await new Azure({
        //         blobName
        //     }).getBlogUrlFromBase(base64)
        //     imageUrl = url
        // }catch(e){
        //     console.log(e, "error from azure")
        // }
        delete newsLetter.image
        let usedIdeasArr: any = []
        const updated = await (
            Promise.all(
                Object.keys(newsLetter).map(async (key: string) => {
                    try {
                        switch(key) {
                            case "image":
                                break;
                            case "wordpress":
                                const title = newsLetter[key].slice(newsLetter[key].indexOf("Title:"), newsLetter[key].indexOf("Content:")).trim()
                                const content = newsLetter[key].slice(newsLetter[key].indexOf("Content:"), newsLetter[key].length).trim()
                                console.log(content)
                                console.log(content.split('Content:')[1])
                                usedIdeasArr = (content.split('Content:')[1]).split('.')
                                return {
                                    published: false,
                                    published_date: false,
                                    platform: "wordpress",
                                    creation_date: Math.round(new Date().getTime() / 1000) ,
                                    tiny_mce_data: {
                                        "tag": "BODY",
                                        children: [
                                            {
                                                "tag": "H3",
                                                "attributes": {
                                                    "style": "text-align: center;"
                                                },
                                                "children": [
                                                    {
                                                        "tag": "STRONG",
                                                        "attributes": {},
                                                        "children": [
                                                            title.split("Title: ")[1]
                                                        ]
                                                    }
                                                ]
                                            },
                                            {
                                                "tag": "P",
                                                "attributes": {},
                                                "children": [
                                                    {
                                                        "tag": "IMG",
                                                        "attributes": {
                                                            "style": "display: block; margin-left: auto; margin-right: auto;",
                                                            "src": imageUrl,
                                                            "width": "441",
                                                            "height": "305"
                                                        },
                                                        "children": []
                                                    }
                                                ]
                                            },
                                            {
                                                "tag": "P",
                                                "attributes": {},
                                                "children": []
                                            },
                                            {
                                                "tag": "P",
                                                "attributes": {},
                                                "children": [
                                                    content.split('Content:')[1]
                                                ]
                                            }
                                        ]
                                    }  
                                }   
                            case "linkedin":
                                return {
                                    published: false,
                                        published_date: false,
                                        platform: "linkedin",
                                        creation_date: Math.round(new Date().getTime() / 1000) ,
                                        tiny_mce_data: {
                                            "tag": "BODY",
                                            children: [
                                                {
                                                    "tag": "P",
                                                    "attributes": {},
                                                    "children": [
                                                        newsLetter[key]
                                                    ]
                                                },
                                                {
                                                    "tag": "P",
                                                    "attributes": {},
                                                    "children": []
                                                },
                                                {
                                                    "tag": "P",
                                                    "attributes": {},
                                                    "children": [
                                                        {
                                                            "tag": "IMG",
                                                            "attributes": {
                                                                "style": "display: block; margin-left: auto; margin-right: auto;",
                                                                "src": imageUrl,
                                                                "width": "441",
                                                                "height": "305"
                                                            },
                                                            "children": []
                                                        }
                                                    ]
                                                },
                                            ]
                                        }
                                }
                            case "twitter":
                                return {
                                    published: false,
                                    published_date: false,
                                    platform: "twitter",
                                    creation_date: Math.round(new Date().getTime() / 1000) ,
                                    tiny_mce_data: {
                                        "tag": "BODY",
                                        children: [
                                            {
                                                "tag": "P",
                                                "attributes": {},
                                                "children": [
                                                    newsLetter[key]
                                                ]
                                            },
                                            {
                                                "tag": "P",
                                                "attributes": {},
                                                "children": []
                                            }
                                        ]
                                    }
                                }      
                            default:
                                return newsLetter[key]    
                        }
                    } catch(e: any) {
                        throw e
                    }
                })
            )
        )
        return {
            updatedBlogs: updated,
            usedIdeasArr
        }
    }catch(e){
        throw e
    }
}