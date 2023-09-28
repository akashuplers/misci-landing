import { Python } from "../services/python"
import { authMiddleware } from "../middleWare/authToken"
import { fetchArticles } from "../repos"
import { ObjectID } from "bson"
import { fetchArticleById, fetchArticleUrls, fetchBlog, fetchBlogIdeas, fetchUsedBlogIdeasByIdea } from "../graphql/resolver/blogs/blogsRepo"
import { diff_minutes } from "../utils/date"

const express = require('express')
const router = express.Router()
const multer = require("multer");
const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({ storage: inMemoryStorage }).single('file');
const mulitUploadStrategy = multer({ storage: inMemoryStorage });

router.post('/urls', authMiddleware, async (req: any, res: any) => {
    let startRequest = new Date()
    const db = req.app.get('db')
    const {urls, userId, blog_id} = req.body
    try {
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
        let unusedIdeas: any[] = []
        let freshIdeasTags: string[] = []
        const blog = await fetchBlog({id: blog_id, db})
        const blogIdeas = await fetchBlogIdeas({id: blog_id, db})
        let sourcesArray = blog.sourcesArray && blog.sourcesArray.length ? blog.sourcesArray : []
        if(!sourcesArray.length) {
            sourcesArray = await (
                Promise.all(
                    blog.article_id.map(async (id: string) => {
                        const article = await fetchArticles({db, id})
                        return {
                            type: "web",
                            id,
                            source: article._source?.source?.name && (article._source?.source?.name === "file" || article._source?.source?.name === "note")  ? article._source.title : article._source?.source?.name,
                            url: article?._source.orig_url || ""
                        }
                    })
                )
            )
        }
        for (let index = 0; index < articleIds.length; index++) {
            const id = articleIds[index];
            if(id) {
                const article = await fetchArticles({db, id})
                if(article) {
                    const name = article._source?.source?.name
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
                            unusedIdeas.push({
                                idea: summary,
                                article_id: id,
                                used: 0,
                                name: name && (name === "file" || name === "note")  ? article._source.title : name,
                                type: "url",
                            })
                        }
                    })
                    if(unusedIdeas && unusedIdeas.length) {
                        unusedIdeas = await (
                            Promise.all(
                                unusedIdeas.map(async (ideasData: any) => {
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
                    sourcesArray.push({
                        type: "url",
                        id: id,
                        source: article._source?.source?.name && (article._source?.source?.name === "file" || article._source?.source?.name === "note")  ? article._source.title : article._source?.source?.name,
                        url: article._source.orig_url
                    })
                }
            }
        }
        const filteredIds = articleIds.filter((id: string) => id !== null && id !== undefined)
        console.log(filteredIds, "filteredIds")
        console.log(blog.article_id, "filteredIds")
        const updatedBlog = await db.db('lilleBlogs').collection('blogs').findOneAndUpdate({_id: new ObjectID(blog_id)}, {
            $set: {
                sourcesArray: sourcesArray,
                article_id: blog.article_id.concat(filteredIds)
            }
        }, {returnDocument: "after"})
        const updatedBlogIdeas = await db.db('lilleBlogs').collection('blogIdeas').findOneAndUpdate({blog_id: new ObjectID(blog_id)}, {
            $set: {
                ideas: blogIdeas?.ideas?.concat(unusedIdeas)      
            }
        }, {returnDocument: "after"})
        if(unusedIdeas && unusedIdeas.length) {
            if(unprocessedUrls && unprocessedUrls?.length && unprocessedUrls.length !== urls.length) {
                return res.status(200).send({
                    type: "SUCCESS",
                    blog: updatedBlog?.value || blog,
                    blogIdeas: updatedBlogIdeas?.value || blogIdeas,
                    unprocessedUrls
                })    
            }
            return res.status(200).send({
                type: "SUCCESS",
                blog: updatedBlog?.value || blog,
                blogIdeas: updatedBlogIdeas?.value || blogIdeas,
            })
        } else if(unprocessedUrls && unprocessedUrls?.length && unprocessedUrls.length === urls.length) {
            return res.status(400).send({
                type: "ERROR",
                message: "Host has denied the extraction from this URL. Please try again or try some other URL.",
                unprocessedUrls
            })    
        } else {
            return res.status(400).send({
                type: "ERROR",
                data: "No data processed!!",
                pythonRespTime
            })
        }
    }catch(e){
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

router.post('/files', [authMiddleware, mulitUploadStrategy.array('files')], async (req: any, res: any) => {
    let startRequest = new Date()
    const db = req.app.get('db')
    const {blog_id} = req.body
    const user = req.user
    if(!user) throw "No user found!"
    try {
        let startRequest = new Date()
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
        let unusedIdeas: any[] = []
        let freshIdeasTags: string[] = []
        const blog = await fetchBlog({id: blog_id, db})
        const blogIdeas = await fetchBlogIdeas({id: blog_id, db})
        let sourcesArray = blog.sourcesArray && blog.sourcesArray.length ? blog.sourcesArray : []
        if(!sourcesArray.length) {
            sourcesArray = await (
                Promise.all(
                    blog.article_id.map(async (id: string) => {
                        const article = await fetchArticles({db, id})
                        return {
                            type: "web",
                            id,
                            source: article._source?.source?.name && (article._source?.source?.name === "file" || article._source?.source?.name === "note")  ? article._source.title : article._source?.source?.name,
                            url: article?._source.orig_url || ""
                        }
                    })
                )
            )
        }
        for (let index = 0; index < articleIds.length; index++) {
            const id = articleIds[index];
            if(id) {
                const article = await fetchArticles({db, id})
                if(article) {
                    const name = article._source?.source?.name
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
                            unusedIdeas.push({
                                idea: summary,
                                article_id: id,
                                used: 0,
                                name: name && (name === "file" || name === "note")  ? article._source.title : name,
                                type: "file",
                            })
                        }
                    })
                    if(unusedIdeas && unusedIdeas.length) {
                        unusedIdeas = await (
                            Promise.all(
                                unusedIdeas.map(async (ideasData: any) => {
                                    if(ideasData.article_id) {
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
                }
                sourcesArray.push({
                    type: "file",
                    id: id,
                    source: article._source?.source?.name && (article._source?.source?.name === "file" || article._source?.source?.name === "note")  ? article._source.title : article._source?.source?.name,
                    url: null
                })
            }
        }
        const filteredIds = articleIds.filter((id: string) => id !== null && id !== undefined)
        console.log(filteredIds, "filteredIds")
        console.log(sourcesArray, "filteredIds")
        console.log(unusedIdeas, "filteredIds")
        const updatedBlog = await db.db('lilleBlogs').collection('blogs').findOneAndUpdate({_id: new ObjectID(blog_id)}, {
            $set: {
                sourcesArray: sourcesArray,
                article_id: blog.article_id.concat(filteredIds)
            }
        }, {returnDocument: "after"})
        const updatedBlogIdeas = await db.db('lilleBlogs').collection('blogIdeas').findOneAndUpdate({blog_id: new ObjectID(blog_id)}, {
            $set: {
                ideas: blogIdeas?.ideas?.concat(unusedIdeas)      
            }
        }, {returnDocument: "after"})
        if(unusedIdeas && unusedIdeas.length) {
            if(unprocessedFiles && unprocessedFiles?.length && unprocessedFiles.length !== files.length) {
                return res.status(200).send({
                    type: "SUCCESS",
                    blog: updatedBlog?.value || blog,
                    blogIdeas: updatedBlogIdeas?.value || blogIdeas,
                    unprocessedFiles
                })    
            }
            return res.status(200).send({
                type: "SUCCESS",
                blog: updatedBlog?.value || blog,
                blogIdeas: updatedBlogIdeas?.value || blogIdeas,
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

router.post('/keyword/extract-keywords', async (req: any, res: any) => {
    let startRequest = new Date()
    const db = req.app.get('db')
    const {keyword, userId} = req.body
    try {
        let pythonStart = new Date()
        const articleIds = await new Python({userId}).uploadKeyword({keyword})
        let pythonEnd = new Date()
        let pythonRespTime = diff_minutes(pythonEnd, pythonStart)
        let keywordsData: {
            id: string;
            keywords: string[];
            url: string;
            source: string;
        }[] = []
        await (
            Promise.all(
                articleIds?.map(async (id: string) => {
                    const article = await db.db('lilleArticles').collection('articles').findOne({_id: id})
                    if(article._source.driver) {
                        keywordsData.push({
                            id,
                            url: article._source.orig_url,
                            source: article._source.source.name,
                            keywords: article._source.driver
                        })
                    }
                })
            )
        )
        if(keywordsData && keywordsData.length) {
            return res.status(200).send({
                type: "SUCCESS",
                data: keywordsData,
                pythonRespTime
            })        
        } else {
            return res.status(400).send({
                type: "SUCCESS",
                data: "No keywords found!!",
                pythonRespTime
            })
        }        

    }catch (e) {
        return res.status(400).send({
            type: "ERROR",
            message: `Lille could not use "${keyword}" this time, you can try again.`
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