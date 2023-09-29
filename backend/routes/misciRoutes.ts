import { ObjectID, ObjectId } from "mongodb";
import { Python } from "../services/python";
import { diff_minutes, getDateString, getTimeStamp } from "../utils/date";
import { publish } from "../utils/subscription";
import { blogGeneration, fetchArticleById, fetchArticleUrls, fetchBlog, fetchBlogIdeas, fetchUsedBlogIdeasByIdea, fetchUser, publishBlog } from "../graphql/resolver/blogs/blogsRepo";
import { bufferToStream, jsonToHtml } from "../utils/html";
const xlsx = require('xlsx');
const { convert } = require('html-to-text');
import { saveAs } from 'file-saver';
import {Blob} from 'buffer';
import { sendEmails } from "../utils/mailJetConfig";
const fs = require('fs')

const express = require("express");
const router = express.Router();
const multer = require("multer");
const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({ storage: inMemoryStorage }).single('file');


router.get('/export-report',async (req: any, res: any) => {
    const db = req.app.get('dbLive')
    try{
        const misciData = await db.db('lilleBlogs').collection('misciPublishedBlogs').aggregate([
            {
              $lookup:
                /**
                 * from: The target collection.
                 * localField: The local join field.
                 * foreignField: The target join field.
                 * as: The name for the results.
                 * pipeline: Optional pipeline to run on the foreign collection.
                 * let: Optional variables to use in the pipeline field stages.
                 */
                {
                  from: "blogs",
                  localField: "blogId",
                  foreignField: "_id",
                  as: "blogs",
                },
            },
            {
              $unwind: "$blogs",
            },
            {
              $addFields:
                /**
                 * newField: The new field name.
                 * expression: The new field expression.
                 */
                {
                  timestamp: {
                    $toDate: {
                      $multiply: [
                        {
                          $toLong: "$date",
                        },
                        1000,
                      ],
                    },
                  },
                },
            },
            {
              $project:
                /**
                 * specifications: The fields to
                 *   include or exclude.
                 */
                {
                  name: 1,
                  email: 1,
                  blogId: 1,
                  "blogs.description": 1,
                  timestamp: 1,
                  "blogs.question": 1,
                  "blogs.publish_data": 1,
                },
            },
        ]).toArray()
        console.log(misciData, "misciData")
        let preparedData: any[] = []
        await (
            Promise.all(
                misciData.map(async (data: any) => {
                    const publishData = data?.blogs?.publish_data.find((pd: any) => pd.platform === "wordpress")
                    let convertedData = ""
                    if(publishData) {
                        convertedData = jsonToHtml(publishData.tiny_mce_data)
                        console.log(convertedData, "convertedData")
                        const options = {
                            wordwrap: 130,
                            // ...
                        };
                        const html = convertedData.replace('""', '"');
                        const text = convert(html, options);
                        console.log(text);
                        convertedData = text
                    }
                    console.log(publishData)
                    preparedData.push({
                        "blog id": data.blogId.toString(),
                        name: data.name,
                        email: data.email,
                        "article description": data.blogs.description,
                        "formatted article": convertedData,
                        "question": data.blogs.question,
                        "date": getDateString(data.timestamp),
                    })
                })
            )
        )
        let Headers = ['blog id', 'name', 'email', 'formatted article', 'question', 'date' ];
        // preparedData = normsOccurances.map((normData: any) => {
        // return Headers.map((header) => {
        //     console.log(header, "header")
        //     return normData[header]
        // })
        // })
        console.log(preparedData, "Data")
        const wb = xlsx.utils.book_new(),
        ws = xlsx.utils.json_to_sheet(preparedData);

        xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
        xlsx.utils.sheet_add_aoa(ws, [Headers]) 
        // res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        // res.setHeader("Content-Disposition", "attachment; filename=" + "Test.xlsx");        
        const resp = await xlsx.writeFile(wb, "Test.xlsx");
        const stream = bufferToStream(resp)
        // const blob = new Blob([res], {
        //     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        // });

        // const data = fs.readFileSync('./Test.xlsx', {encoding:'base64'})
        // const base64 = Buffer.from(data,"base64")
        // const blob = new Blob([base64], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        // // console.log(blob)
        // // console.log(data)
        // saveAs(blob, "file.xlsx");
        // return res.end()

        const path = require('path');

        // Define the path to the local file you want to serve for download
        const filePath = path.join(__dirname, '../../Test.xlsx');
        console.log(__dirname, filePath,"__dirname")

        // Set the content type for the response
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        // Set the "Content-Disposition" header to specify the file name for the download
        res.setHeader('Content-Disposition', 'attachment; filename='+"MisciReport-"+getDateString(new Date())+".xlsx");

        // Create a read stream from the file and pipe it to the response
        const fileStream = fs.createReadStream(filePath);
        let streamProcess = fileStream.pipe(res)
        streamProcess.on('finish', () =>{
            console.log("Done!")
            fs.unlinkSync("Test.xlsx")
        });
    }catch(e){
        console.log(e, "e")
        return res.status(400).send({
            error: true,
            message: e.message
        })
    }
})
router.get('/weekly-report', async (req: any, res: any) => {
    const db = req.app.get('dbLive')
    try{
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)  
        console.log(sevenDaysAgo, "sevenDaysAgo")
        const misciData = await db.db('lilleBlogs').collection('blogs').aggregate([
            {
              $match:
                /**
                 * query: The query in MQL.
                 */
                {
                  $and: [
                    {
                      date: {
                        $gte: getTimeStamp(sevenDaysAgo),
                      },
                    },
                    {
                      type: "misci",
                    },
                  ],
                },
            },
            {
              $addFields: {
                timestamp: {
                  $toDate: {
                    $multiply: [
                      {
                        $toLong: "$date",
                      },
                      1000,
                    ],
                  },
                },
              },
            },
            {
              $project:
                /**
                 * specifications: The fields to
                 *   include or exclude.
                 */
                {
                  question: 1,
                  short_answer: 1,
                  detailed_answer: 1,
                  timestamp: 1,
                  date: 1,
                },
            },
        ]).toArray()
        console.log(misciData, "data")
        let preparedData: any[] = []
        await (
            Promise.all(
                misciData.map(async (data: any) => {
                    preparedData.push({
                        "blog id": data._id.toString(),
                        question: data.question,
                        "short answer": data.short_answer,
                        "detail answer": data.detailed_answer,
                        "date": getDateString(data.timestamp),
                        "timestamp": getDateString(data.timestamp, true),
                    })
                })
            )
        )
        let Headers = ['blog id', 'question', 'short answer', 'detail answer', "date", "timestamp"];
        console.log(preparedData, "Data")
        const wb = xlsx.utils.book_new(),
        ws = xlsx.utils.json_to_sheet(preparedData);

        xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
        xlsx.utils.sheet_add_aoa(ws, [Headers]) 
        // res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        // res.setHeader("Content-Disposition", "attachment; filename=" + "Test.xlsx");        
        const resp = await xlsx.writeFile(wb, "Report.xlsx");
        const path = require('path');
        const filePath = path.join(__dirname, '../../Report.xlsx');
        const fileStream = fs.createReadStream(filePath);
        var fileBuffer = Buffer.from(filePath, 'base64')
        console.log(fileBuffer, "fileBuffer")
        fs.readFile(filePath,async function(err: any,data: any){
            await sendEmails({
                to: [
                { Email: `tarun.gandhi@nowigence.com`, Name: `Tarun Gandhi` },
                { Email: `arvind.ajimal@nowigence.com`, Name: `Arvind Ajimal` },
                { Email: `subham.mahanta@nowigence.com`, Name: `Subham Mahanta` },
                { Email: `akash.sharma@nowigence.com`, Name: `Akash Sharma` }
                ],
                subject: "Weekly Misci Report",
                textMsg: "",
                htmlMsg: `
                    <p>Hello All,</p>
                    <p>Please Find weekly report</p>
                `,
                attachments: [
                    {
                        fileName: "Report.xlsx",
                        content: data,
                        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    }
                ]
            });
            fs.unlinkSync("Report.xlsx")
            return res.status(200).send({
                error: false,
                message: "Report sent!"
            })
        })
    }catch(e){
        console.log(e, "e")
        return res.status(400).send({
            error: true,
            message: e.message
        })
    }
})

