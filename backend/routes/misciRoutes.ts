import { ObjectID } from "mongodb";
import { Python } from "../services/python";
import { diff_minutes, getTimeStamp } from "../utils/date";
import { publish } from "../utils/subscription";
import { blogGeneration, fetchArticleById, fetchArticleUrls } from "../graphql/resolver/blogs/blogsRepo";

const express = require("express");
const router = express.Router();


router.post('/generate', async (req: any, res: any) => {
    const {question, userId} = req.body
    const db = req.app.get('dbLive')
    const userEmail = await db.db('lilleAdmin').collection('misciEmail').findOne()
    console.log(userEmail)
    try {
        const userData = await db.db('admin').collection('users').findOne({
            email: userEmail.email
        })
        const askMeAnswers = await new Python({userId: userData?._id}).getAskMeAnswers(question)
        console.log(askMeAnswers, "askMeAnswers")
        if(!askMeAnswers) {
            publish({userId, keyword: null, step: "ANSWER_FETCHING_FAILED", data: null})
            return res
            .status(400)
            .send({ error: true, message: "No answers found!" });    
        }
        const article = askMeAnswers?.internal_results?.main_document
        console.log(article, "article")
        const answers = askMeAnswers?.internal_results?.main_document?.answer
        const title = askMeAnswers?.internal_results?.main_document?.title
        const answersObj = {
            published: false,
                published_date: false,
                platform: "answers",
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
                            "attributes": {},
                            "children": [
                                answers
                            ]
                        },
                        {
                            "tag": "P",
                            "attributes": {},
                            "children": []
                        },
                    ]
                }
        }
        const finalBlogObj = {
            article_id: [article.id],
            publish_data: [
                answersObj
            ],
            userId: new ObjectID(userData?._id),
            email: userData.email,
            keyword: title,
            question,
            status: "draft",
            // imageUrl: imageUrl ? imageUrl : process.env.PLACEHOLDER_IMAGE,
            // imageSrc,
            date: getTimeStamp(),
            updatedAt: getTimeStamp(),
            type: "misci"
        }
        const insertedData = await db.db('lilleBlogs').collection('blogs').insertOne(finalBlogObj)
        const data = await db.db('lilleBlogs').collection('blogs').findOne({_id: new ObjectID(insertedData.insertedId)})
        console.log(data, "data")
        publish({userId, keyword: null, step: "ANSWER_FETCHING_COMPLETED", data})
        const articleIds = [article.id]
        let pythonEnd = new Date()
        // let pythonRespTime = diff_minutes(pythonEnd, pythonStart)
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
        let keyword = title
        if(articleIds) {
            articlesData = await (
                Promise.all(
                    articleIds?.map(async (id: string, index: number) => {
                        const articleData = await db.db(article.db_origin).collection(userData.company).findOne({_id: id})
                        if(!((articleData.proImageLink).toLowerCase().includes('placeholder'))) {
                            imageUrl = articleData.proImageLink
                            imageSrc = articleData._source?.orig_url
                        } else {
                            if(index === (articleIds.length - 1) && !imageUrl) {
                                imageUrl = (process.env.PLACEHOLDER_IMAGE || articleData.proImageLink)
                                imageSrc = null
                            }
                        }
                        // keyword = articleData.keyword
                        // const productsTags = (article.ner_norm?.PRODUCT && article.ner_norm?.PRODUCT.slice(0,3)) || []
                        // const organizationTags = (article.ner_norm?.ORG && article.ner_norm?.ORG.slice(0,3)) || []
                        // const personsTags = (article.ner_norm?.PERSON && article.ner_norm?.PERSON.slice(0,3)) || []
                        tags.push(...articleData._source.driver)
                        const name = articleData._source?.source?.name
                        return {
                            used_summaries: articleData._source.summary.slice(0, 10),
                            name: name && name === "file" ? articleData._source.title : name,
                            unused_summaries: articleData._source.summary.slice(10),
                            keyword: articleData.keyword,
                            id
                        }
                    })
                )
            )
            articlesData.forEach((data) => {
                data.used_summaries.forEach((summary: string, index: number) => {
                    texts += `'${summary}'\n`
                    ideasText += `${summary} `
                    ideasArr.push({idea: summary, article_id: data.id})
                })
                article_ids.push(data.id)
            })
        }
        let uniqueTags: String[] = [];
        let refUrls: {
            url: string
            source: string
        }[] = []
        tags.forEach((c) => {
            if (!uniqueTags.includes(c)) {
                uniqueTags.push(c);
            }
        });
        if(articleIds && articleIds.length) refUrls = await fetchArticleUrls({db, articleId: articleIds,collectionName: userData.company, dbName: article.db_origin})
        // console.log(keyword, "akash")
        // console.log(refUrls, "refUrls")
        // console.log(ideasArr, "ideasArr")
        // console.log(articleIds, "articleIds")
        // console.log(articleIds.length, "articleIds.length")
        const blogGeneratedData: any = await blogGeneration({
            db,
            text: !articlesData.length ? keyword : texts,
            regenerate: !articlesData.length ? false: true,
            imageUrl: imageUrl || process.env.PLACEHOLDER_IMAGE,
            title: keyword,
            imageSrc,
            ideasText,
            ideasArr,
            refUrls: [],
            userDetails: null,
            userId: userId,
            keywords: [],
            tones: [],
            type: "wordpress"
        })
        let oldPublishData = data.publish_data
        // console.log(blogGeneratedData, "blogGeneratedData")
        if(blogGeneratedData) {
            const {usedIdeasArr, updatedBlogs, description,title} = blogGeneratedData
            console.log(updatedBlogs, "updatedBlogs")
            const filteredPublishedData = updatedBlogs.filter((data: any) => data && Object.keys(data).length)
            const finalBlogObj = {
                publish_data: [...filteredPublishedData, ...oldPublishData],
                description,
                tags: uniqueTags,
                imageUrl: imageUrl ? imageUrl : process.env.PLACEHOLDER_IMAGE,
                imageSrc,
                updatedAt: getTimeStamp(),
            }
            console.log([...filteredPublishedData, ...oldPublishData], "filteredPublishedData")
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
                                const articleData = await fetchArticleById({id: ideasData.article_id, db, userId, collectionName: userData.company, dbName: article.db_origin})
                                return {
                                    ...ideasData,
                                    reference: {
                                        type: "article",
                                        link: articleData._source.orig_url,
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
            await db.db('lilleBlogs').collection('blogs').updateOne({
                _id: new Object(data._id)
            }, {
                $set: finalBlogObj
            })
            const insertBlogIdeas = await db.db('lilleBlogs').collection('blogIdeas').insertOne({
                blog_id: data._id,
                ideas: updatedIdeas
            })
            let blogDetails = null
            let blogIdeasDetails = null
            if(data._id){
                const id: any = data._id
                blogDetails = await db.db('lilleBlogs').collection('blogs').findOne({_id: new ObjectID(id)})
            }
            if(insertBlogIdeas.insertedId){
                const id: any = insertBlogIdeas.insertedId
                blogIdeasDetails = await db.db('lilleBlogs').collection('blogIdeas').findOne({_id: new ObjectID(id)})
            }
            publish({userId, keyword: null, step: "BLOG_GENERATION_COMPLETED", data: {
                ...blogDetails, 
                ideas: blogIdeasDetails, 
                references: refUrls
            }})
        }else{
            console.log(blogGeneratedData, "blogGeneratedData")
            publish({userId, keyword: null, step: "SOMETHING_WENT_WRONG", data: null})
        }
        return res
        .status(200)
        .send({ error: false, message: "Answer Fetched" });
    }catch(err){
        publish({userId, keyword: null, step: "SOMETHING_WENT_WRONG", data: null})
        return res
        .status(500)
        .send({ error: true, message: err.message });
    }
})

module.exports = router