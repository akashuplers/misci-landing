import { withFilter } from 'graphql-subscriptions';
import { BlogListArgs, FetchBlog, GenerateBlogMutationArg, IRNotifiyArgs, ReGenerateBlogMutationArg, UpdateBlogMutationArg } from 'interfaces';
import { pubsub } from '../../../pubsub';
import { ObjectID } from 'bson';
import { blogGeneration, deleteBlog, fetchBlog, fetchBlogByUser, fetchBlogIdeas, fetchUser, publishBlog, updateUserCredit, deleteBlogIdeas, fetchUsedBlogIdeasByIdea, fetchArticleById, fetchArticleUrls, getSavedTime, generateAtrributesList, TMBlogGeneration } from './blogsRepo';
import { Python } from '../../../services/python';
import { diff_minutes, getTimeStamp } from '../../../utils/date';
import { sendEmails } from '../../../utils/mailJetConfig';

const SOMETHING_CHANGED_TOPIC = 'steps_completion';

let currentNumber = 0
export const blogResolvers = {
    Query: {
        increment: () => {
            return currentNumber;
        },
        trendingTopics: async (parent: unknown, args: { url: string; description: string }, {db, pubsub}: any) => {
            const topicsData = await db.db('lilleAdmin').collection('trendingTopics').findOne()
            const topics = topicsData?.topics
            // Start from the last element and swap
            // one by one. We don't need to run for
            // the first element that's why i > 0
            for (let i = topics.length - 1; i > 0; i--)
            {
                // Pick a random index from 0 to i inclusive
                let j = Math.floor(Math.random() * (i + 1));
        
                // Swap arr[i] with the element
                // at random index
                [topics[i], topics[j]] = [topics[j], topics[i]];
            }
            return topics.slice(0, 6);
        },
        fetchBlog: async (parent: unknown, args: { id: string }, {db, pubsub}: any) => {
            try {
                const id = args.id
                const blogDetails = await fetchBlog({id, db})
                const blogIdeas = await fetchBlogIdeas({id, db})
                const updatedIdeas = blogIdeas?.ideas.map((data: any) => data.summary ? ({...data, idea: data.summary, type: data.type ? data.type : "web"}) : ({...data, type: data.type ? data.type : "web"}))
                const updatedFreshIdeas = blogIdeas?.freshIdeas?.map((data: any) => data.summary ? ({...data, idea: data.summary}) : ({...data}))
                let refUrls: {
                    url: string
                    source: string
                }[] = []
                if(!blogDetails.sourcesArray || !blogDetails.sourcesArray.length) {
                    if(blogDetails.article_id) {
                        let articleIds = [...blogDetails.article_id]
                        if(blogDetails) refUrls = await fetchArticleUrls({db, articleId: articleIds})
                    }
                    refUrls = refUrls.map((data) => ({...data, type: 'web'}))
                }
                let refUrlsFreshIdeas: {
                    url: string
                    source: string
                }[] = []
                let freshIdeasArticle: string[] = []                
                blogIdeas?.freshIdeas?.forEach((idea: any) => idea.article_id ? freshIdeasArticle.push(idea.article_id) : false)
                if(blogDetails && freshIdeasArticle && freshIdeasArticle.length) refUrlsFreshIdeas = await fetchArticleUrls({db, articleId: freshIdeasArticle})
                const savedTimeData = await getSavedTime(db, blogDetails._id)
                const comments = await db.db('lilleBlogs').collection('comments').find({blogId: new ObjectID(id)}).toArray()
                const userDetail = await fetchUser({db, id: blogDetails.userId})
                return {...blogDetails, ideas: {
                    ...blogIdeas,
                    ideas: updatedIdeas,
                    freshIdeas: updatedFreshIdeas?.length ? updatedFreshIdeas : null
                }, likes: blogDetails.likes || 0,  references: blogDetails.sourcesArray && blogDetails.sourcesArray.length ? blogDetails.sourcesArray : refUrls, freshIdeasReferences:refUrlsFreshIdeas, savedTime: savedTimeData ? savedTimeData.time : null, comments, userDetail}
            }catch(e) {
                console.log(e)
            }
        },
        getAllBlogs: async (
            parent: unknown, args: { options: BlogListArgs }, {db, pubsub, user}: any
        ) => {
            const options = args.options
            let baseMatch: any = null
            if(user) {
                baseMatch = {
                    userId: new ObjectID(user.id)
                }
            }
            if(options.userName) {
                const userDetails = await db.db('lilleAdmin').collection('users').findOne({
                    $or: [
                        {
                            userName: options.userName
                        },
                        {
                            linkedinUserName: options.userName
                        },
                        {
                            googleUserName: options.userName
                        },
                        {
                            twitterUserName: options.userName
                        }
                    ]
                })
                if(!userDetails) {
                    throw "No user found!"
                }
                baseMatch = {
                    userId: new ObjectID(userDetails._id)
                }
            }
            if(options.status) {
                baseMatch = {
                    ...baseMatch,
                    status: {
                        $in: options.status
                    }
                } 
            }
            const aggregate = [
                {
                    $match : baseMatch
                },
            ]
            const blogLists = await db.db('lilleBlogs').collection('blogs').aggregate([
                ...aggregate,
                {
                    $sort: {
                        updatedAt: -1
                    }
                },
                {
                    $limit: options.page_limit
                },
                {
                    $skip: options.page_skip
                },
                {
                    $project: {
                        _id: 1,
                        keyword: 1,
                        image: "$imageUrl",
                        tags: 1,
                        description: 1,
                        status: 1,
                        date: "$updatedAt",
                    }
                }
            ]).toArray()
            const blogCount = await db.db('lilleBlogs').collection('blogs').aggregate([
                ...aggregate,
                {
                    $count: "count"
                }
            ]).toArray()
            if(blogLists.length) {
                return {blogs: blogLists, count: blogCount.length && blogCount[0]?.count ? blogCount[0]?.count : 0}
            } else {
                return {blogs: [], count: 0}
            }
        }
    },
    Mutation: {
        test: async (
            parent: unknown, args: GenerateBlogMutationArg, {db, pubsub}: any
        ) => {
            currentNumber++;
            pubsub.publish(SOMETHING_CHANGED_TOPIC, { newLink: currentNumber });
            return currentNumber
        },
        generateTMBlog: async (
            parent: unknown, args:{options: GenerateBlogMutationArg}, {req, res, db, pubsub, user}: any
        ) => {
            let startRequest = new Date()
            console.log(args.options)
            const userDetails = await fetchUser({id: user.id, db})
            if(!userDetails) {
                throw "@No user found"
            }
            if(userDetails.credits <= 0) {
                throw "@Credit exhausted"
            }
            const attributesList: string[] = generateAtrributesList(args.options)
            try {
                let uniqueTags: String[] = [];
                const blogGeneratedData: any = await TMBlogGeneration({
                    db,
                    text: attributesList,
                })
                console.log(blogGeneratedData)
                if(blogGeneratedData) {
                    const {publishedData,title, description} = blogGeneratedData
                    const finalBlogObj = {
                        article_id: [],
                        publish_data: publishedData,
                        userId: new ObjectID(user._id),
                        email: userDetails && userDetails.email,
                        keyword: title,
                        status: "draft",
                        description,
                        tags: uniqueTags,
                        imageUrl: process.env.PLACEHOLDER_IMAGE,
                        imageSrc: null,
                        date: getTimeStamp(),
                        updatedAt: getTimeStamp(),
                    }
                    // let updatedIdeas: any = []
                    // articlesData.forEach((data) => {
                    //     data.used_summaries.forEach((summary: string) => updatedIdeas.push({
                    //         idea: summary,
                    //         article_id: data.id,
                    //         reference: null,
                    //         name: data.name,
                    //         used: 1,
                    //     }))
                    // })
                    let updatedIdeas: any = []
                    attributesList.forEach((idea: string) => updatedIdeas.push({
                        idea,
                        article_id: null,
                        reference: null,
                        used: 1,
                    }))
                    if(updatedIdeas && updatedIdeas.length) {
                        updatedIdeas = await (
                            Promise.all(
                                updatedIdeas.map(async (ideasData: any) => {
                                    if(ideasData.article_id) {
                                        const article = await fetchArticleById({id: ideasData.article_id, db, userId: user._id})
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
                    const insertBlog = await db.db('lilleBlogs').collection('blogs').insertOne(finalBlogObj)
                    const insertBlogIdeas = await db.db('lilleBlogs').collection('blogIdeas').insertOne({
                        blog_id: insertBlog.insertedId,
                        ideas: updatedIdeas
                    })
                    let blogDetails = null
                    let blogIdeasDetails = null
                    if(insertBlog.insertedId){
                        const id: any = insertBlog.insertedId
                        blogDetails = await db.db('lilleBlogs').collection('blogs').findOne({_id: new ObjectID(id)})
                    }
                    if(insertBlogIdeas.insertedId){
                        const id: any = insertBlogIdeas.insertedId
                        blogIdeasDetails = await db.db('lilleBlogs').collection('blogIdeas').findOne({_id: new ObjectID(id)})
                    }
                    let endRequest = new Date()
                    let respTime = diff_minutes(endRequest, startRequest)
                    if(user && Object.keys(user).length) {
                        const updateduser = await fetchUser({id: user.id, db})
                        const updatedCredits = ((updateduser.credits || 25) - 1)
                        await updateUserCredit({id: updateduser._id, credit: updatedCredits, db})
                        if(updatedCredits <= 0) {
                            await sendEmails({
                                to: [
                                { Email: `akash.sharma@nowigence.com`, Name: `Akash Sharma` },
                                { Email: `arvind.ajimal@nowigence.com`, Name: `Arvind Ajimal` },
                                { Email: `subham.mahanta@nowigence.com`, Name: `Subham Mahanta` },
                                { Email: `vashisth@adesignguy.co`, Name: `Vashisth Bhushan` }
                                ],
                                subject: "Credit Exhausted",
                                textMsg: "",
                                htmlMsg: `
                                    <p>Hello All,</p>
                                    <p>Credit has been exhausted for below user</p>
                                    <p>User Name: ${updateduser.name} ${userDetails.lastName}</p>
                                    <p>User Email: ${updateduser.email}</p>
                                `,
                            });
                        }
                    }
                    return {...blogDetails, ideas: blogIdeasDetails, references: [], pythonRespTime: null, respTime}
                }else{
                    console.log(blogGeneratedData, "blogGeneratedData")
                    throw "Something went wrong"
                }
            } catch(e: any) {
                console.log(e)
                throw e
            }
        },  
        generate: async (
            parent: unknown, args:{options: GenerateBlogMutationArg}, {req, res, db, pubsub, user}: any
        ) => {
            let startRequest = new Date()
            let keyword = args.options.keyword
            let articleIds = args.options.article_ids
            let keywords = args.options.keywords
            let tones = args.options.tones
            if(!keyword?.length && !keywords?.length) {
                throw "No keyword passed!"
            }
            const userId = args.options.user_id
            let userDetails = null
            if(user && Object.keys(user).length) {
                userDetails = await fetchUser({id: user.id, db})
                if(!userDetails) {
                    throw "@No user found"
                }
                if(userDetails.credits <= 0) {
                    throw "@Credit exhausted"
                }
            }
            let refUrls: {
                url: string
                source: string
            }[] = []
            let pythonStart = new Date()
            const cachedBlogData = await db.db('lilleBlogs').collection('cachedBlogs').find({keyword}).sort({date: -1}).toArray()
            console.log(cachedBlogData)
            if(cachedBlogData.length) {
                const cachedBlogIdeaData = await db.db('lilleBlogs').collection('cachedBlogIdeas').findOne({blog_id: new ObjectID(cachedBlogData[0]._id)})
                delete cachedBlogData[0]._id
                delete cachedBlogIdeaData._id
                delete cachedBlogIdeaData.blog_id
                const updatedBlogs = {
                    ...cachedBlogData[0],
                    userId: new ObjectID(userId),
                    date: getTimeStamp(),
                    updatedAt: getTimeStamp(),
                }
                const updatedBlogIdeas = cachedBlogIdeaData
                const insertBlog = await db.db('lilleBlogs').collection('blogs').insertOne(updatedBlogs)
                const insertBlogIdeas = await db.db('lilleBlogs').collection('blogIdeas').insertOne({
                    blog_id: new ObjectID(insertBlog.insertedId),
                    ...updatedBlogIdeas
                })
                if(cachedBlogData[0].article_id && cachedBlogData[0].article_id.length) refUrls = await fetchArticleUrls({db, articleId: cachedBlogData[0].article_id})
                const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
                await delay(10000)
                if(user && Object.keys(user).length) {
                    const updateduser = await fetchUser({id: user.id, db})
                    const updatedCredits = ((updateduser.credits || 25) - 1)
                    await updateUserCredit({id: updateduser._id, credit: updatedCredits, db})
                    if(updatedCredits <= 0) {
                        await sendEmails({
                            to: [
                            { Email: `akash.sharma@nowigence.com`, Name: `Akash Sharma` },
                            { Email: `arvind.ajimal@nowigence.com`, Name: `Arvind Ajimal` },
                            { Email: `subham.mahanta@nowigence.com`, Name: `Subham Mahanta` },
                            { Email: `vashisth@adesignguy.co`, Name: `Vashisth Bhushan` }
                            ],
                            subject: "Credit Exhausted",
                            textMsg: "",
                            htmlMsg: `
                                <p>Hello All,</p>
                                <p>Credit has been exhausted for below user</p>
                                <p>User Name: ${updateduser.name} ${userDetails.lastName}</p>
                                <p>User Email: ${updateduser.email}</p>
                            `,
                        });
                    }
                }
                return {...cachedBlogData[0], _id: insertBlog.insertedId,  ideas: {
                    blog_id: new ObjectID(insertBlog.insertedId),
                    ...updatedBlogIdeas,
                    _id: insertBlogIdeas.insertedId
                }, references: refUrls}
            }
            if(!articleIds?.length) {
                try {
                    articleIds = await new Python({userId: userId}).uploadKeyword({keyword, timeout:60000})
                }catch(e){
                    console.log(e, "error from python")
                }
            }
            console.log(keyword, "keyword")
            // articleIds = [
            //     '97a32ca9-1710-11ee-8959-0242c0a8e002',
            //     '96345a34-1710-11ee-8959-0242c0a8e002',
            //     '9495c95a-1710-11ee-8959-0242c0a8e002',
            //     '991cd785-1710-11ee-8959-0242c0a8e002'
            // ]
            let pythonEnd = new Date()
            let pythonRespTime = diff_minutes(pythonEnd, pythonStart)
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
            if(articleIds) {
                articlesData = await (
                    Promise.all(
                        articleIds?.map(async (id: string, index: number) => {
                            const article = await db.db('lilleArticles').collection('articles').findOne({_id: id})
                            if(!((article.proImageLink).toLowerCase().includes('placeholder'))) {
                                imageUrl = article.proImageLink
                                imageSrc = article._source?.orig_url
                            } else {
                                if(index === (articleIds.length - 1) && !imageUrl) {
                                    imageUrl = (process.env.PLACEHOLDER_IMAGE || article.proImageLink)
                                    imageSrc = null
                                }
                            }
                            keyword = article.keyword
                            // const productsTags = (article.ner_norm?.PRODUCT && article.ner_norm?.PRODUCT.slice(0,3)) || []
                            // const organizationTags = (article.ner_norm?.ORG && article.ner_norm?.ORG.slice(0,3)) || []
                            // const personsTags = (article.ner_norm?.PERSON && article.ner_norm?.PERSON.slice(0,3)) || []
                            tags.push(...article._source.driver)
                            const name = article._source?.source?.name
                            return {
                                used_summaries: article._source.summary.slice(0, 10),
                                name: name && name === "file" ? article._source.title : name,
                                unused_summaries: article._source.summary.slice(10),
                                keyword: article.keyword,
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
            console.log(ideasArr, keywords, article_ids)
            try {
                let uniqueTags: String[] = [];
                tags.forEach((c) => {
                    if (!uniqueTags.includes(c)) {
                        uniqueTags.push(c);
                    }
                });
                if(articleIds && articleIds.length) refUrls = await fetchArticleUrls({db, articleId: articleIds})
                const blogGeneratedData: any = await blogGeneration({
                    db,
                    text: !articlesData.length ? keyword : texts,
                    regenerate: !articlesData.length ? false: true,
                    imageUrl: imageUrl || process.env.PLACEHOLDER_IMAGE,
                    title: keyword,
                    imageSrc,
                    ideasText,
                    ideasArr,
                    refUrls,
                    userDetails,
                    userId: (userDetails && userDetails._id) || userId,
                    keywords,
                    tones,
                })
                if(blogGeneratedData) {
                    const {usedIdeasArr, updatedBlogs, description,title} = blogGeneratedData
                    const finalBlogObj = {
                        article_id: articleIds,
                        publish_data: updatedBlogs,
                        userId: new ObjectID(userId),
                        email: userDetails && userDetails.email,
                        keyword: keyword || title,
                        status: "draft",
                        description,
                        tags: uniqueTags,
                        imageUrl: imageUrl ? imageUrl : process.env.PLACEHOLDER_IMAGE,
                        imageSrc,
                        date: getTimeStamp(),
                        updatedAt: getTimeStamp(),
                    }
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
                    const insertBlog = await db.db('lilleBlogs').collection('blogs').insertOne(finalBlogObj)
                    const insertBlogIdeas = await db.db('lilleBlogs').collection('blogIdeas').insertOne({
                        blog_id: insertBlog.insertedId,
                        ideas: updatedIdeas
                    })
                    let blogDetails = null
                    let blogIdeasDetails = null
                    if(insertBlog.insertedId){
                        const id: any = insertBlog.insertedId
                        blogDetails = await db.db('lilleBlogs').collection('blogs').findOne({_id: new ObjectID(id)})
                    }
                    if(insertBlogIdeas.insertedId){
                        const id: any = insertBlogIdeas.insertedId
                        blogIdeasDetails = await db.db('lilleBlogs').collection('blogIdeas').findOne({_id: new ObjectID(id)})
                    }
                    let endRequest = new Date()
                    let respTime = diff_minutes(endRequest, startRequest)
                    if(user && Object.keys(user).length) {
                        const updateduser = await fetchUser({id: user.id, db})
                        const updatedCredits = ((updateduser.credits || 25) - 1)
                        await updateUserCredit({id: updateduser._id, credit: updatedCredits, db})
                        if(updatedCredits <= 0) {
                            await sendEmails({
                                to: [
                                { Email: `akash.sharma@nowigence.com`, Name: `Akash Sharma` },
                                { Email: `arvind.ajimal@nowigence.com`, Name: `Arvind Ajimal` },
                                { Email: `subham.mahanta@nowigence.com`, Name: `Subham Mahanta` },
                                { Email: `vashisth@adesignguy.co`, Name: `Vashisth Bhushan` }
                                ],
                                subject: "Credit Exhausted",
                                textMsg: "",
                                htmlMsg: `
                                    <p>Hello All,</p>
                                    <p>Credit has been exhausted for below user</p>
                                    <p>User Name: ${updateduser.name} ${userDetails.lastName}</p>
                                    <p>User Email: ${updateduser.email}</p>
                                `,
                            });
                        }
                    }
                    return {...blogDetails, ideas: blogIdeasDetails, references: refUrls, pythonRespTime, respTime}
                }else{
                    console.log(blogGeneratedData, "blogGeneratedData")
                    throw "Something went wrong"
                }
            } catch(e: any) {
                console.log(e)
                throw e
            }
            
        },
        regenerateBlog: async (
            parent: unknown, args: {options: ReGenerateBlogMutationArg}, {req, res, db, pubsub, user}: any
        ) => {
            if(!user || !Object.keys(user).length) {
                throw "@No authorization"
            }
            let startRequest = new Date()
            const ideas = args.options.ideas, blogId = args.options.blog_id, useOldWebSource = args.options.useOldWebSource || false, updatedTopic = args.options.updatedTopic;
            const blog = await fetchBlog({db, id: blogId})
            const blogIdeas = await fetchBlogIdeas({db, id: blogId})
            const userDetails = await fetchUser({id: user.id, db})
            if(!userDetails) {
                throw "@No user found"
            }
            if(userDetails.credits <= 0) {
                throw "@Credit exhausted"
            }
            let texts = ""
            let articleIds: string[] = []
            let ideasArr: {
                idea: string;
                article_id: string;
            }[] = []
            ideas.forEach((idea, index) => {
                if(!articleIds.includes(idea.article_id)) articleIds.push(idea.article_id)
                ideasArr.push({idea: idea.text, article_id: idea.article_id})
                return texts += `${index+1} - ${idea.text} \n`
            })
            console.log(articleIds, "articleIds")
            let tags: string[] = []
            let imageUrl: string | null = null
            let imageSrc: string | null = null
            let webIds: string[] = []
            if((updatedTopic && updatedTopic !== blog.keyword) || (!useOldWebSource)) {
                try {
                    webIds = await new Python({userId: user.id}).uploadKeyword({keyword: updatedTopic, timeout:60000})
                    // webIds = [
                    //     '1401370b-578f-11ee-ac29-0242ac130002',
                    //     '1ac9c9dc-578f-11ee-ac29-0242ac130002',
                    //     '229281df-578f-11ee-ac29-0242ac130002',
                    //     '267ff7ef-578f-11ee-ac29-0242ac130002'
                    // ]
                    articleIds = [...articleIds, ...webIds]
                }catch(e){
                    console.log(e, "error from python")
                }
            }
            let sourcesArray = blog.sourcesArray && blog.sourcesArray.length ? blog.sourcesArray : []
            if(!sourcesArray.length) {
                sourcesArray = await (
                    Promise.all(
                        blog.article_id.map(async (id: string) => {
                            const article = await fetchArticleById({db, userId: user.id, id})
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
            let lastWebIdeas: any[] = []
            if(useOldWebSource) {
                sourcesArray.forEach((source: any) => {
                    if(source.type === "web") {
                        const filteredIdeas = blogIdeas.ideas.filter((idea: any) => idea.article_id === source.id)
                        console.log(filteredIdeas, "filteredIdeas")
                        lastWebIdeas = [...lastWebIdeas, ...filteredIdeas]
                    }
                })
            }
            lastWebIdeas.forEach((idea, index) => {
                if(!articleIds.includes(idea.article_id)) articleIds.push(idea.article_id)
                const duplicate = ideasArr.find((ideaData) => ideaData.idea === idea.idea && ideaData.article_id === idea.article_id)
                console.log(duplicate, "duplicate")
                if(!duplicate) {
                    ideasArr.push({idea: idea.idea, article_id: idea.article_id})
                    ideas.push({text: idea.idea, article_id: idea.article_id})
                    return texts += `${index+1} - ${idea.idea} \n`
                } else {
                    return
                }
            })
            // console.log(sourcesArray, "sourcesArray")
            // console.log(articleIds)
            // console.log(ideasArr)
            // console.log(lastWebIdeas)
            console.log(ideasArr, "before")
            // console.log(texts)
            // console.log(ideas)
            let newWebData: any[] = []
            if(webIds && webIds.length) {
                newWebData = await (
                    Promise.all(
                        webIds.map(async (id: String, index: number) => {
                            if(id) {
                                const article = await db.db('lilleArticles').collection('articles').findOne({_id: id})
                                if(!((article.proImageLink).toLowerCase().includes('placeholder'))) {
                                    imageUrl = article.proImageLink
                                    imageSrc = article._source?.orig_url
                                } else {
                                    if(index === (articleIds.length - 1) && !imageUrl) {
                                        imageUrl = (process.env.PLACEHOLDER_IMAGE || article.proImageLink)
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
                                sourcesArray.push({
                                    type: "web",
                                    id,
                                    source: article._source?.source?.name && (article._source?.source?.name === "file" || article._source?.source?.name === "note")  ? article._source.title : article._source?.source?.name,
                                    url: article?._source.orig_url || ""
                                })
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
                newWebData.forEach((data: any) => {
                    data.used_summaries.forEach((summary: any) => {
                        ideasArr.push({idea: summary, article_id: data.id})
                        ideas.push({text: summary, article_id: data.id})
                        const lastIndex = ideasArr.length
                        return texts += `${lastIndex+1} - ${summary} \n`
                    })
                })
            }
            console.log(ideasArr, "ideasArr")
            console.log(texts, "texts")
            // // console.log(texts)
            try {
                let refUrls: {
                    url: string
                    source: string
                }[] = []
                if(articleIds && articleIds.length) refUrls = await fetchArticleUrls({db, articleId: articleIds})
                articleIds = [...articleIds, ...blog.article_id]
                let filteredIds: string[] = []
                articleIds.forEach((id) => !filteredIds.includes(id) ? filteredIds.push(id) : null)
                console.log(filteredIds, "filteredIds")
                articleIds = filteredIds
                let articleNames = await db.db('lilleArticles').collection('articles').find({_id: {
                    $in: articleIds
                }}, {projection: {
                    "_source.source.name": 1,
                }}).toArray()
                articleNames = articleNames.map((data: any) => ({_id: data._id, name: data?._source?.source.name}))
                console.log(refUrls, "refUrls")
                console.log(sourcesArray, "sourcesArray")
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
                    userId: userDetails._id
                })
                if(blogGeneratedData) {
                    const {usedIdeasArr, updatedBlogs, description} = blogGeneratedData
                    let endChatGPTRequest = new Date()
                    let respChatgptTime = diff_minutes(endChatGPTRequest, startChatGptRequest)
                    console.log(respChatgptTime, "respChatgptTime")
                    let newData: any = []
                    updatedBlogs.forEach((data: any, index: any) => {
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
                    // if(newData.length) blog.publish_data = [...blog.publish_data, ...newData]
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
                    newWebData.forEach((data) => {
                        data.used_summaries.forEach((summary: any) => {
                            newIdeas.push({
                                idea: summary,
                                article_id: data.id,
                                reference: null,
                                used: 1,
                                name: data.name
                            })
                        })
                    })
                    const freshIdeas = blogIdeas?.freshIdeas?.filter((ideaObj: any) => !(newIdeas.map((newIdea: any) => newIdea.idea)).includes(ideaObj.idea))
                    if(newIdeas.length) blogIdeas.ideas = newIdeas
                    await db.db('lilleBlogs').collection('blogs').updateOne({
                        _id: new ObjectID(blog._id)
                    }, {
                        $set: {
                            publish_data: blog.publish_data,
                            status: "draft",
                            description,
                            article_id: articleIds,
                            keyword: updatedTopic !== blog.keyword ? updatedTopic : blog.keyword,
                            sourcesArray,
                            tags: uniqueTags,
                            imageUrl: imageUrl ? imageUrl : blog.imageUrl,
                            imageSrc,
                            email: userDetails && userDetails.email,
                            updatedAt: getTimeStamp()
                        }
                    })
                    if(newIdeas && newIdeas.length) {
                        newIdeas = await (
                            Promise.all(
                                blogIdeas.ideas.map(async (ideasData: any) => {
                                    if(ideasData.article_id) {
                                        const article = await fetchArticleById({id: ideasData.article_id, db, userId: blog.userId})
                                        const sourceFilter = sourcesArray.find((source: any) => source.id === ideasData.article_id)
                                        let type = null
                                        if(sourceFilter) {
                                            type = sourceFilter.type
                                        }
                                        return {
                                            ...ideasData,
                                            type,
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
                    console.log(newIdeas, "newIdeas")
                    console.log(freshIdeas, "freshIdeas")
                    await db.db('lilleBlogs').collection('blogIdeas').updateOne({
                        _id: new ObjectID(blogIdeas._id)
                    }, {
                        $set: {
                            ideas: newIdeas,
                            freshIdeas
                        }
                    })
                    let blogDetails = null
                    let blogIdeasDetails = null
                    let freshIdeasTags: string[] = []
                    if(blogIdeas._id){
                        blogIdeasDetails = await fetchBlogIdeas({id: blogId, db})
                        if(blogIdeasDetails && blogIdeasDetails?.freshIdeas?.length) {
                            await  (
                                Promise.all(
                                    blogIdeasDetails.freshIdeas.map(async (idea: any) => {
                                        const article = await db.db('lilleArticles').collection('articles').findOne({_id: idea.article_id})
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
                    const updatedCredits = ((userDetails.credits || 25) - 1)
                    await updateUserCredit({id: userDetails._id, credit: updatedCredits, db})
                    if(updatedCredits <= 0) {
                        await sendEmails({
                            to: [
                            { Email: `akash.sharma@nowigence.com`, Name: `Akash Sharma` },
                            { Email: `arvind.ajimal@nowigence.com`, Name: `Arvind Ajimal` },
                            { Email: `subham.mahanta@nowigence.com`, Name: `Subham Mahanta` },
                            { Email: `vashisth@adesignguy.co`, Name: `Vashisth Bhushan` }
                            ],
                            subject: "Credit Exhausted",
                            textMsg: "",
                            htmlMsg: `
                                <p>Hello All,</p>
                                <p>Credit has been exhausted for below user</p>
                                <p>User Name: ${userDetails.name} ${userDetails.lastName}</p>
                                <p>User Email: ${userDetails.email}</p>
                            `,
                        });
                    }
                    return {...blogDetails, ideas: blogIdeasDetails, references: blogDetails.sourcesArray && blogDetails.sourcesArray.length ? blogDetails.sourcesArray : refUrls, respTime, freshIdeasReferences:refUrlsFreshIdeas}
                }else{
                    console.log(blogGeneratedData, "blogGeneratedData")
                    throw "Something Went wrong!"
                }
            } catch(e: any) {
                console.log(e)
                throw e
            }
        },
        updateBlog: async (
            parent: unknown, args: {options: UpdateBlogMutationArg}, {req, res, db, pubsub, user}: any
        ) => {
            if(!Object.keys(user).length) {
                throw "@Not authorized!"
            }
            const blogId = args.options.blog_id
            const tinymce_json = args.options.tinymce_json
            const platform = args.options.platform
            const threads = args.options.threads
            const imageUrl = args.options.imageUrl
            const imageSrc = args.options.imageSrc
            const description = args.options.description && args.options.description.replace(/\n/gi, "")
            const userDetails = await fetchUser({id: user.id, db})
            const blogDetails = await fetchBlog({id: blogId, db})
            if(!blogDetails){
                throw "@No blog found"
            }
            let updatedPublisData = blogDetails.publish_data.map((data: any) => {
                if(platform === data.platform) {
                    if(!data.published) {
                        if(data.platform === 'twitter' && threads) {
                            return {
                                ...data,
                                threads
                            }
                        } else {
                            return {
                                ...data,
                                tiny_mce_data: tinymce_json
                            }
                        }
                    } else {
                        if(data.platform === 'twitter' && threads) {
                            return {
                                threads,
                                published: false,
                                platform,
                                published_date: false,
                                creation_date: Math.round(new Date().getTime() / 1000) ,
                            }
                        } else {
                            return {
                                tiny_mce_data: tinymce_json,
                                published: false,
                                platform,
                                published_date: false,
                                creation_date: Math.round(new Date().getTime() / 1000) ,
                            }
                        }
                    }
                } else {
                    return {...data}
                }
            })
            console.log(updatedPublisData)
            await db.db('lilleBlogs').collection('blogs').updateOne({_id: new ObjectID(blogId)}, {
                $set: {
                    publish_data: updatedPublisData,
                    status: blogDetails.status === 'published' ? blogDetails.status : "saved",
                    userId: new ObjectID(user.id),
                    updatedAt: getTimeStamp(),
                    imageUrl: imageUrl && imageUrl.length && imageUrl !== blogDetails.imageUrl ? imageUrl : blogDetails.imageUrl,
                    imageSrc: imageSrc,
                    description: description || blogDetails.description,
                    email: userDetails && userDetails.email,
                }
            })
            const updatedBlog = await fetchBlog({id: blogId, db})
            const blogIdeas = await fetchBlogIdeas({id: blogId, db})
            let refUrls: {
                url: string
                source: string
            }[] = []
            if(updatedBlog) refUrls = await fetchArticleUrls({db, blog: updatedBlog})
            return {...updatedBlog, ideas: blogIdeas, references: refUrls}
        },
        irNotify: async (
            parent: unknown, args: {options: IRNotifiyArgs[]}, {db, pubsub}: any
        ) => {
            console.log(`Running IR Blog generation =====`)
            const pythonData = args.options
            console.log(pythonData, "received data", getTimeStamp())
            let i = 0;
            await (async function loop() {
                return new Promise(async (resolve) => {
                    if(++i <= pythonData.length) {
                        const data = pythonData[i-1]
                        console.log(`running for data ${data.user_id}`)
                        const userId = data.user_id
                        const userDetails = await fetchUser({id: userId, db})
                        const articles = data.sequence_ids
                        let texts = ""
                        let ideasText = ""
                        let keyword = null
                        let imageUrl: String | null = null
                        let imageSrc: string | null = null
                        let article_ids: String[] = []
                        let tags: String[] = []
                        let ideasArr: {
                            idea: string;
                            article_id: string;
                        }[] = []
                        const articlesData = await (
                            Promise.all(
                                articles.map(async (id, index) => {
                                    const article = await db.db('lilleArticles').collection('articles').findOne({_id: id})
                                    const name = article._source?.source?.name
                                    // const productsTags = (article.ner_norm?.PRODUCT && article.ner_norm?.PRODUCT.slice(0,3)) || []
                                    // const organizationTags = (article.ner_norm?.ORG && article.ner_norm?.ORG.slice(0,3)) || []
                                    // const personsTags = (article.ner_norm?.PERSON && article.ner_norm?.PERSON.slice(0,3)) || []
                                    // tags.push(...productsTags, ...organizationTags, ...personsTags)
                                    if(article._source.driver) {
                                        tags.push(...article._source.driver)
                                    } else {
                                        const productsTags = (article.ner_norm?.PRODUCT && article.ner_norm?.PRODUCT.slice(0,3)) || []
                                        const organizationTags = (article.ner_norm?.ORG && article.ner_norm?.ORG.slice(0,3)) || []
                                        const personsTags = (article.ner_norm?.PERSON && article.ner_norm?.PERSON.slice(0,3)) || []
                                        tags.push(...productsTags, ...organizationTags, ...personsTags)
                                    }
                                    if(!((article.proImageLink).toLowerCase().includes('placeholder'))) {
                                        imageUrl = article.proImageLink
                                        imageSrc = article._source?.orig_url
                                    } else {
                                        if(index === (articles.length - 1) && !imageUrl) {
                                            imageUrl = (process.env.PLACEHOLDER_IMAGE || article.proImageLink)
                                            imageSrc = null
                                        }
                                    }
                                    keyword = article.keyword
                                    return {
                                        used_summaries: article._source.summary.slice(0, 10),
                                        unused_summaries: article._source.summary.slice(10),
                                        keyword: article.keyword,
                                        name: name && name === "file" ? "note" : name,
                                        id
                                    }
                                })
                            )
                        )
                        articlesData.forEach((data) => {
                            data.used_summaries.forEach((summary: string, index: number) => {
                                texts += `- ${summary}\n`
                                ideasText += `${summary} `
                                ideasArr.push({idea: summary, article_id: data.id})
                            })
                            article_ids.push(data.id)
                        })
                        try {
                            let refUrls: {
                                url: string
                                source: string
                            }[] = []
                            if(articles && articles.length) refUrls = await fetchArticleUrls({db, articleId: articles})
                            const blogGeneratedData: any = await blogGeneration({
                                db,
                                text: texts,
                                regenerate: true,
                                title: articlesData[0]?.keyword,
                                imageUrl,
                                imageSrc,
                                ideasText,
                                refUrls,
                                ideasArr,
                                userDetails,
                                userId: userDetails._id
                            })
                            if(blogGeneratedData) {
                                const {updatedBlogs, description, usedIdeasArr} = blogGeneratedData
                                let uniqueTags: String[] = [];
                                tags?.forEach((c) => {
                                    if (!uniqueTags.includes(c)) {
                                        uniqueTags.push(c);
                                    }
                                });
                                const finalBlogObj = {
                                    article_id: article_ids,
                                    publish_data: updatedBlogs,
                                    userId: new ObjectID(userId),
                                    email: userDetails && userDetails.email,
                                    keyword,
                                    status: "ir_generated",
                                    description,
                                    imageUrl: imageUrl ? imageUrl : process.env.PLACEHOLDER_IMAGE,
                                    tags: uniqueTags,
                                    imageSrc,
                                    date: getTimeStamp(),
                                    updatedAt: getTimeStamp(),
                                }
                                let updatedIdeas: any = []
                                if(!articlesData.length) {
                                    usedIdeasArr.forEach((idea: string) => updatedIdeas.push({
                                        idea,
                                        article_id: null,
                                        reference: null,
                                        used: 1,
                                    }))
                                }
                                articlesData.forEach((data) => {
                                    data.used_summaries.forEach((summary: string) => updatedIdeas.push({
                                        idea: summary,
                                        article_id: data.id,
                                        reference: null,
                                        name: data.name,
                                        used: 1,
                                    }))
                                })
                                // articlesData.forEach((data) => {
                                //     data.used_summaries.forEach((summary: string) => updatedIdeas.push({
                                //         idea:summary,
                                //         article_id: data.id,
                                //         reference: null,
                                //         used: 1,
                                //         name: data.name,
                                //     }))
                                //     // data.unused_summaries.forEach((summary: string) => updatedIdeas.push({
                                //     //     idea:summary,
                                //     //     article_id: data.id,
                                //     //     reference: null,
                                //     //     used: 0,
                                //     // }))
                                // })
                                if(updatedIdeas && updatedIdeas.length) {
                                    updatedIdeas = await (
                                        Promise.all(
                                            updatedIdeas.map(async (ideasData: any) => {
                                                const ideaExistInBlog = await fetchUsedBlogIdeasByIdea({idea: ideasData.idea, db, userId})
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
                                const insertBlog = await db.db('lilleBlogs').collection('blogs').insertOne(finalBlogObj)
                                const insertBlogIdeas = await db.db('lilleBlogs').collection('blogIdeas').insertOne({
                                    blog_id: insertBlog.insertedId,
                                    ideas: updatedIdeas
                                })
                                let blogDetails = null
                                let blogIdeasDetails = null
                                if(insertBlog.insertedId){
                                    const id: any = insertBlog.insertedId
                                    blogDetails = await db.db('lilleBlogs').collection('blogs').findOne({_id: new ObjectID(id)})
                                }
                                if(insertBlogIdeas.insertedId){
                                    const id: any = insertBlogIdeas.insertedId
                                    blogIdeasDetails = await db.db('lilleBlogs').collection('blogIdeas').findOne({_id: new ObjectID(id)})
                                }
                                resolve(setTimeout(loop, 60000))
                            }
                        } catch(e: any) {
                            console.log(`Ending IR Blog generation with error ===== ${e}`, e)
                            resolve(setTimeout(loop, 60000))
                        }
                    }
                })
            })()
        },
        publish: async (
            parent: unknown, args: {options: {blog_id: string}}, {db, pubsub, user}: any
        ) => {
            if(!user || !Object.keys(user).length) {
                throw "@Not authorized"
            }
            const {blog_id} = args.options
            const userDetails = await fetchUser({id: user.id, db})
            if(!userDetails) {
                throw "@no user found"
            }
            if(!userDetails.paid && parseInt(userDetails.credits) <= 0) {
                throw "@No free credits left!"
            }
            const blog = await fetchBlogByUser({id: blog_id, db, userId: user.id})
            if(!blog) {
                throw "@No blog found"
            }
            await publishBlog({id: blog_id, db, platform: "wordpress"})
            const savedTimeData = await getSavedTime(db, blog_id)
            return {savedTime: savedTimeData ? savedTimeData.time : null}
        },
        delete: async (
            parent: unknown, args: {options: {blog_id: string}}, {db, pubsub, user}: any
        ) => {
            if(!user || !Object.keys(user).length) {
                throw "@Not authorized"
            }
            const {blog_id} = args.options
            const userDetails = await fetchUser({id: user.id, db})
            const blog = await fetchBlogByUser({id: blog_id, db, userId: user.id})
            if(!blog) {
                throw "@no blog found"
            }
            await deleteBlog({id: blog_id, db})
            await deleteBlogIdeas({id: blog_id, db})
            return true
        },
    },
    Subscription: {
        stepCompletes: {
            subscribe: withFilter(
              (_, args, {db}) => {
                console.log("pubsub")
                return pubsub.asyncIterator([SOMETHING_CHANGED_TOPIC])
              },
              async (payload, variables): Promise<any> => {
                console.log("payload akash", payload, variables)
                // return true
                try {
                    if (
                      payload?.stepCompletes?.userId === variables.userId
                    ) {
                      return true;
                    }
                    return false;
                  } catch (error) {
                    console.log("subscription error :>> ", error);
                    return false;
                  }
              }
            ),
        },
    },
}
