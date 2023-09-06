import { ObjectID } from "bson";
import { ChatGPT } from "../../../services/chatGPT";
import { diff_minutes, getTimeStamp } from "../../../utils/date";
import { URL } from "url";
import { Python } from "../../../services/python";
import { title } from "process";
import { GenerateTMBlogOptions } from "interfaces";
import { publish } from "../../../utils/subscription";
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

export const TMBlogGeneration = async ({db, text}: {
    db: any;
    text: string[];
}) => {
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
        "\"":" ",
    };
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
        salesPitch: null,
        title: null,
        linkedin: null,
        twitter: null,
        blog: null
    }
    const keys = Object.keys(newsLetter)
    for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        try {
            if(key === "salesPitch") {
                const gptPrompt = "Act as an expert content writer who has to create a personalized sales pitch by identifying the pain points or challenges. Clearly define the problem to capture the user's attention. Describe how the product/service provides the ideal solution to the problem outlined earlier. List the benefits to improve customers' lives or businesses. Briefly compare the product/service with competitors. \n"+
                "The sales pitch content must have the highest degree of perplexity and the highest degree of burstiness.\n"+
                "The sales pitch content will be over 500 words.\n"+
                "The following inputs will have to be used to write a sales pitch: ["+text.join(',')+"].\n" +
                "End the sales pitch with a clear and concise call to action."
                const chatGPTText = await new ChatGPT({apiKey: availableApi.key, text: gptPrompt, db}).textCompletion(chatgptApis.timeout)
                newsLetter = {...newsLetter, [key]: chatGPTText}
            }
            if(key === 'title') {
                const blogPostToSend = newsLetter["wordpress"]?.replace(/<h1>|<\s*\/?h1>|<\s*\/?h2>|<h2>|\n/gi, function(matched: any){
                    return mapObj[matched];
                });            
                const chatGPTText = await new ChatGPT({apiKey: availableApi.key, text: `Create a SEO based title using this blog: ${blogPostToSend}`, db}).textCompletion(chatgptApis.timeout)
                newsLetter = {...newsLetter, [key]: chatGPTText}
            }
            if(key === 'linkedin') {
                const gptPrompt = "Please act as an expert LinkedIn article writer who has to write a LinkedIn post. The following inputs will have to be used to write a LinkedIn post: ["+text.join(',')+"].\n" +
                "LinkedIn post word limit will be 300 words \n"+
                "Suggest an attention-grabbing Title. \n" +
                "Insert hashtags at the end of the post. \n"
                const chatGPTText = await new ChatGPT({apiKey: availableApi.key, text: gptPrompt, db}).textCompletion(chatgptApis.timeout)
                newsLetter = {...newsLetter, [key]: chatGPTText}
            }
            if(key === 'twitter') {
                const gptPrompt = "Please act as an expert Twitter Thread writer who has to write a Twitter Thread. The following inputs will have to be used to write a Twitter Thread: ["+text.join(',')+"].\n" +
                "Insert Emoticons in Twitter Thread. \n"+
                "Thread limit to not exceed 10 tweets. \n" +
                "Insert hashtags at the end of tweets. \n" +
                "Character limit per tweet to be maximum 280 characters. \n" +
                "Do not show the Tweet Number count inside the Tweets. \n"
                const chatGPTText = await new ChatGPT({apiKey: availableApi.key, text: gptPrompt, db}).textCompletion(chatgptApis.timeout)
                newsLetter = {...newsLetter, [key]: chatGPTText}
            }
        } catch(e: any) {
            console.log(e, "error from chat gpt")
            throw e
        }
    }
    let title : string = ""
    console.log(newsLetter.salesPitch, "akash")
    if(newsLetter['title'] && (!title || !title?.length)) {
        title = newsLetter['title']
        title = title?.replace(/"|\n|H1:|H2:|Title:/gi, function(matched: any){
            return mapObj[matched];
        })
        title = title?.trim()
    }
    let description = ""
    const updated = Object.keys(newsLetter).map((key: string) => {
        switch(key) {
            case "image":
                break;
            case "title":
                break;    
            case "twitter":    
                console.log(newsLetter[key])
                let updatedThread = null;
                if(newsLetter[key]) {
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
                    updatedThread = thread.split("<p/>")
                    updatedThread = updatedThread.map((str: string) => {
                        return str.replace(/^\d+\s*[-\\.\\\/)]?\s+/g, "")
                    })
                    updatedThread = updatedThread?.filter((text: string) => text.length > 0)
                    if(updatedThread && updatedThread.length) updatedThread.push('This tweet was generated by @Lille_AI')
                    console.log(updatedThread, "updatedThread") 
                }
                return {
                    published: false,
                    published_date: false,
                    platform: "twitter",
                    creation_date: Math.round(new Date().getTime() / 1000) ,
                    tiny_mce_data: {
                    },
                    threads: updatedThread || [] 
                } 
            case "linkedin":
                console.log(newsLetter[key], "linkedin")
                newsLetter[key] = newsLetter[key].trim()
                let linkedinTitle = ""
                if(newsLetter[key]?.indexOf("Title: ") >= 0) {
                    linkedinTitle = (newsLetter[key].substr(newsLetter[key].indexOf("Title: "), newsLetter[key].indexOf("\n"))).replace("Title: ", "")
                }
                if(linkedinTitle && linkedinTitle.length > 1) {
                    newsLetter[key] = newsLetter[key].replace(newsLetter[key].substr(newsLetter[key].indexOf("Title: "), newsLetter[key].indexOf("\n")), "")
                }
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
                                "tag": "H3",
                                "attributes": {
                                    "style": "text-align: center;"
                                },
                                "children": [
                                    {
                                        "tag": "STRONG",
                                        "attributes": {},
                                        "children": [
                                            (linkedinTitle && linkedinTitle.length > 1 && linkedinTitle) || title
                                        ]
                                    }
                                ]
                            },
                            {
                                "tag": "P",
                                "attributes": {},
                                "children": [
                                    linkedinContent
                                ]
                            }
                        ]
                    }
            }
            case "salesPitch":
                const content = newsLetter[key]
                description = newsLetter[key]?.replace(/<h1>|<\s*\/?h1>|Title:|Introduction:|<\s*\/?h2>|<h2>|\n/gi, function(matched: any){
                    return mapObj[matched];
                }); 
                return {
                    published: false,
                    published_date: false,
                    platform: "salesPitch",
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
                                "children": []
                            },
                            {
                                "tag": "P",
                                "attributes": {},
                                "children": [
                                    content && content.length ? content : "Sorry, We were unable to generate the blog at this time, Please try again after some time or try with different topic."
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
    })
    console.log(updated, "akash")
    console.log(updated.filter((data) => data), "akash1")
    return {
        publishedData: updated.filter((data) => data),
        title,
        description
    }
}

