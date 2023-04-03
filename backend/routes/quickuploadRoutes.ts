import { Python } from "../services/python"
import { authMiddleware } from "../middleWare/authToken"
import { fetchArticles } from "../repos"
import { ObjectID } from "bson"

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
        const articleIds = await new Python({userId: user.id}).uploadKeyword({keyword})
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