router.post('/publish', async (req: any, res: any) => {
    const db = req.app.get('dbLive')
    const {blogId, email, name} = req.body
    try {
        const blog = await fetchBlog({db, id: blogId})
        if(blog){
            const publishData = await db.db('lilleBlogs').collection('misciPublishedBlogs').updateOne({
                blogId: new ObjectID(blogId)
            }, {
                $set: {
                    blogId: new ObjectID(blogId),
                    question: blog.question,
                    answers: blog.answers,
                    email,
                    name,
                    date: getTimeStamp(),
                    updatedAt: getTimeStamp(),
                }
            }, {
                upsert: true
            })
            await publishBlog({id: blogId, db, platform: "wordpress"})
            return res
            .status(200)
            .send({ error: false, message: "Published!" });    
        }else{
            return res
            .status(400)
            .send({ error: true, message: "Blog not found!" });    
        }
    }catch(e){
        return res
            .status(400)
            .send({ error: true, message: e.message });    
    }
})
router.post('/blog/save', async (req: any, res: any) => {
    try {
        const db = req.app.get('dbLive')
        const {blogId, tinymce_json, platform, imageUrl, imageSrc, description} = req.body
        const blogDetails = await fetchBlog({id: blogId, db})
        if(!blogDetails){
            return res
            .status(400)
            .send({ error: true, message: "No Blog Found!" });    
        }
        const userId = blogDetails.userId
        let updatedPublisData = blogDetails.publish_data.map((data: any) => {
            if(platform === data.platform) {
                return {
                    ...data,
                    tiny_mce_data: tinymce_json
                }
            } else {
                return {...data}
            }
        })
        await db.db('lilleBlogs').collection('blogs').updateOne({_id: new ObjectID(blogId)}, {
            $set: {
                publish_data: updatedPublisData,
                status: blogDetails.status === 'published' ? blogDetails.status : "saved",
                userId: new ObjectID(userId),
                updatedAt: getTimeStamp(),
                imageUrl: imageUrl && imageUrl.length && imageUrl !== blogDetails.imageUrl ? imageUrl : blogDetails.imageUrl,
                imageSrc: imageSrc,
                description: description || blogDetails.description,
            }
        })
        return res
                .status(200)
                .send({ error: false, data: "Saved!" });   
    }catch(e){
        return res
            .status(400)
            .send({ error: true, message: e.message });    
    } 
})
router.post('/generate', async (req: any, res: any) => {
    let {question, userId} = req.body
    const db = req.app.get('dbLive')
    const userEmail = await db.db('lilleAdmin').collection('misciEmail').findOne()
    console.log(userEmail)
    question = question.charAt(0).toUpperCase() + question.slice(1)
    try {
        const userData = await db.db('admin').collection('users').findOne({
            email: userEmail.email
        })
        let askMeAnswers = null
        try {
            askMeAnswers = await new Python({userId: userData?._id.toString()}).getAskMeAnswers(question)
        }catch(e){
            console.log(e, "python answer crashed")
            return res
            .status(400)
            .send({ error: true, message: "No answers found!" });    
        }
        console.log(askMeAnswers, "askMeAnswers")
        if(!askMeAnswers) {
            setTimeout(() => {
                publish({userId, keyword: null, step: "ANSWER_FETCHING_FAILED", data: null})
            }, 3000)
            return res
            .status(400)
            .send({ error: true, message: "No answers found!" });    
        }
        const article = askMeAnswers?.internal_results?.main_document
        console.log(article, "article")
        const answers = askMeAnswers?.internal_results?.main_document?.answer_sentence
        const shortAnswer = askMeAnswers?.internal_results?.main_document?.answer
        const title = askMeAnswers?.internal_results?.main_document?.title
        const answer_image = (askMeAnswers?.external_results?.main_document?.id && askMeAnswers?.external_results?.main_document?.id !== "Not Available" && askMeAnswers?.external_results?.main_document?.id )|| null
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
            short_answer: shortAnswer,
            detailed_answer: answers,
            answer_image: answer_image,
            status: "draft",
            // imageUrl: imageUrl ? imageUrl : process.env.PLACEHOLDER_IMAGE,
            // imageSrc,
            date: getTimeStamp(),
            updatedAt: getTimeStamp(),
            type: "misci",
            answers,
            dns: req.get('host')
        }
        const noteReferences = await db.db('lilleBlogs').collection('notesReferences').findOne({
            article_id: article.id
        })
        let notesRefUrls = []
        if(noteReferences) {
            notesRefUrls = noteReferences.urls
        }
        console.log(noteReferences, "noteReferences")
        const insertedData = await db.db('lilleBlogs').collection('blogs').insertOne(finalBlogObj)
        const data = await db.db('lilleBlogs').collection('blogs').findOne({_id: new ObjectID(insertedData.insertedId)})
        console.log(data, "data")
        setTimeout(() => {
            publish({userId, keyword: null, step: "ANSWER_FETCHING_COMPLETED", data})
        }, 3000)
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
                            name: name && (name === "file" || name === "note") ? articleData._source.title : name,
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
        console.log(noteReferences, "noteReferences")
        console.log(notesRefUrls, "notesRefUrls")
        const blogGeneratedData: any = await blogGeneration({
            db,
            text: !articlesData.length ? keyword : texts,
            regenerate: !articlesData.length ? false: true,
            imageUrl: answer_image ? answer_image : imageUrl ? imageUrl : process.env.PLACEHOLDER_IMAGE_MISCI,
            title: question,
            imageSrc,
            ideasText,
            ideasArr,
            refUrls,
            userDetails: null,
            userId: userId,
            keywords: [],
            tones: [],
            type: ["wordpress"],
            misci: true,
            notesRefUrls
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
                imageUrl: answer_image ? answer_image : imageUrl ? imageUrl : process.env.PLACEHOLDER_IMAGE_MISCI,
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
        "_source.title": 1
    }}).toArray()
    articleNames = articleNames.map((data: any) => ({_id: data._id, 
        name: data?._source?.source.name && (data?._source?.source.name === "file" || data?._source?.source.name === "note") ? data?._source.title : data?._source?.source.name
    }))
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
                        name: name && (name === "file" || name === "note") ? article._source.title : name,
                        id
                    }
                } else {
                    return
                }
            })
        )
    )
    const noteReferences = await db.db('lilleBlogs').collection('notesReferences').find({
        article_id: {
            $in: articleIds
        }
    }).toArray()
    let notesRefUrls: any[] = []
    if(noteReferences && noteReferences.length) {
        noteReferences.forEach((data: any) => {
            console.log(data.urls, "data.urls")
            notesRefUrls = [...notesRefUrls, ...data.urls]
        })
    }

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
            refUrls,
            userDetails,
            userId: userDetails._id,
            type: ["wordpress", "title"],
            misci: true,
            notesRefUrls
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