export const blogGeneration = async ({db, text, regenerate = false, title, imageUrl = null, imageSrc = null, ideasText = null, ideasArr=[], refUrls = [], userDetails = null, userId = null, keywords = [], tones = [], type = []}: {
    db: any;
    text: String;
    regenerate: Boolean;
    title?: string | null;
    imageUrl?: String | null
    imageSrc?: String | null
    ideasText?: String | null
    ideasArr?: {
        idea: string;
        article_id: string;
    }[]
    refUrls?: any[];
    keywords?: string[];
    tones?: string[];
    userDetails?: any;
    userId?: string | null;
    pubsub?: any | null;
    type?: any | null;
}) => {
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
        "\"":" ",
    };
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
        wordpress: null,
        title: null,
        linkedin: null,
        twitter: null,
    }
     
    const keys = Object.keys(newsLetter)
    for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        try {
            if((type.length && type.includes(key) && key === "wordpress") || (!type.length && key === "wordpress")) {
                const gptPrompt = `Please forget old prompt and act as an new expert writer and using the below pasted ideas write a blog with inputs as follows:\n${title && title.length ? `Topic is "${title}"\n${tones?.length ? `Tone is ${tones.join('","')}` : `Tone is "Authoritative, informative, Persuasive"`}`: tones?.length ? `Tone is ${tones.join('","')}` : `Tone is "Authoritative, informative, Persuasive"` }\n${keywords.length ? `Use these keywords: "${keywords.join('","')}" \nMinimum limit is "1000 words"`: `Minimum limit is "1000 words"`}\nHighlight the H1 & H2 html tags\nProvide the conclusion at the end with Conclusion as heading\nStrictly use all these points: ${text}`
                const chatGPTText = await new ChatGPT({apiKey: availableApi.key, text: `${regenerate ? gptPrompt : 
                    `Please act as an expert writer and using the below pasted ideas write a blog with inputs as follows:
                    ${title && title.length ? `'Topic is "${title}"'`: "" }
                    ${tones?.length ? tones.join('","') : `'Tone is "Authoritative, informative, Persuasive"'`}
                    ${keywords.length ? `'Use these keywords: "${keywords.join('","')}'" \n 'Minimum limit is "1000 words"'`: `Limit is "1000 words"`}
                    "Highlight the H1 & H2 html tags"
                    "Provide the conclusion at the end with Conclusion as heading"`}`, db}).textCompletion(chatgptApis.timeout)
                console.log(chatGPTText, "blog")    
                newsLetter = {...newsLetter, [key]: chatGPTText}
            } else {
                let text = ""
                if((type.length && type.includes(key) && key === "title") || (!type.length && key === 'title')) {
                    const blogPostToSend = newsLetter["wordpress"]?.replace(/<h1>|<\s*\/?h1>|<\s*\/?h2>|<h2>|\n/gi, function(matched: any){
                        return mapObj[matched];
                    });
                    text = `Create a title using this blog: ${blogPostToSend}`
                }
                if((type.length && type.includes(key) && key === "linkedin") || (!type && key === 'linkedin')) {
                    const blogPostToSendForLinkedin = newsLetter["wordpress"]?.replace(/<h1>|<\s*\/?h1>|<\s*\/?h2>|<h2>|\n/gi, function(matched: any){
                        return mapObj[matched];
                    });
                    text = `Please act as an expert LinkedIn Article writer who has to write a LinkedIn post from this Blog post: "${blogPostToSendForLinkedin}"
                    ${keywords.length ? `Keywords are "${keywords.join('","')}"`: `Topic of Blog is "${title}"`}, go through the Blog and write about this topic.
                    LinkedIn post should have maximum 300 words.
                    Suggest an attention-grabbing Title.
                    Insert hashtags at the end of the post
                    Trim unwanted new lines and spaces`
                }
                if((type.length && type.includes(key) && key === "twitter") || (!type && key === 'twitter')) {
                    let tweetQuota;
                    if(userDetails) {
                        tweetQuota = await db.db('lilleAdmin').collection('tweetsQuota').findOne({
                            userId: new ObjectID(userDetails._id)
                        })
                    }
                    let cond = "";
                    if(tweetQuota) {
                        if(tweetQuota.remainingQuota > 0) {
                            cond = `${tweetQuota && `Thread limit to not exceed ${tweetQuota.remainingQuota} tweets `}`
                        } else {
                            newsLetter = {...newsLetter, [key]: null}            
                        }
                    }
                    const blogPostToSendForLinkedin = newsLetter["wordpress"]?.replace(/<h1>|<\s*\/?h1>|<\s*\/?h2>|<h2>|\n/gi, function(matched: any){
                        return mapObj[matched];
                    });
                    text = `Please act as an expert Twitter Thread writer who has to write a Twitter Thread From this Blog: "${blogPostToSendForLinkedin}"
                    "Strictly Do not include serial numbers"
                    ${keywords.length ? `Keywords are "${keywords.join('","')}"`: `Topic of Blog is "${title}"`}, go through the Blog to understand and write twitter thread.
                    "Insert Emoticons in Twitter Thread".
                    "${cond || "Thread limit to not exceed 10 tweets"}".
                    "Insert hashtags at the end of tweets".
                    'Character limit per tweet to be exactly less then 200 characters'
                    "Trim unwanted new lines and spaces".
                    "Do not show the Tweet Number count inside the Tweets".`
                    console.log(text, "text")
                }
                if(text && text.length > 1) {
                    const chatGPTText = await new ChatGPT({apiKey: availableApi.key, text, db}).textCompletion(chatgptApis.timeout)
                    newsLetter = {...newsLetter, [key]: chatGPTText}
                }
            }
        } catch(e: any) {
            console.log(e, "error from chat gpt")
            throw e
        }
    }
    publish({userId, keyword: title || "", step: "CHAT_GPT_COMPLETED"})
    if(newsLetter['title'] && (!title || !title?.length)) {
        title = newsLetter['title']
        title = title?.replace(/"|\n|H1:|H2:|Title:/gi, function(matched: any){
            return mapObj[matched];
        })
        title = title?.trim()
    }
    delete newsLetter.title
    try {
        delete newsLetter.image
        let usedIdeasArr: any = []
        let description = ""
        title = title
        const updated = await (
            Promise.all(
                Object.keys(newsLetter).map(async (key: string) => {
                    try {
                        switch(key) {
                            case "image":
                                break;
                            case "wordpress":
                                const refs = refUrls
                                newsLetter[key] = newsLetter[key].trim()
                                console.log(newsLetter[key], "wordpress")
                                console.log(title, "wordpress")
                                if(newsLetter[key]?.indexOf("Title: ") >= 0) {
                                    console.log(newsLetter[key].substr(newsLetter[key].indexOf("Title: "), newsLetter[key].indexOf("\n")), newsLetter[key].indexOf("\n"), "akash")
                                    title = (newsLetter[key].substr(newsLetter[key].indexOf("Title: "), newsLetter[key].indexOf("\n"))).replace("Title: ", "")
                                }
                                console.log(title, "title", newsLetter[key]?.indexOf("Title: "))
                                const content = newsLetter[key]?.replace(/\n/g, "<p/>")
                                let updatedContent = content?.replace("In conclusion, ", "")
                                updatedContent = updatedContent.replace(/H1:|H2:|Title:|Introduction:|<p\s*\/?><p\s*\/?>|Conclusions:<p\s*\/?>|Conclusion:<p\s*\/?>|Conclusion<p\s*\/?>|Conclusions<p\s*\/?>/gi, function(matched: any){
                                    return mapObj[matched];
                                }); 
                                let contentWithRef = ""
                                // console.log(updatedContent)
                                // updatedContent = updatedContent?.replace("<p></p><p></p>", "<p></p>")
                                description = newsLetter[key]?.replace(/H1:|H2:|<h1>|<\s*\/?h1>|Title:|Introduction:|<\s*\/?h2>|<h2>|\n/gi, function(matched: any){
                                    return mapObj[matched];
                                }); 
                                // description = (newsLetter[key]?.replace("\n", ""))?.trimStart()
                                usedIdeasArr = description?.split('. ')
                                if(ideasArr && ideasArr.length && refUrls && refUrls?.length) {
                                    let articleIds: string[] = []
                                    refUrls?.map((refUrl) => articleIds.push(refUrl.id))
                                    const refBlogs = await new Python({userId}).getReferences({
                                        text: updatedContent,
                                        article_ids: articleIds
                                    })   
                                    refBlogs.forEach((data: any) => {
                                        // console.log(data, "data")
                                        if(Object.keys(data)?.length) {
                                            const key = Object.keys(data)[0]
                                            const matchedId = data[key]
                                            let text = key
                                            const filteredSourceIndex = refUrls?.findIndex((source: any) => source.id === matchedId)
                                            console.log(filteredSourceIndex, "match")
                                            // let foundFullStop = false
                                            // if (key[key.length-1] !== ".") {
                                            //     text = key.slice(0,-1);    
                                            //     foundFullStop = true
                                            // }
                                            if(filteredSourceIndex > -1) {
                                                const filteredSource = refUrls[filteredSourceIndex]
                                                contentWithRef += `${text} <a href="${filteredSource?.url}" target="_blank" title="${filteredSourceIndex + 1} - ${filteredSource?.url}">[${filteredSourceIndex + 1}]</a>.` 
                                            }else{
                                                if(updatedContent.charAt(updatedContent.lastIndexOf(key) + key.length) === ".") {
                                                    contentWithRef += `${text}.`
                                                } else {
                                                    contentWithRef += `${text}`
                                                }
                                            }
                                        }
                                    })
                                }
                                publish({userId, keyword: title || "", step: "BACKLINK_COMPLETED"})
                                const htmlTagRegex = /<[^>]*>([^<]*)<\/[^>]*>/g; // Regular expression to match HTML tags
                                // const sentences = updatedContent?.split('.').map((sentence: any) => {
                                //     // Check if the sentence is not wrapped in HTML tags
                                //     const matches = sentence.match(htmlTagRegex);
                                //     if(matches) {
                                //         return {
                                //             text: sentence,
                                //             no: true
                                //         }
                                //     }else {
                                //         return {
                                //             text: sentence,
                                //             no: false
                                //         }
                                //     }
                                //     // return !matches || matches.length === 0;
                                // });
                                // console.log(sentences, "updatedContentBefore")
                                // updatedContent = sentences?.map((data: any) => {
                                //     let newText = data.text
                                //     let filteredSource = null
                                //     ideasArr.some((idea) => {
                                //         if(idea.idea) {
                                //             let checkHtmlTagSentences = null
                                //             if(data.no) {
                                //                 function findTagIndices(sentence: string, tagName: string) {
                                //                     const openingTagRegex = new RegExp(`<${tagName}\\b[^>]*>`, 'i');
                                //                     const closingTagRegex = new RegExp(`<\/${tagName}\\b[^>]*>`, 'i');
                                                  
                                //                     const openingTagMatch = sentence.match(openingTagRegex);
                                //                     const closingTagMatch = sentence.match(closingTagRegex);
                                                  
                                //                     const startIndex = openingTagMatch ? openingTagMatch.index : -1;
                                //                     const endIndex = closingTagMatch && closingTagMatch.index? closingTagMatch.index + closingTagMatch[0].length - 1 : -1;
                                                  
                                //                     return { startIndex, endIndex };
                                //                 }
                                //                 // const string = "<p></p><h2>What Are Your Chest Muscles?</h2><p></p>Before we dive into the 10 best chest exercises for building muscle, let’s take a quick look at the muscles that make up the chest"
                                //                 const regex = /<[^>]*>([^<]*)<\/[^>]*>/g; 
                                //                 data.text.split(".").forEach((sentence: any) => {
                                //                     // Check if the sentence is not wrapped in HTML tags
                                //                     const matches = sentence.match(regex);
                                //                     if(matches) {
                                //                         const h2Indeces = findTagIndices(sentence, 'h2')
                                //                         const h1Indeces = findTagIndices(sentence, 'h1')
                                //                         if(h2Indeces.endIndex > -1){
                                //                             checkHtmlTagSentences = sentence.substr(h2Indeces.endIndex + 1)
                                //                         } else if(h1Indeces.endIndex > -1) {
                                //                             checkHtmlTagSentences = sentence.substr(h1Indeces.endIndex + 1)
                                //                         } else {
                                //                             checkHtmlTagSentences = null
                                //                         } 
                                //                         return checkHtmlTagSentences
                                //                     }else {
                                //                         return false
                                //                     }
                                //                     // return !matches || matches.length === 0;
                                //                 });
                                //             } else {
                                //                 checkHtmlTagSentences = data.text
                                //             } 
                                //             if(checkHtmlTagSentences && checkHtmlTagSentences.length > 0) {
                                //                 const similarity = natural.JaroWinklerDistance(checkHtmlTagSentences, idea.idea, true);
                                //                 console.log(checkHtmlTagSentences,similarity, idea.idea, "similarity" )
                                //                 if(similarity >= 0.7 && idea.article_id) {
                                //                     filteredSource = refs?.findIndex((ref) => ref.id === idea.article_id)
                                //                     // console.log(data, idea.idea, idea.article_id, filteredSource, similarity, "similiary")
                                //                     return true
                                //                 } else {
                                //                     return false
                                //                 }
                                //             } else {
                                //                 return false
                                //             }
                                //         }else {
                                //             return false
                                //         }
                                //     })
                                //     if((filteredSource || filteredSource === 0) && refs[filteredSource]) {
                                //         newText = `${data.text} <a href="${refs[filteredSource]?.url}" target="_blank" title="${filteredSource + 1} - ${refs[filteredSource]?.url}">[${filteredSource + 1}]</a>` 
                                //     }
                                //     return newText.trim() + '. '
                                // })
                                // console.log(updatedContent, "updatedContentBefore")
                                // updatedContent = updatedContent?.map((content: string) => content.replace("..", "."))
                                // updatedContent = updatedContent?.join("")?.replace(". .", ".")
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
                                                            "href": data.url !== "No url for this file" ? data.url : "#",
                                                            "target": "_blank"
                                                        },
                                                        "children": [
                                                            data.url !== "No url for this file" ? data.url : data.source
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    })
                                })
                                usedIdeasArr = usedIdeasArr?.filter((text: string) => text.length > 5)
                                console.log(updatedContent)
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
                                                    contentWithRef?.length ? contentWithRef : updatedContent?.length ? updatedContent : ideasText && ideasText.length ? ideasText : "Sorry, We were unable to generate the blog at this time, Please try again after some time or try with different topic."
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
                                if(type.length && type.includes(key) || (!type.length && key === "linkedin")){
                                    console.log(newsLetter[key], "linkedin")
                                    newsLetter[key] = newsLetter[key].trim()
                                    let linkedinTitle = ""
                                    if(newsLetter[key]?.indexOf("Title: ") >= 0) {
                                        linkedinTitle = (newsLetter[key].substr(newsLetter[key].indexOf("Title: "), newsLetter[key].indexOf("\n"))).replace("Title: ", "")
                                    }
                                    if(linkedinTitle && linkedinTitle.length > 1) {
                                        newsLetter[key] = newsLetter[key].replace(newsLetter[key].substr(newsLetter[key].indexOf("Title: "), newsLetter[key].indexOf("\n")), "")
                                    }
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
                                                        "tag": "H3",
                                                        "attributes": {
                                                            "style": "text-align: center;"
                                                        },
                                                        "children": [
                                                            {
                                                                "tag": "STRONG",
                                                                "attributes": {},
                                                                "children": [
                                                                    (linkedinTitle && linkedinTitle.length > 1 && linkedinTitle) || title
                                                                ]
                                                            }
                                                        ]
                                                    },
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
                                }else{
                                    return null
                                }   
                            case "twitter":
                                if(type.length && type.includes(key) || (!type && key === "twitter")){
                                    console.log(newsLetter[key])
                                    let updatedThread = null;
                                    if(newsLetter[key]) {
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
                                        updatedThread = thread.split("<p/>")
                                        updatedThread = updatedThread.map((str: string) => {
                                            return str.replace(/^\d+\s*[-\\.\\\/)]?\s+/g, "")
                                        })
                                        updatedThread = updatedThread?.filter((text: string) => text.length > 0)
                                        if(updatedThread && updatedThread.length) updatedThread.push('This tweet was generated by @Lille_AI')
                                        console.log(updatedThread, "updatedThread") 
                                    }
                                    return {
                                        published: false,
                                        published_date: false,
                                        platform: "twitter",
                                        creation_date: Math.round(new Date().getTime() / 1000) ,
                                        tiny_mce_data: {
                                        },
                                        threads: updatedThread || [] 
                                    }      
                                }else{
                                    return null
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
            usedIdeasArr: usedIdeasArr || [],
            description,
            title
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
    userId,
    collectionName= null,
    dbName= null
}: {
    id: string
    db: any
    userId: string
    collectionName?: string | null
    dbName?: string | null
}) => {
    return await db.db(dbName? dbName : "lilleArticles").collection(collectionName ? collectionName : 'articles').findOne({
        _id: id
    })
}

