import { ObjectID } from "bson";
import { ChatGPT } from "../../../services/chatGPT";
import { getTimeStamp } from "../../../utils/date";
import { URL } from "url";
const natural = require('natural');

export const fetchBlog = async ({id, db}: {
    id: string;
    db: any
}) => {
   return await db.db('lilleBlogs').collection('blogs').findOne({_id: new ObjectID(id)})
}

export const fetchBlogByUser = async ({id, db, userId}: {
    id: string;
    db: any;
    userId: string
}) => {
   return await db.db('lilleBlogs').collection('blogs').findOne({_id: new ObjectID(id), userId: new ObjectID(userId)})
}

export const fetchBlogIdeas = async ({id, db}: {
    id: string;
    db: any
}) => {
   return await db.db('lilleBlogs').collection('blogIdeas').findOne({blog_id: new ObjectID(id)})
}

export const blogGeneration = async ({db, text, regenerate = false, title, imageUrl = null, imageSrc = null, ideasText = null, ideasArr=[], refUrls = []}: {
    db: any;
    text: String;
    regenerate: Boolean;
    title?: String | null;
    imageUrl?: String | null
    imageSrc?: String | null
    ideasText?: String | null
    ideasArr?: {
        idea: string;
        article_id: string;
    }[]
    refUrls?: any[]
}) => {
    const chatgptApis = await db.db('lilleAdmin').collection('chatGPT').findOne()
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
        wordpress: null
    }
    await (
        Promise.all(
            Object.keys(newsLetter).map(async (key: string) => {
                try {
                    if(key === "wordpress") {
                        const chatGPTText = await new ChatGPT({apiKey: availableApi.key, text: `
                            ${regenerate ? `
                            Please act as an expert writer and using the below pasted ideas write a blog with inputs as follows:
                            Tone is " Authoritative, informative, Persuasive"
                            Limit is "900 words"
                            Highlight the H1 & H2 tags
                            Provide the conclusion at the end
                            Ideas ${text}
                            ` : `write a large blog for ${key} on  "${text}" with title and content`}
                        `, db}).textCompletion()
                        newsLetter = {...newsLetter, [key]: chatGPTText}
                    } else {
                        const chatGPTText = await new ChatGPT({apiKey: availableApi.key, text: `
                        ${regenerate ? `write a blog on topic ${title} for ${key} ${key === 'linkedin' ? "linkedin post with tags under 3000 characters" : "twitter post with tags under 280 characters"} using below points: \n ${text}` : `write a blog on "${text}" for a ${key}`}
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
        delete newsLetter.image
        let usedIdeasArr: any = []
        let description = ""
        const updated = await (
            Promise.all(
                Object.keys(newsLetter).map(async (key: string) => {
                    try {
                        switch(key) {
                            case "image":
                                break;
                            case "wordpress":
                                const refs = refUrls
                                // const title = newsLetter[key].slice(newsLetter[key].indexOf("Title:"), newsLetter[key].indexOf("Content:")).trim()
                                const content = newsLetter[key]?.replace(/\n/g, "<br/>")
                                let updatedContent = content?.replace("In conclusion, ", "<h3>Conclusions:</h3><br/>")
                                updatedContent = updatedContent?.replace("H1: ", "")
                                updatedContent = updatedContent?.replace("H2: ", "")
                                description = (content?.replace("\n", ""))?.trimStart()
                                description = (description?.replace("<br/>", " "))?.trimStart()
                                usedIdeasArr = content?.split('.')
                                // const updatedContent = content?.split('. ')?.map((data: string) => {
                                //     let newText = data
                                //     let filteredSource = null
                                //     ideasArr.some((idea) => {
                                //         if(idea.idea && data) {
                                //             const similarity = natural.JaroWinklerDistance(data, idea.idea, true);
                                //             if(similarity > 0.7) {
                                //                 filteredSource = refs?.findIndex((ref) => ref.id === idea.article_id)
                                //                 // console.log(data, idea.idea, idea.article_id, filteredSource, similarity, "similiary")
                                //                 return true
                                //             } else {
                                //                 return false
                                //             }
                                //         }else {
                                //             return false
                                //         }
                                //     })
                                //     if(filteredSource || filteredSource === 0) {
                                //         newText = `${data} [${filteredSource + 1}]` 
                                //     }
                                //     return newText
                                // })
                                let references: any[] = []
                                refUrls && refUrls.length && refUrls.forEach((data) => {
                                    references.push({
                                        "tag": "LI",
                                        "attributes": {"style": "font-size: 10pt;"},
                                        "children": [
                                            {
                                                "tag": "SPAN",
                                                "attributes": {
                                                    "style": "font-size: 10pt;"
                                                },
                                                "children": [
                                                    {
                                                        "tag": "A",
                                                        "attributes": {
                                                            "href": data.url
                                                        },
                                                        "children": [
                                                            data.url
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    })
                                })
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
                                                            title
                                                        ]
                                                    }
                                                ]
                                            },
                                            {
                                                "tag": "P",
                                                "attributes": {
                                                    "style": "text-align: left;"
                                                },
                                                "children": [
                                                    {
                                                        "tag": "A",
                                                        "attributes": {
                                                            "title": "Source URL",
                                                            "href": imageSrc || "#",
                                                            "target": "_blank",
                                                            "rel": "noopener"
                                                        },
                                                        "children": [
                                                            {
                                                                "tag": "IMG",
                                                                "attributes": {
                                                                    "style": "display: block; margin-left: auto; margin-right: auto;",
                                                                    "src": imageUrl,
                                                                    "width": "479",
                                                                    "height": "331"
                                                                },
                                                                "children": []
                                                            },
                                                            {
                                                                "tag": "SPAN",
                                                                "attributes": {
                                                                    "style": "font-size: 8pt;"
                                                                },
                                                                "children": [
                                                                    imageSrc ? "Image Source" : "A placeholder image has been added, you can upload your own image."
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ]
                                            },
                                            {
                                                "tag": "P",
                                                "attributes": {
                                                    "style": "text-align: left;"
                                                },
                                                "children": []
                                            },
                                            {
                                                "tag": "P",
                                                "attributes": {},
                                                "children": [
                                                    updatedContent.length ? updatedContent : ideasText && ideasText.length ? ideasText : "Sorry, We were unable to generate the blog at this time, Please try again after some time or try with different topic."
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
                                                        "tag": "STRONG",
                                                        "attributes": {},
                                                        "children": [
                                                            "Refrences:-"
                                                        ]
                                                    }
                                                ]
                                            },
                                            {
                                                "tag": "OL",
                                                "attributes": {},
                                                "children": references
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
                                                }
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
            usedIdeasArr,
            description
        }
    }catch(e){
        throw e
    }
}

export const fetchUser = async ({id, db}: {
    id: string;
    db: any
}) => {
    return db.db('lilleAdmin').collection('users').findOne({_id: new ObjectID(id)})
}

export const updateUserCredit = async ({id, db, credit}: {
    id: string;
    db: any,
    credit: number
}) => {
    return await db.db('lilleAdmin').collection('users').updateOne({_id: new ObjectID(id)}, {$set: {credits: credit}})
}

export const publishBlog = async ({id, db, platform}: {
    id: string;
    db: any,
    platform: string
}) => {
    console.log(platform)
    return await db.db('lilleBlogs').collection('blogs').updateOne({_id: new ObjectID(id), "publish_data": {$elemMatch: {platform: platform} } }, {
        $set: {
            "publish_data.$[elem].published": true,
            "publish_data.$[elem].published_date": getTimeStamp(),
            "status": "published"
        }
    }, { "arrayFilters": [{ "elem.platform": platform }], "multi": true })
}

export const deleteBlog = async ({
    id,
    db
}:{
    id: string;
    db: any
}) => {
    return await db.db('lilleBlogs').collection('blogs').deleteOne({_id: new ObjectID(id)})
}

export const deleteBlogIdeas = async ({
    id,
    db
}:{
    id: string;
    db: any
}) => {
    return await db.db('lilleBlogs').collection('blogIdeas').deleteOne({blog_id: new ObjectID(id)})
}

export const fetchUsedBlogIdeasByIdea = async ({
    idea,
    db,
    userId
}: {
    idea: any
    db: any
    userId: string
}) => {
    const res = await db.db('lilleBlogs').collection('blogIdeas').aggregate([
        {
            $match: {
                ideas: {
                    $elemMatch: {
                        "idea": idea, 
                        "used": 1,
                    }
                }
            }
        },
        {
            $lookup: {
                from: "blogs",
                localField: "blog_id",
                foreignField: "_id",
                as: "blogs",
            }
        },
        { "$unwind": "$blogs" },
        {
            $match: {
                "blogs.userId": new ObjectID(userId)
            }
        },
        {
            $project: {
                _id: 1
            }
        }
    ]).toArray()
    return res?.length ? res[0] : null
}

export const fetchArticleById = async ({
    id,
    db,
    userId
}: {
    id: string
    db: any
    userId: string
}) => {
    return await db.db('lilleArticles').collection('articles').findOne({
        _id: id
    })
}

export const fetchArticleUrls = async ({
    blog,
    db,
    articleId
}: {
    blog?: any
    db: any
    articleId?: string[]
}) => {
    let urls : {
        url: string
        source: string
    }[] = []
    if((blog && blog?.article_id?.length) || (articleId && articleId.length)) {
        let filter = null
        if(articleId && articleId.length) {
            filter = {$in: articleId}
        } else {
            filter = {$in: blog?.article_id}
        }
        const urlsData = await db.db("lilleArticles").collection('articles').find({
            _id: filter
        }, {
            projection: {
                "_id": 1,
                "_source.orig_url": 1,
                "_source.source.name": 1
            }
        }).toArray()
        if(urlsData?.length) {
            urlsData?.forEach((data: {_source: {orig_url: string, source: {name: string}}, _id: string}) => {
                console.log(data._source.source.name)
                let urlObj: null | {
                    url: string
                    source: string
                    id?: string
                } = null
                if(!data._source.source.name || (data._source.source.name && data._source.source.name === "Not Available")) {
                    urlObj = {
                        url : data?._source?.orig_url,
                        source: new URL(data?._source?.orig_url).host,
                        id: data._id
                    }
                } else {
                    urlObj = {
                        url : data?._source?.orig_url,
                        source: data._source.source.name,
                        id: data._id
                    }
                }
                urls.push(urlObj)
            })
        }
    }
    let uniqueUrls : {
        url: string
        source: string
        id?: string
    }[] = [];
    urls.forEach((c) => {
        const dupe = uniqueUrls.find((data: {
            url: string
            source: string
        }) => data.source === c.source)
        if(!dupe) uniqueUrls.push(c)
    });
    return uniqueUrls
}
