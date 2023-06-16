import { diff_minutes, getTimeStamp } from "../utils/date";
import { Azure } from "../services/azure";
import { ObjectID } from "bson";
import { blogGeneration, fetchArticleById, fetchArticleUrls, fetchBlogFromTopic, fetchUser, updateUserCredit } from "../graphql/resolver/blogs/blogsRepo";
import { randomUUID } from "crypto";
import { ChatGPT } from "../services/chatGPT";
import { Google } from "../services/google";
import { Python } from "../services/python";

const getStream = require('into-stream')
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { BlockBlobClient } = require('@azure/storage-blob');
const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({ storage: inMemoryStorage }).single('file');

const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

const getBlobName = (originalName: any) => {
    return `blogs/${originalName}`;
};


router.post('/image', uploadStrategy, async (req: any, res: any) => {
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
router.post('/image/base64', async (req: any, res: any) => {
    const rawdata = req.body.base64;
    const path = req.body.path || "blogs"
    const blobName = `${path}/${new Date().getTime()}.jpeg`;
    try {
        const {url} = await new Azure({
            blobName
        }).getBlogUrlFromBase(rawdata)
        res.status(200).send({
            type: "SUCCESS",
            url
        })
    } catch (e) {
        res.status(400).send({
            type: "ERROR",
            message: e
        })
    }
})

router.post('/static-blog', async (req: any, res: any) => {
    const db = req.app.get('db')
    const {blog, ideas, imageUrl, tags, title, imageSource} = req.body
    const user = await fetchUser({db, id: "643fbcfcb18352c0d4c1596c"})
    console.log(blog, ideas, imageUrl)
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
    const updatedBlog = await (
        Promise.all(
            blog.map(async (data: any) => {
                if(data.platform === 'linkedin') {
                    const chatGPTText = await new ChatGPT({apiKey: availableApi.key, text: `write a blog on topic ${title} for linkedin post with tags under 3000 characters`, db}).textCompletion()
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
                                            chatGPTText
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
                }else if(data.platform === 'twitter') {
                    const chatGPTText = await new ChatGPT({apiKey: availableApi.key, text: `write a blog on topic ${title} for twitter post with tags under 280 characters`, db}).textCompletion()
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
                                        chatGPTText
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
                } else {
                    return {
                        ...data
                    }
                } 
            })
        )
    )
    let urlsData: any[] = [] 
    let ideasArray: any[] = [] 
    ideas.forEach((data: any) => {
        const find = urlsData.find((c: any) => c._source.orig_url === data.link)
        ideasArray.push({
            idea: data.idea,
            used: 1,
            reference: {
                type: "article",
                link: data.link,
            }  
        })
        if(!find) {
            urlsData.push({
                _id: randomUUID(),
                _source: {source: {name: data.source}, orig_url: data.link}, 
                createdAt: getTimeStamp(),
                userMetaData: [
                    {
                        userId: new ObjectID(user._id),
                        permanent: true,
                        date: getTimeStamp()
                    }
                ],
                pubStatus: "private",
                proImageLink: imageUrl,
                sharedBy: `${user.name} ${user.lastName}`,
                userList: [user._id]
            })
        }
    })
    let articleIdsArray: any[] = []
    const articleIds = await (
        Promise.all (
            urlsData.map(async (data: any) => {
                const article = await db.db('lilleArticles').collection('articles').insertOne(data)
                articleIdsArray.push({id: article.insertedId, link: data._source.source.orig_url})
                return article.insertedId
            })
        )
    )
    ideasArray = ideasArray.map((data: any) => {
        const find = articleIdsArray.find((d: any) => d.link === data.link)
        if(find) {
            return {
                ...data,
                article_id: find.id,
            }
        } else {
            return {
                ...data,
            }
        }
    })
    const blogData = {
        article_id: articleIds,
        publish_data: updatedBlog,
        userId: new ObjectID(user._id),
        keyword: title,
        tags: tags.split(','),
        imageUrl,
        imageSource,
        data: getTimeStamp(),
        updatedAt: getTimeStamp(),
        status: "draft"
    }
    const blogInserted = await db.db('lilleBlogs').collection('blogs').insertOne(blogData)
    await db.db('lilleBlogs').collection('blogIdeas').insertOne({
        blog_id: new ObjectID(blogInserted.insertedId),
        ideas: ideasArray
    })
    res.status(200).send({
        type: "SUCCESS",
        data: blogInserted
    })
})

router.get('/topics', async (req: any, res: any) => {
    try {
        const db = req.app.get('db')
        const token = await new Google().getAuthToken()
        if(process.env.GOOGLE_SHEET_ID) {
            const sheet = await new Google().getSpreadSheet({spreadsheetId: process.env.GOOGLE_SHEET_ID, auth: token})
            const {values} = await new Google().getSpreadSheetValues({spreadsheetId: process.env.GOOGLE_SHEET_ID, auth: token, sheetName: sheet?.data?.sheets && sheet?.data?.sheets?.length && sheet?.data?.sheets?.[0]?.properties?.title})
            const user = await db.db('lilleAdmin').collection('users').findOne({email: "admin@nowigence.com"})
            const userId = user._id
            if(values && values?.length) {
                let topics: string[] = values.map((value: string[]) => value[0])
                console.log(topics)
                console.log(user)
                const ideas = await fetchBlogFromTopic(db, topics, userId)
            }
            res.status(200).send({
                type: "SUCCESS",
                message: "Blog cached!"
            })
        }
    }catch(e) {
        return res.status(400).send({
            type: "ERROR",
            message: e.message
        })
    }
})

module.exports = router