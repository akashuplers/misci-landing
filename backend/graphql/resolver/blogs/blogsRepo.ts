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

export const blogGeneration = async ({db, text, regenerate = false, title, imageUrl = null, imageSrc = null, ideasText = null, ideasArr=[], refUrls = [], userDetails = null}: {
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
    refUrls?: any[];
    userDetails?: any
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
                            Highlight the H1 & H2 html tags
                            Provide the conclusion at the end
                            Ideas ${text}
                            ` : `
                            Please act as an expert writer and using the below pasted ideas write a blog with inputs as follows:
                            Tone is " Authoritative, informative, Persuasive"
                            Limit is "900 words"
                            Highlight the H1 & H2 html tags
                            Provide the conclusion at the end
                            Topic is ${title}
                            `}
                        `, db}).textCompletion(chatgptApis.timeout)
                        newsLetter = {...newsLetter, [key]: chatGPTText}
                    } else {
                        let text = ""
                        if(key === 'linkedin') {
                            text = `write a post on topic ${title} for linkedin post with tags under 700 words`
                        }
                        if(key === 'twitter') {
                            let tweetQuota;
                            if(userDetails) {
                                tweetQuota = await db.db('lilleAdmin').collection('tweetsQuota').findOne({
                                    userId: new ObjectID(userDetails._id)
                                })
                            }
                            let cond = "";
                            if(tweetQuota && tweetQuota.remainingQuota > 0) {
                                cond = `${tweetQuota && `Tweet count should be ${tweetQuota.remainingQuota}`}`
                            }
                            text = `Please act as an expert Twitter Post to write a Twitter Thread as seperate list using below rules:
                                Topic of Thread is "${title}"
                                Each Tweet length should be less then 180 characters
                                ${cond}
                                `
                            console.log(text, "text")
                        }
                        const chatGPTText = await new ChatGPT({apiKey: availableApi.key, text, db}).textCompletion(chatgptApis.timeout)
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
                                const content = newsLetter[key]?.replace(/\n/g, "<p/>")
                                const mapObj: any = {
                                    "H1:":" ",
                                    "H2:":" ",
                                    "<p/><p/>":"<p/>",
                                    "Conclusions:<p/>":"<h3>Conclusions</h3><p/>",
                                    "Conclusion:<p/>":"<h3>Conclusions</h3><p/>",
                                    "Conclusion<p/>":"<h3>Conclusion</h3><p/>",
                                    "Conclusions<p/>":"<h3>Conclusion</h3><p/>",
                                    "<h1>":" ",
                                    "Title:":" ",
                                    "Introduction::":" ",
                                    "</h1>":" ",
                                    "<h2>":" ",
                                    "</h2>":" ",
                                    "\n":" ",
                                };
                                let updatedContent = content?.replace("In conclusion, ", "<p><h3>Conclusions:</h3></p>")
                                updatedContent = updatedContent.replace(/H1:|H2:|Title:|Introduction:|<p\s*\/?><p\s*\/?>|Conclusions:<p\s*\/?>|Conclusion:<p\s*\/?>|Conclusion<p\s*\/?>|Conclusions<p\s*\/?>/gi, function(matched: any){
                                    return mapObj[matched];
                                }); 
                                // updatedContent = updatedContent?.replace("<p></p><p></p>", "<p></p>")
                                description = newsLetter[key]?.replace(/<h1>|<\s*\/?h1>|<\s*\/?h2>|<h2>|\n/gi, function(matched: any){
                                    return mapObj[matched];
                                }); 
                                // description = (newsLetter[key]?.replace("\n", ""))?.trimStart()
                                usedIdeasArr = description?.split('. ')
                                const htmlTagRegex = /<[^>]*>([^<]*)<\/[^>]*>/g; // Regular expression to match HTML tags
                                const sentences = updatedContent?.split('.').map((sentence: any) => {
                                    // Check if the sentence is not wrapped in HTML tags
                                    const matches = sentence.match(htmlTagRegex);
                                    if(matches) {
                                        return {
                                            text: sentence,
                                            no: true
                                        }
                                    }else {
                                        return {
                                            text: sentence,
                                            no: false
                                        }
                                    }
                                    // return !matches || matches.length === 0;
                                });
                                // console.log(sentences, "updatedContentBefore")
                                updatedContent = sentences?.map((data: any) => {
                                    let newText = data.text
                                    let filteredSource = null
                                    ideasArr.some((idea) => {
                                        if(idea.idea) {
                                            let checkHtmlTagSentences = null
                                            if(data.no) {
                                                function findTagIndices(sentence: string, tagName: string) {
                                                    const openingTagRegex = new RegExp(`<${tagName}\\b[^>]*>`, 'i');
                                                    const closingTagRegex = new RegExp(`<\/${tagName}\\b[^>]*>`, 'i');
                                                  
                                                    const openingTagMatch = sentence.match(openingTagRegex);
                                                    const closingTagMatch = sentence.match(closingTagRegex);
                                                  
                                                    const startIndex = openingTagMatch ? openingTagMatch.index : -1;
                                                    const endIndex = closingTagMatch && closingTagMatch.index? closingTagMatch.index + closingTagMatch[0].length - 1 : -1;
                                                  
                                                    return { startIndex, endIndex };
                                                }
                                                // const string = "<p></p><h2>What Are Your Chest Muscles?</h2><p></p>Before we dive into the 10 best chest exercises for building muscle, let’s take a quick look at the muscles that make up the chest"
                                                const regex = /<[^>]*>([^<]*)<\/[^>]*>/g; 
                                                data.text.split(".").forEach((sentence: any) => {
                                                    // Check if the sentence is not wrapped in HTML tags
                                                    const matches = sentence.match(regex);
                                                    if(matches) {
                                                        const h2Indeces = findTagIndices(sentence, 'h2')
                                                        const h1Indeces = findTagIndices(sentence, 'h1')
                                                        if(h2Indeces.endIndex > -1){
                                                            checkHtmlTagSentences = sentence.substr(h2Indeces.endIndex + 1)
                                                        } else if(h1Indeces.endIndex > -1) {
                                                            checkHtmlTagSentences = sentence.substr(h1Indeces.endIndex + 1)
                                                        } else {
                                                            checkHtmlTagSentences = null
                                                        } 
                                                        return checkHtmlTagSentences
                                                    }else {
                                                        return false
                                                    }
                                                    // return !matches || matches.length === 0;
                                                });
                                            } else {
                                                checkHtmlTagSentences = data.text
                                            } 
                                            if(checkHtmlTagSentences && checkHtmlTagSentences.length > 0) {
                                                const similarity = natural.JaroWinklerDistance(checkHtmlTagSentences, idea.idea, true);
                                                // console.log(checkHtmlTagSentences,similarity, "similarity" )
                                                if(similarity > 0.67 && idea.article_id) {
                                                    filteredSource = refs?.findIndex((ref) => ref.id === idea.article_id)
                                                    // console.log(data, idea.idea, idea.article_id, filteredSource, similarity, "similiary")
                                                    return true
                                                } else {
                                                    return false
                                                }
                                            } else {
                                                return false
                                            }
                                        }else {
                                            return false
                                        }
                                    })
                                    if((filteredSource || filteredSource === 0) && refs[filteredSource]) {
                                        newText = `${data.text} <a href="${refs[filteredSource]?.url}" target="_blank" title="${filteredSource + 1} - ${refs[filteredSource]?.url}">[${filteredSource + 1}]</a>` 
                                    }
                                    return newText.trim() + '. '
                                })
                                updatedContent = updatedContent?.map((content: string) => content.replace("..", "."))
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
                                                            "href": data.url,
                                                            "target": "_blank"
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
                                usedIdeasArr = usedIdeasArr?.filter((text: string) => text.length > 5)
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
                                                    "style": "text-align: center;"
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
                                                    updatedContent?.length ? updatedContent.join("") : ideasText && ideasText.length ? ideasText : "Sorry, We were unable to generate the blog at this time, Please try again after some time or try with different topic."
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
                                                    refUrls && refUrls.length && 
                                                    {
                                                        "tag": "STRONG",
                                                        "attributes": {},
                                                        "children": [
                                                            "References:-"
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
                                let linkedinContent = newsLetter[key]?.replace(/\n/g, "<p/>")
                                const matchObj: any = {
                                    "<p/><p/>":"<p/>",
                                };
                                linkedinContent = linkedinContent?.replace(/<p\s*\/?><p\s*\/?>/gi, function(matched: any){
                                    return matchObj[matched];
                                }); 
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
                                                        linkedinContent
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
                                console.log(newsLetter[key])
                                let thread = newsLetter[key]?.replace(/\n/g, "<p/>")
                                console.log(thread)
                                // let thread = `<p/><p/>1. Looking to build a strong chest? Here are the top 10 exercises to help you get there! #chestexercises #fitness #mensfitness <p/>2. Bench Press: A classic exercise for building chest strength. Make sure to keep your back flat and your elbows tucked in. <p/>3. Incline Bench Press: This exercise targets the upper chest muscles. Make sure to keep your back flat and your elbows tucked in. <p/>4. Push-Ups: A great bodyweight exercise for building chest strength. Make sure to keep your back flat and your elbows tucked in. <p/>5. Decline Bench Press: This exercise targets the lower chest muscles. Make sure to keep your back flat and your elbows tucked in. <p/>6. Chest Flys: A great exercise for building chest strength. Make sure to keep your back flat and your elbows tucked in. <p/>7. Chest Dips: A great bodyweight exercise for building chest strength. Make sure to keep your back flat and your elbows tucked in. <p/>8. Cable Crossovers: A great exercise for building chest strength. Make sure to keep your back flat and your elbows tucked in. <p/>9. Chest Press Machine: A great machine exercise for building chest strength. Make sure to keep your back flat and your elbows tucked in. <p/>10. Chest Pullovers: A great exercise for building chest strength. Make sure to keep your back flat and your elbows tucked in. <p/><p/>There you have it! These are the top 10 exercises for building a strong chest. #chestexercises #fitness #mensfitness <p/>This tweet was generated by @Lille_AI twitter`
                                const matchTwitterObj: any = {
                                    "<p/><p/>":"<p/>",
                                    "Thread: ":"",
                                };
                                thread = thread.replace(/<p\s*\/?><p\s*\/?>/gi, function(matched: any){
                                    return matchTwitterObj[matched];
                                });
                                let updatedThread = thread.split("<p/>")
                                updatedThread = updatedThread.map((str: string) => {
                                    return str.replace(/^\d+\s*[-\\.\\\/)]?\s+/g, "")
                                })
                                updatedThread = updatedThread?.filter((text: string) => text.length > 0)
                                if(updatedThread && updatedThread.length) updatedThread.push('This tweet was generated by @Lille_AI')
                                console.log(updatedThread, "updatedThread") 
                                return {
                                    published: false,
                                    published_date: false,
                                    platform: "twitter",
                                    creation_date: Math.round(new Date().getTime() / 1000) ,
                                    tiny_mce_data: {
                                    },
                                    threads: updatedThread || [] 
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


export const assignTweetQuota = async (db: any, userDetails: any | false = false, quota: any | false = false) => {
    if(userDetails) {
        const configs = await db.db('lilleAdmin').collection('config').findOne()
        const totalQuota = !userDetails.isSubscribed ? parseInt(configs?.tweetsQuota?.unpaid || "3") : parseInt(configs?.tweetsQuota?.paid || "6")
        const updatedTweetsQuotaData = {
            totalQuota,
            remainingQuota: totalQuota,
            date: getTimeStamp(),
            userId: new ObjectID(userDetails._id),
        }
        console.log(updatedTweetsQuotaData)
        const res = await db.db('lilleAdmin').collection('tweetsQuota').updateOne(
            {userId: new ObjectID(userDetails._id)}, 
            {$set: updatedTweetsQuotaData}, 
            {upsert: true})
        return res    
    }
    if(quota) {
        const totalQuota = quota.totalQuota
        const updatedTweetsQuotaData = {
            totalQuota,
            remainingQuota: totalQuota,
            date: getTimeStamp(),
            userId: new ObjectID(quota.userId),
        }
        console.log(updatedTweetsQuotaData, "update")
        const res = await db.db('lilleAdmin').collection('tweetsQuota').updateOne(
            {_id: new ObjectID(quota._id)}, 
            {$set: updatedTweetsQuotaData}, 
            {upsert: true})
        return res
    }
}