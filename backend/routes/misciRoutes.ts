import { ObjectID } from "mongodb";
import { Python } from "../services/python";
import { diff_minutes, getTimeStamp } from "../utils/date";
import { publish } from "../utils/subscription";
import { blogGeneration, fetchArticleById, fetchArticleUrls, fetchBlog, fetchBlogIdeas, fetchUsedBlogIdeasByIdea, fetchUser } from "../graphql/resolver/blogs/blogsRepo";

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
        let dbLocation: any[] = []
        if(articleIds) {
            articlesData = await (
                Promise.all(
                    articleIds?.map(async (id: string, index: number) => {
                        const articleData = await db.db(article.db_origin).collection(userData.company).findOne({_id: id})
                        dbLocation.push({
                            articleId: id,
                            db:article.db_origin,
                            collection: userData.company
                        })
                        if(!((articleData.proImageLink).toLowerCase().includes('placeholder'))) {
                            imageUrl = articleData.proImageLink
                            imageSrc = articleData._source?.orig_url
                        } else {
                            if(index === (articleIds.length - 1) && !imageUrl) {
                                imageUrl = (process.env.PLACEHOLDER_IMAGE_MISCI || articleData.proImageLink)
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
            imageUrl: imageUrl || process.env.PLACEHOLDER_IMAGE_MISCI,
            title: question,
            imageSrc,
            ideasText,
            ideasArr,
            refUrls: [],
            userDetails: null,
            userId: userId,
            keywords: [],
            tones: [],
            type: ["wordpress", "title"]
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
                imageUrl: imageUrl ? imageUrl : process.env.PLACEHOLDER_IMAGE_MISCI,
                imageSrc,
                keyword: question,
                updatedAt: getTimeStamp(),
                dbLocation
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

router.post('/re-generate', async (req: any, res: any) => {
    const db = req.app.get('dbLive')
    const userEmail = await db.db('lilleAdmin').collection('misciEmail').findOne()
    console.log(userEmail)
    let startRequest = new Date()
    const {ideas, blog_id} = req.body
    // const ideas = args.options.ideas, blogId = args.options.blog_id;
    const blog = await fetchBlog({db, id: blog_id})
    const blogIdeas = await fetchBlogIdeas({db, id: blog_id})
    const userDetails = await db.db('admin').collection('users').findOne({
        email: userEmail.email
    })
    if(!ideas.length) {
        return res
        .status(400)
        .send({ error: true, message: "No Ideas!" });
    }
    if(!blog_id) {
        return res
        .status(400)
        .send({ error: true, message: "No Blog id passed!" });
    }
    if(!userDetails) {
        return res
        .status(400)
        .send({ error: true, message: "@No user found" });
    }
    let texts = ""
    let articleIds: string[] = []
    let ideasArr: {
        idea: string;
        article_id: string;
    }[] = []
    ideas.forEach((idea: any, index: any) => {
        if(!articleIds.includes(idea.article_id)) articleIds.push(idea.article_id)
        ideasArr.push({idea: idea.text, article_id: idea.article_id})
        return texts += `${index+1} - ${idea.text} \n`
    })
    console.log(articleIds, "articleIds")
    const dbLocation = blog.dbLocation.find((data: any) => data.articleId === articleIds[0])
    let articleNames = await db.db(dbLocation.db).collection(dbLocation.collection).find({_id: {
        $in: articleIds
    }}, {projection: {
        "_source.source.name": 1,
    }}).toArray()
    articleNames = articleNames.map((data: any) => ({_id: data._id, name: data?._source?.source.name}))
    let tags: string[] = []
    let imageUrl: string | null = null
    let imageSrc: string | null = null
    await (
        Promise.all(
            articleIds.map(async (id: String, index: number) => {
                if(id) {
                    const dbLocation = blog.dbLocation.find((data: any) => data.articleId === id)
                    const article = await db.db(dbLocation?.db).collection(dbLocation?.collection).findOne({_id: id})
                    if(!((article.proImageLink).toLowerCase().includes('placeholder'))) {
                        imageUrl = article.proImageLink
                        imageSrc = article._source?.orig_url
                    } else {
                        if(index === (articleIds.length - 1) && !imageUrl) {
                            imageUrl = (process.env.PLACEHOLDER_IMAGE_MISCI || article.proImageLink)
                            imageSrc = null
                        }
                    }
                    const name = article._source?.source?.name
                    if(article._source.driver) {
                        tags.push(...article._source.driver)
                    } else {
                        const productsTags = (article.ner_norm?.PRODUCT && article.ner_norm?.PRODUCT.slice(0,3)) || []
                        const organizationTags = (article.ner_norm?.ORG && article.ner_norm?.ORG.slice(0,3)) || []
                        const personsTags = (article.ner_norm?.PERSON && article.ner_norm?.PERSON.slice(0,3)) || []
                        tags.push(...productsTags, ...organizationTags, ...personsTags)
                    }
                    return {
                        used_summaries: article._source.summary.slice(0, 10),
                        unused_summaries: article._source.summary.slice(10),
                        keyword: article.keyword,
                        name: name && name === "file" ? "note" : name,
                        id
                    }
                } else {
                    return
                }
            })
        )
    )
    // console.log(texts)
    try {
        let refUrls: {
            url: string
            source: string
        }[] = []
        const dbLocation = blog.dbLocation.find((data: any) => data.articleId === articleIds[0])
        if(articleIds && articleIds.length) refUrls = await fetchArticleUrls({db, articleId: articleIds, dbName: dbLocation.db, collectionName: dbLocation.collection})
        let startChatGptRequest = new Date()
        const blogGeneratedData: any = await blogGeneration({
            db,
            text: texts,
            regenerate: true,
            title: blog.keyword,
            imageUrl: imageUrl ? imageUrl : blog.imageUrl,
            imageSrc,
            ideasArr,
            refUrls: [],
            userDetails,
            userId: userDetails._id,
            type: ["wordpress", "title"]
        })
        if(blogGeneratedData) {
            const {usedIdeasArr, updatedBlogs, description} = blogGeneratedData
            console.log(updatedBlogs, "updatedBlogs")
            const filteredPublishedData = updatedBlogs.filter((data: any) => data && Object.keys(data).length)
            let endChatGPTRequest = new Date()
            let respChatgptTime = diff_minutes(endChatGPTRequest, startChatGptRequest)
            console.log(respChatgptTime, "respChatgptTime")
            let newData: any = []
            filteredPublishedData.forEach((data: any, index: any) => {
                const platformUpdatedDataIndex = (blog.publish_data).slice().reverse().findIndex((pd: any) => pd.platform === data.platform)
                const finalPlatformIndex = platformUpdatedDataIndex >= 0 ? (blog.publish_data.length - 1) - platformUpdatedDataIndex : platformUpdatedDataIndex
                const platformOldData = blog.publish_data[finalPlatformIndex]
                if(platformOldData) {
                    if(!platformOldData.published) {
                        return blog.publish_data[finalPlatformIndex] = data
                    } else {
                        // console.log(data, data.published)
                        return blog.publish_data.push({...data})
                    }
                }
            })
            let newIdeas: any = []
            blogIdeas.ideas.forEach((idea: any) => {
                // ** Code for retaining old ideas on regenerating uncommented if required
                // const filteredIdea = blogIdeas.ideas.find((oldidea: any) => newIdea.text.trim() === oldidea.idea.trim())
                // if(filteredIdea) {
                //     return {
                //         ...filteredIdea,
                //         used: 1
                //     }
                // } else {
                //     return newIdeas.push(
                //         {
                //             idea: newIdea.text,
                //             article_id: newIdea.article_id,
                //             reference: null,
                //             used: 1,
                //         }
                //     )
                // }
                let name = null
                console.log(idea, "idea")
                const ideaExist = ideas.find((newidea: any) => idea.idea.trim() === newidea.text.trim())
                const filteredIdData = articleNames.find((data: any) => data._id === idea.article_id)
                console.log(articleNames)
                console.log(filteredIdData)
                if(filteredIdData) {
                    name = filteredIdData && filteredIdData.name === "file" ? "note" : filteredIdData.name
                }
                if(ideaExist) { 
                    return newIdeas.push(
                        {
                            idea: idea.idea,
                            article_id: idea.article_id,
                            reference: null,
                            used: 1,
                            name
                        }
                    )
                }else{
                    return newIdeas.push(
                        {
                            idea: idea.idea,
                            article_id: idea.article_id,
                            reference: null,
                            used: 0,
                            name
                        }
                    )
                }
            })
            console.log(newIdeas)
            let uniqueTags: String[] = [];
            tags?.forEach((c) => {
                if (!uniqueTags.includes(c)) {
                    uniqueTags.push(c);
                }
            });
            const freshIdeas = blogIdeas?.freshIdeas?.filter((ideaObj: any) => !(newIdeas.map((newIdea: any) => newIdea.idea)).includes(ideaObj.idea))
            if(newIdeas.length) blogIdeas.ideas = newIdeas
            console.log(newIdeas, "newIdeas")
            console.log(freshIdeas, "freshIdeas")
            await db.db('lilleBlogs').collection('blogs').updateOne({
                _id: new ObjectID(blog._id)
            }, {
                $set: {
                    publish_data: blog.publish_data,
                    status: "draft",
                    description,
                    article_id: articleIds,
                    tags: uniqueTags,
                    imageUrl: imageUrl ? imageUrl : blog.imageUrl,
                    imageSrc,
                    email: userDetails && userDetails.email,
                    updatedAt: getTimeStamp()
                }
            })
            if(blogIdeas.ideas && blogIdeas.ideas.length) {
                blogIdeas.ideas = await (
                    Promise.all(
                        blogIdeas.ideas.map(async (ideasData: any) => {
                            const ideaExistInBlog = await fetchUsedBlogIdeasByIdea({idea: ideasData.idea, db, userId: blog.userId})
                            if(ideasData.article_id) {
                                const dbLocation = blog.dbLocation.find((data: any) => data.articleId === ideasData.article_id)
                                const article = await fetchArticleById({id: ideasData.article_id, db, userId: blog.userId, dbName: dbLocation.db, collectionName: dbLocation.collection})
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
            console.log(blogIdeas.ideas)
            await db.db('lilleBlogs').collection('blogIdeas').updateOne({
                _id: new ObjectID(blogIdeas._id)
            }, {
                $set: {
                    ideas: blogIdeas.ideas,
                    freshIdeas
                }
            })
            let blogDetails = null
            let blogIdeasDetails = null
            let freshIdeasTags: string[] = []
            if(blogIdeas._id){
                blogIdeasDetails = await fetchBlogIdeas({id: blog_id, db})
                if(blogIdeasDetails && blogIdeasDetails?.freshIdeas?.length) {
                    await  (
                        Promise.all(
                            blogIdeasDetails.freshIdeas.map(async (idea: any) => {
                                const dbLocation = blog.dbLocation.find((data: any) => data.articleId === idea.article_id)
                                const article = await db.db(dbLocation.db).collection(dbLocation.collection).findOne({_id: idea.article_id})
                                if(article._source.driver) {
                                    freshIdeasTags.push(...article._source.driver)
                                } else {
                                    const productsTags = (article.ner_norm?.PRODUCT && article.ner_norm?.PRODUCT.slice(0,3)) || []
                                    const organizationTags = (article.ner_norm?.ORG && article.ner_norm?.ORG.slice(0,3)) || []
                                    const personsTags = (article.ner_norm?.PERSON && article.ner_norm?.PERSON.slice(0,3)) || []
                                    freshIdeasTags.push(...productsTags, ...organizationTags, ...personsTags)
                                }
                            })
                        )
                    )
                }
            }
            let uniqueFreshIdeasTags: String[] = [];
            freshIdeasTags?.forEach((c) => {
                if (!uniqueFreshIdeasTags.includes(c)) {
                    uniqueFreshIdeasTags.push(c);
                }
            });
            await db.db('lilleBlogs').collection('blogs').updateOne({
                _id: new ObjectID(blog._id)
            }, {
                $set: {
                    freshIdeasTags: uniqueFreshIdeasTags
                }
            })
            if(blog){
                const id: any = blog._id
                blogDetails = await db.db('lilleBlogs').collection('blogs').findOne({_id: new ObjectID(id)})
            }
            // let refUrls: {
            //     url: string
            //     source: string
            // }[] = []
            let refUrlsFreshIdeas: {
                url: string
                source: string
            }[] = []
            let freshIdeasArticle: string[] = []
            // if(blogDetails.article_id) {
            //     let articleIdsFromAllIdeas = [...blogDetails.article_id]
            //     if(blog) refUrls = await fetchArticleUrls({db, articleId: articleIdsFromAllIdeas})
            // }
            blogIdeasDetails?.freshIdeas?.forEach((idea: any) => idea.article_id ? freshIdeasArticle.push(idea.article_id) : false)
            if(blogDetails && freshIdeasArticle && freshIdeasArticle.length) refUrlsFreshIdeas = await fetchArticleUrls({db, articleId: freshIdeasArticle})
            let endRequest = new Date()
            let respTime = diff_minutes(endRequest, startRequest)
            return res.status(200).send({
                error: false,
                data: {...blogDetails, ideas: blogIdeasDetails, references: refUrls, respTime, freshIdeasReferences:refUrlsFreshIdeas}
            })
        }else{
            // console.log(blogGeneratedData, "blogGeneratedData")
            return res.status(400).send({
                error: true,
                message: "Something Went wrong!"
            })
        }
    } catch(e: any) {
        console.log(e)
        return res.status(500).send({
            error: true,
            message: e.message
        })
    }
})

module.exports = router