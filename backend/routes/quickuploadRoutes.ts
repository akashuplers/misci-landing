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
                if(index < 5) {
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
            message: e.message
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
                if(index < 5) {
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
        return res.status(400).send({
            type: "ERROR",
            message: "Lille is facing difficulty in content extraction from the file. It is trying to understand the issue to rectify. Please try some other file."
        })
    }
})

module.exports = router