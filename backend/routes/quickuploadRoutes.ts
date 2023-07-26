import { Python } from "../services/python"
import { authMiddleware } from "../middleWare/authToken"
import { fetchArticles } from "../repos"
import { ObjectID } from "bson"
import { fetchArticleById, fetchArticleUrls, fetchUsedBlogIdeasByIdea } from "../graphql/resolver/blogs/blogsRepo"
import { diff_minutes } from "../utils/date"

const express = require('express')
const router = express.Router()
const multer = require("multer");
const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({ storage: inMemoryStorage }).single('file');
const mulitUploadStrategy = multer({ storage: inMemoryStorage });

router.post('/url', authMiddleware, async (req: any, res: any) => {
    let startRequest = new Date()
    const db = req.app.get('db')
    const {url, blog_id} = req.body
    const user = req.user
    if(!user) throw "No user found!"
    try {
        let pythonStart = new Date()
        const articleid = await new Python({userId: user.id}).uploadUrl({url})
        let pythonEnd = new Date()
        let pythonRespTime = diff_minutes(pythonEnd, pythonStart)
        const article = await fetchArticles({db, id: articleid})
        const name = article._source?.source?.name
        if(article) {
            let freshIdeas: any[] = []
            let freshIdeasTags: string[] = []
            if(article._source.driver) {
                freshIdeasTags = article._source.driver
            } else {
                const productsTags = (article.ner_norm?.PRODUCT && article.ner_norm?.PRODUCT.slice(0,3)) || []
                const organizationTags = (article.ner_norm?.ORG && article.ner_norm?.ORG.slice(0,3)) || []
                const personsTags = (article.ner_norm?.PERSON && article.ner_norm?.PERSON.slice(0,3)) || []
                freshIdeasTags.push(...productsTags, ...organizationTags, ...personsTags)
            }
            article?._source?.summary.forEach((summary: string, index: number) => {
                if(index < 10) {
                    freshIdeas.push({
                        idea: summary,
                        article_id: articleid,
                        used: 0,
                        name: name && name === "file" ? "note" : name,
                    })
                }
            })
            if(freshIdeas && freshIdeas.length) {
                freshIdeas = await (
                    Promise.all(
                        freshIdeas.map(async (ideasData: any) => {
                            if(ideasData.article_id) {
                                const article = await fetchArticleById({id: ideasData.article_id, db, userId: user.id})
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
            if(blog_id){
                await db.db('lilleBlogs').collection('blogs').updateOne({_id: new ObjectID(blog_id)}, {
                    $set: {
                        freshIdeasTags
                    }
                })
                await db.db('lilleBlogs').collection('blogIdeas').updateOne({blog_id: new ObjectID(blog_id)}, {
                    $set: {
                        freshIdeas
                    }
                })
            }
            let endRequest = new Date()
            let respTime = diff_minutes(endRequest, startRequest)    
            let refUrls: {
                url: string
                source: string
            }[] = []
            if(articleid) refUrls = await fetchArticleUrls({db, articleId: [articleid]})
            return res.status(200).send({
                type: "SUCCESS",
                data: freshIdeas,
                respTime,
                pythonRespTime,
                references: refUrls,
                freshIdeasTags: freshIdeasTags,
            })
        } else {
            return res.status(400).send({
                type: "SUCCESS",
                data: "No ideas found!!",
                pythonRespTime
            })
        }
    }catch (e) {
        return res.status(400).send({
            type: "ERROR",
            message: "Host has denied the extraction from this URL. Please try again or try some other URL."
        })
    }
})

router.post('/keyword', authMiddleware, async (req: any, res: any) => {
    let startRequest = new Date()
    const db = req.app.get('db')
    const {keyword, blog_id} = req.body
    const user = req.user
    if(!user) throw "No user found!"
    try {
        let pythonStart = new Date()
        const articleIds = await new Python({userId: user.id}).uploadKeyword({keyword})
        let pythonEnd = new Date()
        let pythonRespTime = diff_minutes(pythonEnd, pythonStart)
        let articlesData: any[] = []
        let freshIdeasTags: string[] = []
        await (
            Promise.all(
                articleIds?.map(async (id: string) => {
                    const article = await db.db('lilleArticles').collection('articles').findOne({_id: id})
                    if(article._source.driver) {
                        freshIdeasTags.push(...article._source.driver)
                    } else {
                        const productsTags = (article.ner_norm?.PRODUCT && article.ner_norm?.PRODUCT.slice(0,3)) || []
                        const organizationTags = (article.ner_norm?.ORG && article.ner_norm?.ORG.slice(0,3)) || []
                        const personsTags = (article.ner_norm?.PERSON && article.ner_norm?.PERSON.slice(0,3)) || []
                        freshIdeasTags.push(...productsTags, ...organizationTags, ...personsTags)
                    }
                    const name = article._source?.source?.name
                    return (
                        article?._source?.summary?.forEach((summary: string, index: number) => index < 10 ? articlesData.push({
                            idea: summary,
                            article_id: id,
                            used: 0,
                            name: name && name === "file" ? "note" : name,
                        }) : false)
                    )
                })
            )
        )
        let freshIdeas: any[] = []
        freshIdeas = articlesData
        if(freshIdeas && freshIdeas.length) {
            freshIdeas = await (
                Promise.all(
                    freshIdeas.map(async (ideasData: any) => {
                        if(ideasData.article_id) {
                            const article = await fetchArticleById({id: ideasData.article_id, db, userId: user.id})
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
        if(blog_id){
            await db.db('lilleBlogs').collection('blogs').updateOne({_id: new ObjectID(blog_id)}, {
                $set: {
                    freshIdeasTags
                }
            })
            await db.db('lilleBlogs').collection('blogIdeas').updateOne({blog_id: new ObjectID(blog_id)}, {
                $set: {
                    freshIdeas
                }
            })
        }
        let refUrls: {
            url: string
            source: string
        }[] = []    
        if(articleIds) refUrls = await fetchArticleUrls({db, articleId: articleIds})
        let endRequest = new Date()
        let respTime = diff_minutes(endRequest, startRequest)        
        return res.status(200).send({
            type: "SUCCESS",
            data: freshIdeas,
            respTime,
            pythonRespTime,
            references: refUrls,
            freshIdeasTags
        })
    }catch (e) {
        return res.status(400).send({
            type: "ERROR",
            message: e.message
        })
    }
})

router.post('/file', [authMiddleware, uploadStrategy], async (req: any, res: any) => {
    let startRequest = new Date()
    const db = req.app.get('db')
    const {blog_id} = req.body
    const file = req.file
    const user = req.user
    if(!user) throw "No user found!"
    try {
        let pythonStart = new Date()
        const articleid = await new Python({userId: user.id}).uploadFile({file})
        let pythonEnd = new Date()
        let pythonRespTime = diff_minutes(pythonEnd, pythonStart)
        const article = await fetchArticles({db, id: articleid})
        const name = article._source?.source?.name
        if(article) {
            let freshIdeas: any[] = []
            let freshIdeasTags: string[] = []
            if(article._source.driver) {
                freshIdeasTags = article._source.driver
            } else {
                const productsTags = (article.ner_norm?.PRODUCT && article.ner_norm?.PRODUCT.slice(0,3)) || []
                const organizationTags = (article.ner_norm?.ORG && article.ner_norm?.ORG.slice(0,3)) || []
                const personsTags = (article.ner_norm?.PERSON && article.ner_norm?.PERSON.slice(0,3)) || []
                freshIdeasTags.push(...productsTags, ...organizationTags, ...personsTags)
            }
            const name = article._source?.source?.name
            article?._source?.summary.forEach((summary: string, index: number) => {
                if(index < 10) {
                    freshIdeas.push({
                        idea: summary,
                        article_id: articleid,
                        used: 0,
                        name: name && name === "file" ? "note" : name,
                    })
                }
            })
            if(freshIdeas && freshIdeas.length) {
                freshIdeas = await (
                    Promise.all(
                        freshIdeas.map(async (ideasData: any) => {
                            if(ideasData.article_id) {
                                const article = await fetchArticleById({id: ideasData.article_id, db, userId: user.id})
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
            if(blog_id){
                await db.db('lilleBlogs').collection('blogs').updateOne({_id: new ObjectID(blog_id)}, {
                    $set: {
                        freshIdeasTags
                    }
                })
                await db.db('lilleBlogs').collection('blogIdeas').updateOne({blog_id: new ObjectID(blog_id)}, {
                    $set: {
                        freshIdeas
                    }
                })
            }
            let refUrls: {
                url: string
                source: string
            }[] = []    
            if(articleid) refUrls = await fetchArticleUrls({db, articleId: [articleid]})    
            let endRequest = new Date()
            let respTime = diff_minutes(endRequest, startRequest)      
            return res.status(200).send({
                type: "SUCCESS",
                data: freshIdeas,
                respTime,
                pythonRespTime,
                references: refUrls,
                freshIdeasTags,
                name: article._source.name
            })
        } else {
            return res.status(400).send({
                type: "SUCCESS",
                data: "No ideas found!!",
                pythonRespTime
            })
        }
    }catch (e) {
        console.log(e, "error from python")
        return res.status(400).send({
            type: "ERROR",
            message: "Lille is facing difficulty in content extraction from the file. It is trying to understand the issue to rectify. Please try some other file."
        })
    }
})

router.post('/files/extract-keywords', [mulitUploadStrategy.array('files')], async (req: any, res: any) => {
    let startRequest = new Date()
    const db = req.app.get('db')
    const files = req.files
    const {userId} = req.body
    if(!userId) res.status(400).send({
        type: "ERROR",
        message: "No user id provided"
    })
    if(!files || !files.length) {
        return res.status(400).send({
            type: "ERROR",
            message: "No files provied"
        })
    }
    console.log(files, "files")
    let pythonStart = new Date()
    let unprocessedFiles: string[] = []
    const articleIds = await (
        Promise.all(
            files.map(async (file: any) => {
                try {
                    return await new Python({userId}).uploadFile({file})
                }catch(e: any){
                    unprocessedFiles.push(file.originalname)
                }
            })
        )
    )

    let pythonEnd = new Date()
    let pythonRespTime = diff_minutes(pythonEnd, pythonStart)
    console.log(articleIds)
    let keywordsData: {
        id: string;
        keywords: string[];
        url: string;
        source: string;
    }[] = []
    for (let index = 0; index < articleIds.length; index++) {
        const id = articleIds[index];
        if(id) {
            const article = await fetchArticles({db, id})
            keywordsData.push({
                id,
                url: article._source.orig_url,
                source: article._source.title,
                keywords: article._source.driver
            })
        }
    }
    if(keywordsData && keywordsData.length) {
        if(unprocessedFiles && unprocessedFiles?.length && unprocessedFiles.length !== files.length) {
            return res.status(200).send({
                type: "SUCCESS",
                data: keywordsData,
                unprocessedFiles
            })    
        }
        return res.status(200).send({
            type: "SUCCESS",
            data: keywordsData,
        })
    } else if(unprocessedFiles && unprocessedFiles?.length && unprocessedFiles.length === files.length) {
        return res.status(400).send({
            type: "ERROR",
            message: "File uploaded by you has denied the extraction, Please try some other file.",
            unprocessedFiles
        })    
    } else {
        return res.status(400).send({
            type: "SUCCESS",
            data: "No keywords found!!",
            pythonRespTime
        })
    }
})

router.post('/urls/extract-keywords', async (req: any, res: any) => {
    let startRequest = new Date()
    const db = req.app.get('db')
    const {urls, userId} = req.body
    if(!userId) res.status(400).send({
        type: "ERROR",
        message: "No user id provided!"
    })
    if(!urls || !urls.length) {
        return res.status(400).send({
            type: "ERROR",
            message: "No urls provied!"
        })
    }
    let pythonStart = new Date()
    let unprocessedUrls: string[] = []
    const articleIds = await (
        Promise.all(
            urls.map(async (url: string) => {
                try {
                    return await new Python({userId}).uploadUrl({url})
                }catch(e: any){
                    unprocessedUrls.push(url)
                }
            })
        )
    )
    let pythonEnd = new Date()
    let pythonRespTime = diff_minutes(pythonEnd, pythonStart)
    console.log(articleIds)
    let keywordsData: {
        id: string;
        keywords: string[];
        url: string;
        source: string;
    }[] = []
    for (let index = 0; index < articleIds.length; index++) {
        const id = articleIds[index];
        if(id) {
            const article = await fetchArticles({db, id})
            keywordsData.push({
                id,
                url: article._source.orig_url,
                source: article._source.source.name,
                keywords: article._source.driver
            })
        }
    }
    if(keywordsData && keywordsData.length) {
        if(unprocessedUrls && unprocessedUrls?.length && unprocessedUrls.length !== urls.length) {
            return res.status(200).send({
                type: "SUCCESS",
                data: keywordsData,
                unprocessedUrls
            })    
        }
        return res.status(200).send({
            type: "SUCCESS",
            data: keywordsData,
        })
    } else if(unprocessedUrls && unprocessedUrls?.length && unprocessedUrls.length === urls.length) {
        return res.status(400).send({
            type: "ERROR",
            message: "Host has denied the extraction from this URL. Please try again or try some other URL.",
            unprocessedUrls
        })    
    } else {
        return res.status(400).send({
            type: "SUCCESS",
            data: "No keywords found!!",
            pythonRespTime
        })
    }
})

module.exports = router