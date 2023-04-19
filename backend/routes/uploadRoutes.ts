import { getTimeStamp } from "../utils/date";
import { Azure } from "../services/azure";
import { ObjectID } from "bson";
import { fetchUser } from "../graphql/resolver/blogs/blogsRepo";
import { randomUUID } from "crypto";

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
        publish_data: blog,
        userId: new ObjectID(user._id),
        keyword: title,
        tags: tags.split(','),
        imageUrl,
        imageSource,
        data: getTimeStamp(),
        updatedAt: getTimeStamp()
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

module.exports = router