export const fetchArticleUrls = async ({
    blog,
    db,
    articleId,
    collectionName= null,
    dbName= null
}: {
    blog?: any
    db: any
    articleId?: string[]
    collectionName?: string | null
    dbName?: string | null
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
        const urlsData = await db.db(dbName? dbName : "lilleArticles").collection(collectionName ? collectionName : 'articles').find({
            _id: filter
        }, {
            projection: {
                "_id": 1,
                "_source.orig_url": 1,
                "_source.source.name": 1,
                "_source.title": 1
            }
        }).toArray()
        if(urlsData?.length) {
            urlsData?.forEach((data: {_source: {orig_url: string, source: {name: string}, title: string}, _id: string}) => {
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
                } else if(data._source.source.name && data._source.source.name === "file") {
                    urlObj = {
                        url : data?._source?.orig_url,
                        source: data?._source?.title,
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

export const getSavedTime = async (db: any, blogId: string) => {
    return await db.db('lilleBlogs').collection('blogsTime').findOne({
        blogId: new ObjectID(blogId)
    })
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
        const res = await db.db('lilleAdmin').collection('tweetsQuota').updateOne(
            {userId: new ObjectID(userDetails._id)}, 
            {$set: updatedTweetsQuotaData}, 
            {upsert: true})
        return res       
    }
}

export const fetchBlogFromTopic = async (db: any, topics: string[], userId: string) => {
    try {
        let ideas: any = []
        for (let index = 0; index < topics.length; index++) {
            let keyword = topics[index];
            console.log(`Running cache topics for topic ${keyword}`)
            let articleIds: any = null
            let pythonStart = new Date()
            try {
                articleIds = await new Python({userId: userId}).uploadKeyword({keyword, timeout:60000})
            }catch(e){
                console.log(e, "error from python")
            }
            let pythonEnd = new Date()
            let texts = ""
            let imageUrl: string | null = null
            let imageSrc: string | null = null
            let article_ids: String[] = []
            let ideasArr: {
                idea: string;
                article_id: string;
            }[] = []
            let tags: String[] = []
            let ideasText = ""
            let articlesData: any[] = []
            if(articleIds) {
                articlesData = await (
                    Promise.all(
                        articleIds?.map(async (id: string, index: number) => {
                            const article = await db.db('lilleArticles').collection('articles').findOne({_id: id})
                            if(!((article.proImageLink).toLowerCase().includes('placeholder'))) {
                                imageUrl = article.proImageLink
                                imageSrc = article._source?.orig_url
                            } else {
                                if(index === (articleIds.length - 1) && !imageUrl) {
                                    imageUrl = (process.env.PLACEHOLDER_IMAGE || article.proImageLink)
                                    imageSrc = null
                                }
                            }
                            keyword = article.keyword
                            // const productsTags = (article.ner_norm?.PRODUCT && article.ner_norm?.PRODUCT.slice(0,3)) || []
                            // const organizationTags = (article.ner_norm?.ORG && article.ner_norm?.ORG.slice(0,3)) || []
                            // const personsTags = (article.ner_norm?.PERSON && article.ner_norm?.PERSON.slice(0,3)) || []
                            tags.push(...article._source.driver)
                            const name = article._source?.source?.name
                            return {
                                used_summaries: article._source.summary.slice(0, 10),
                                name: name && name === "file" ? "note" : name,
                                unused_summaries: article._source.summary.slice(10),
                                keyword: article.keyword,
                                id
                            }
                        })
                    )
                )
                articlesData.forEach((data) => {
                    data.used_summaries.forEach((summary: string, index: number) => {
                        texts += `- ${summary}\n`
                        ideasText += `${summary} `
                        ideasArr.push({idea: summary, article_id: data.id})
                    })
                    article_ids.push(data.id)
                })
            }
            try {
                let uniqueTags: String[] = [];
                tags.forEach((c) => {
                    if (!uniqueTags.includes(c)) {
                        uniqueTags.push(c);
                    }
                });
                let refUrls: {
                    url: string
                    source: string
                }[] = []
                if(articleIds && articleIds.length) refUrls = await fetchArticleUrls({db, articleId: articleIds})
                const {usedIdeasArr, updatedBlogs, description}: any = await blogGeneration({
                    db,
                    text: !articlesData.length ? keyword : texts,
                    regenerate: !articlesData.length ? false: true,
                    imageUrl: imageUrl || process.env.PLACEHOLDER_IMAGE,
                    title: keyword,
                    imageSrc,
                    ideasText,
                    ideasArr,
                    refUrls
                })
                const finalBlogObj = {
                    article_id: articleIds,
                    publish_data: updatedBlogs,
                    userId: new ObjectID(userId),
                    keyword,
                    status: "draft",
                    description,
                    tags: uniqueTags,
                    imageUrl: imageUrl ? imageUrl : process.env.PLACEHOLDER_IMAGE,
                    imageSrc,
                    date: getTimeStamp(),
                    updatedAt: getTimeStamp(),
                }
                let updatedIdeas: any = []
                articlesData.forEach((data) => {
                    data.used_summaries.forEach((summary: string) => updatedIdeas.push({
                        idea: summary,
                        article_id: data.id,
                        reference: null,
                        name: data.name,
                        used: 1,
                    }))
                })
                if(!articlesData.length) {
                    usedIdeasArr.forEach((idea: string) => updatedIdeas.push({
                        idea,
                        article_id: null,
                        reference: null,
                        used: 1,
                    }))
                }
                if(updatedIdeas && updatedIdeas.length) {
                    updatedIdeas = await (
                        Promise.all(
                            updatedIdeas.map(async (ideasData: any) => {
                                if(ideasData.article_id) {
                                    const article = await fetchArticleById({id: ideasData.article_id, db, userId})
                                    return {
                                        ...ideasData,
                                        reference: {
                                            type: "article",
                                            link: article._source.orig_url,
                                            id: ideasData.article_id
                                        }
                                    }
                                } else {
                                    return {
                                        ...ideasData
                                    }
                                }
                            })       
                        )
                    )
                }
                const insertBlog = await db.db('lilleBlogs').collection('cachedBlogs').insertOne(finalBlogObj)
                const insertBlogIdeas: any = await db.db('lilleBlogs').collection('cachedBlogIdeas').insertOne({
                    blog_id: insertBlog.insertedId,
                    ideas: updatedIdeas
                })
                ideas.push(insertBlogIdeas)
                console.log(`Completed Running cache topics for topic ${keyword}`)
            } catch(e: any) {
                console.log(e)
                throw e
            }
        }
        return ideas
    }catch(e) {
        throw e
    }
}

export const generateAtrributesList = (attributes: any) => {
    const order: any = {
        strengths: 2,
        weaknesses: 3,
        opportunities: 4,
        threats: 5,
        problems: 7,
        painPoints: 8,
        challenges: 9,
        companyProfile: 1,
        latestLaunch: 10,
        strategicFocusAreas: 11,
        keyInvestment: 13,
        keyMembers: 14,
        risks: 12
    }
    let attributesArray: string[] = []
    const sortedOrder = Object.keys(order).sort((a, b) => {
        console.log(a, b, order[b])
        if(order[a] < order[b]) return -1
        else return 1
    })
    console.log(sortedOrder)
    sortedOrder.map((key:any) => {
        if(attributes[key]) {
            attributesArray.push(`"${attributes[key].join('", "')}"`)   
        }
    })
    console.log(attributesArray)
    return attributesArray
}