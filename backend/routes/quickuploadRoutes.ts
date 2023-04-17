import { Python } from "../services/python"
import { authMiddleware } from "../middleWare/authToken"
import { fetchArticles } from "../repos"
import { ObjectID } from "bson"
import { fetchArticleById, fetchUsedBlogIdeasByIdea } from "../graphql/resolver/blogs/blogsRepo"

const express = require('express')
const router = express.Router()
const multer = require("multer");
const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({ storage: inMemoryStorage }).single('file');

router.post('/url', authMiddleware, async (req: any, res: any) => {
    const db = req.app.get('db')
    const {url, blog_id} = req.body
    const user = req.user
    if(!user) throw "No user found!"
    try {
        const articleid = await new Python({userId: user.id}).uploadUrl({url})
        const article = await fetchArticles({db, id: articleid})
        if(article) {
            let freshIdeas: any[] = []
            article?._source?.summary.forEach((summary: string, index: number) => {
                if(index < 5) {
                    freshIdeas.push({
                        idea: summary,
                        article_id: articleid,
                        used: 0
                    })
                }
            })
            if(freshIdeas && freshIdeas.length) {
                freshIdeas = await (
                    Promise.all(
                        freshIdeas.map(async (ideasData: any) => {
                            const ideaExistInBlog = await fetchUsedBlogIdeasByIdea({idea: ideasData.idea, db, userId: user.id})
                            if(ideaExistInBlog) {
                                return {
                                    ...ideasData,
                                    reference: {
                                        type: "blog",
                                        link: null,
                                        id: ideaExistInBlog._id
                                    }
                                }
                            } else if(ideasData.article_id) {
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
            if(blog_id)
                await db.db('lilleBlogs').collection('blogIdeas').updateOne({blog_id: new ObjectID(blog_id)}, {
                    $set: {
                        freshIdeas
                    }
                })
            return res.status(200).send({
                type: "SUCCESS",
                data: freshIdeas
            })
        } else {
            return res.status(400).send({
                type: "SUCCESS",
                data: "No ideas found!!"
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
    const db = req.app.get('db')
    const {keyword, blog_id} = req.body
    const user = req.user
    if(!user) throw "No user found!"
    try {
        // const articleIds = await new Python({userId: user.id}).uploadKeyword({keyword})
        const articleIds = [
            '35801043-dd12-11ed-877d-0242ac130002',
        'c399a6dd-dd12-11ed-877d-0242ac130002',
        'c5a42f45-dd12-11ed-877d-0242ac130002'
        ]
        let articlesData: any[] = []
        await (
            Promise.all(
                articleIds?.map(async (id: string) => {
                    const article = await db.db('lilleArticles').collection('articles').findOne({_id: id})
                    return (
                        article?._source?.summary?.forEach((summary: string, index: number) => index < 5 ? articlesData.push({
                            idea: summary,
                            article_id: id,
                            used: 0
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
                        const ideaExistInBlog = await fetchUsedBlogIdeasByIdea({idea: ideasData.idea, db, userId: user.id})
                        if(ideaExistInBlog) {
                            return {
                                ...ideasData,
                                reference: {
                                    type: "blog",
                                    link: null,
                                    id: ideaExistInBlog._id
                                }
                            }
                        } else if(ideasData.article_id) {
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
        if(blog_id)
            await db.db('lilleBlogs').collection('blogIdeas').updateOne({blog_id: new ObjectID(blog_id)}, {
                $set: {
                    freshIdeas
                }
            })
        return res.status(200).send({
            type: "SUCCESS",
            data: freshIdeas
        })
    }catch (e) {
        return res.status(400).send({
            type: "ERROR",
            message: e.message
        })
    }
})

router.post('/file', [authMiddleware, uploadStrategy], async (req: any, res: any) => {
    const db = req.app.get('db')
    const {blog_id} = req.body
    const file = req.file
    console.log("tada1")
    console.log(blog_id, "tada")
    console.log(req.file)
    const user = req.user
    if(!user) throw "No user found!"
    try {
        const articleid = await new Python({userId: user.id}).uploadFile({file})
        const article = await fetchArticles({db, id: articleid})
        if(article) {
            let freshIdeas: any[] = []
            article?._source?.summary.forEach((summary: string, index: number) => {
                if(index < 5) {
                    freshIdeas.push({
                        idea: summary,
                        article_id: articleid,
                        used: 0
                    })
                }
            })
            if(freshIdeas && freshIdeas.length) {
                freshIdeas = await (
                    Promise.all(
                        freshIdeas.map(async (ideasData: any) => {
                            const ideaExistInBlog = await fetchUsedBlogIdeasByIdea({idea: ideasData.idea, db, userId: user.id})
                            if(ideaExistInBlog) {
                                return {
                                    ...ideasData,
                                    reference: {
                                        type: "blog",
                                        link: null,
                                        id: ideaExistInBlog._id
                                    }
                                }
                            } else if(ideasData.article_id) {
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
            if(blog_id)
                await db.db('lilleBlogs').collection('blogIdeas').updateOne({blog_id: new ObjectID(blog_id)}, {
                    $set: {
                        freshIdeas
                    }
                })
            return res.status(200).send({
                type: "SUCCESS",
                data: freshIdeas
            })
        } else {
            return res.status(400).send({
                type: "SUCCESS",
                data: "No ideas found!!"
            })
        }
    }catch (e) {
        return res.status(400).send({
            type: "ERROR",
            message: e.message
        })
    }
})

module.exports = router