router.post('/test-upload',uploadStrategy, async (req: any, res: any) => {
    try {
        const xlsx = require('xlsx')
        const db = req.app.get('dbLive')
        console.log(req.file, "akash")
        const file = xlsx.read(req.file.buffer)
        const sheetToPick = req.body.sheet
        console.log(file,req.file, "akash")
        // Reading our test file
        const userEmail = await db.db('lilleAdmin').collection('misciEmail').findOne()
        console.log(userEmail)
        const userData = await db.db('admin').collection('users').findOne({
            email: userEmail.email
        })
        let data: any = []
        
        const sheets = file.SheetNames
        console.log(sheets, "sheets")
        console.log(sheetToPick, "sheetToPick")
        for(let i = 0; i < sheets.length; i++)
        {
            if(sheetToPick) {
                if(file.SheetNames[i] === sheetToPick) {
                    const temp = xlsx.utils.sheet_to_json(file.Sheets[sheetToPick])
                    temp.forEach((res: any) => {
                        data.push(res)
                    })
                }
            }else{
                const temp = xlsx.utils.sheet_to_json(file.Sheets[file.SheetNames[i]])
                temp.forEach((res: any) => {
                    data.push(res)
                })
            }
        }
        // Printing data
        console.log(data)
        let array: any = []
        data.forEach(async (d: any, index: number) => {
            const keys = Object.keys(d)
            const noteTitle = d[keys[0]]
            const noteUrl = d[keys[1]]
            const filterData = array.findIndex((arrD: any, i: any) => arrD.key === noteTitle)
            if(filterData > -1) {
                array[filterData]['urls'] = [
                    ...array[filterData].urls,
                    noteUrl
                ]
            }else{
                array.push({
                    key: noteTitle,
                    urls: [noteUrl]
                })
            }
            console.log(d[keys[0]], "object")
        })
        await (
            Promise.all(
                array.map(async (data: any) => {
                    console.log(data.key, "title")
                    console.log(data.urls, "title")
                    if(data.key) {
                        const article = await db.db('productionFiles').collection('nowigence').findOne({
                            $and: [
                                {"_source.title": data.key},
                                {"userMetaData.userId": new ObjectID(userData._id)}
                            ]
                        })
                        if(article) {
                            if(data.key === "All About Tomatoes") {
                                console.log(article)
                                console.log(article.userMetaData)
                                console.log(article._source.title)
                            }
                            const updated = await db.db('lilleBlogs').collection('notesReferences').updateOne({
                                article_id: article._id
                            }, {
                                $set: {
                                    article_id: article._id,
                                    urls: data.urls
                                }
                            }, {upsert: true}) 
                            console.log(updated, data.key, "updated")
                        }
                    }
                    return data
                })
            )
        )
        return res.status(200).send({
            error: false,
            message: "Data Uploaded!"
        })
    }catch(e){
        console.log(e)
        return res.status(500).send({
            error: true,
            message: e.message
        })
    }
})

module.exports = router