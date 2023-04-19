import { withFilter } from 'graphql-subscriptions';
import { BlogListArgs, FetchBlog, GenerateBlogMutationArg, IRNotifiyArgs, ReGenerateBlogMutationArg, UpdateBlogMutationArg } from 'interfaces';
import { pubsub } from '../../../pubsub';
import { ObjectID } from 'bson';
import { blogGeneration, deleteBlog, fetchBlog, fetchBlogByUser, fetchBlogIdeas, fetchUser, publishBlog, updateUserCredit, deleteBlogIdeas, fetchUsedBlogIdeasByIdea, fetchArticleById, fetchArticleUrls } from './blogsRepo';
import { Python } from '../../../services/python';
import { diff_minutes, getTimeStamp } from '../../../utils/date';

const SOMETHING_CHANGED_TOPIC = 'new_link';

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
            const id = args.id
            const blogDetails = await fetchBlog({id, db})
            const blogIdeas = await fetchBlogIdeas({id, db})
            const updatedIdeas = blogIdeas.ideas.map((data: any) => data.summary ? ({...data, idea: data.summary}) : ({...data}))
            const updatedFreshIdeas = blogIdeas?.freshIdeas?.map((data: any) => data.summary ? ({...data, idea: data.summary}) : ({...data}))
            let refUrls: {
                url: string
                source: string
            }[] = []
            if(blogDetails) refUrls = await fetchArticleUrls({db, blog: blogDetails})
            return {...blogDetails, ideas: {
                ...blogIdeas,
                ideas: updatedIdeas,
                freshIdeas: updatedFreshIdeas?.length ? updatedFreshIdeas : null
            }, references: refUrls}
        },
        getAllBlogs: async (
            parent: unknown, args: { options: BlogListArgs }, {db, pubsub, user}: any
        ) => {
            const options = args.options
            console.log(user)
            let baseMatch: any = {
                userId: new ObjectID(user.id)
            }
            if(options.status) {
                baseMatch = {
                    ...baseMatch,
                    status: {
                        $in: options.status
                    }
                } 
            }
            console.log(baseMatch)
            const aggregate = [
                {
                    $match : baseMatch
                },
            ]
            const blogLists = await db.db('lilleBlogs').collection('blogs').aggregate([
                {
                    $facet : {
                        "pagination": [
                            ...aggregate,
                            {
                                $project: {
                                    _id: 1,
                                    keyword: 1,
                                    imageUrl: 1,
                                    tags: 1,
                                    description: 1,
                                    status: 1,
                                    updatedAt: 1,
                                }
                            },
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
                            }
                        ],
                        "total": [
                            ...aggregate,
                            {
                                $count: 'count'
                            }
                        ]
                    }
                }
            ]).toArray()
            if(blogLists.length) {
                const updatedList = blogLists[0].pagination.map((blog: any) => {
                    return {
                        _id: blog._id,
                        title: blog.keyword,
                        description: blog.description,
                        tags: (blog?.tags?.length && blog.tags) || [],
                        image: blog.imageUrl || null,
                        status: blog.status || null,
                        date: blog.updatedAt || null
                    }
                })
                return {blogs: updatedList, count: blogLists[0].total?.length ? blogLists[0].total[0].count : 0}
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
        generate: async (
            parent: unknown, args:{options: GenerateBlogMutationArg}, {req, res, db, pubsub}: any
        ) => {
            let startRequest = new Date()
            let keyword = args.options.keyword
            if(!keyword.length) {
                throw "No keyword passed!"
            }
            const userId = args.options.user_id
            const chatgptApis = await db.db('admin').collection('chatGPT').findOne()
            await db.db('lilleAdmin').collection('activityLogs').insertOne({
                userId,
                activity: "Generate new",
                data: {
                    keyword
                }
            })
            let availableApi: any = null
            if(chatgptApis) {
                availableApi = chatgptApis.apis?.find((api: any) => !api.quotaFull)
            } else {
                throw "Something went wrong! Please connect with support team";
            }
            if(!availableApi) {
                throw "Something went wrong! Please connect with support team";
            }
            let articleIds: any = null
            let pythonStart = new Date()
            try {
                articleIds = await new Python({userId: userId}).uploadKeyword({keyword, timeout:60000})
            }catch(e){
                console.log(e, "error from python")
            }
            let pythonEnd = new Date()
            let pythonRespTime = diff_minutes(pythonEnd, pythonStart)
            let texts = ""
            let imageUrl: string | null = null
            let imageSrc: string | null = null
            let article_ids: String[] = []
            let tags: String[] = []
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
                                    imageUrl = article.proImageLink
                                    imageSrc = article._source?.orig_url
                                }
                            }
                            keyword = article.keyword
                            const productsTags = (article.ner_norm?.PRODUCT && article.ner_norm?.PRODUCT.slice(0,3)) || []
                            const organizationTags = (article.ner_norm?.ORG && article.ner_norm?.ORG.slice(0,3)) || []
                            const personsTags = (article.ner_norm?.PERSON && article.ner_norm?.PERSON.slice(0,3)) || []
                            const name = article._source?.source?.name
                            tags.push(...productsTags, ...organizationTags, ...personsTags)
                            return {
                                used_summaries: article._source.summary.slice(0, 5),
                                name: name && name === "file" ? "note" : name,
                                unused_summaries: article._source.summary.slice(5),
                                keyword: article.keyword,
                                id
                            }
                        })
                    )
                )
                console.log(tags)
                articlesData.forEach((data) => {
                    data.used_summaries.forEach((summary: string, index: number) => {
                        texts += `- ${summary}\n`
                    })
                    article_ids.push(data.id)
                })
            }
            console.log(articlesData)
            console.log(article_ids)
            console.log(texts)
            try {
                let uniqueTags: String[] = [];
                tags.forEach((c) => {
                    if (!uniqueTags.includes(c)) {
                        uniqueTags.push(c);
                    }
                });
                const {usedIdeasArr, updatedBlogs, description}: any = await blogGeneration({
                    db,
                    text: !articlesData.length ? keyword : texts,
                    regenerate: !articlesData.length ? false: true,
                    imageUrl: imageUrl || process.env.PLACEHOLDER_IMAGE,
                    title: keyword,
                    imageSrc
                })
                const finalBlogObj = {
                    article_id: articleIds,
                    publish_data: updatedBlogs,
                    userId: new ObjectID(userId),
                    keyword,
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
                                const ideaExistInBlog = await fetchUsedBlogIdeasByIdea({idea: ideasData.idea, db, userId})
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
                console.log(updatedIdeas)
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
                let refUrls: {
                    url: string
                    source: string
                }[] = []
                if(blogDetails) refUrls = await fetchArticleUrls({db, blog: blogDetails})
                let endRequest = new Date()
                let respTime = diff_minutes(endRequest, startRequest)
                return {...blogDetails, ideas: blogIdeasDetails, references: refUrls, pythonRespTime, respTime}
            } catch(e: any) {
                throw e
            }
            
        },
        regenerateBlog: async (
            parent: unknown, args: {options: ReGenerateBlogMutationArg}, {req, res, db, pubsub}: any
        ) => {
            let startRequest = new Date()
            console.log(args.options)
            const ideas = args.options.ideas, blogId = args.options.blog_id;
            const blog = await fetchBlog({db, id: blogId})
            const blogIdeas = await fetchBlogIdeas({db, id: blogId})
            let texts = ""
            let articleIds: String[] = []
            ideas.forEach((idea, index) => {
                if(!articleIds.includes(idea.article_id)) articleIds.push(idea.article_id)
                return texts += `${index+1} - ${idea.text} \n`
            })
            console.log(articleIds)
            let articleNames = await db.db('lilleArticles').collection('articles').find({_id: {
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
                        const article = await db.db('lilleArticles').collection('articles').findOne({_id: id})
                        if(!((article.proImageLink).toLowerCase().includes('placeholder'))) {
                            imageUrl = article.proImageLink
                            imageSrc = article._source?.orig_url
                        } else {
                            if(index === (articleIds.length - 1) && !imageUrl) {
                                imageUrl = article.proImageLink
                                imageSrc = article._source?.orig_url
                            }
                        }
                        const name = article._source?.source?.name
                        const productsTags = (article.ner_norm?.PRODUCT && article.ner_norm?.PRODUCT.slice(0,3)) || []
                        const organizationTags = (article.ner_norm?.ORG && article.ner_norm?.ORG.slice(0,3)) || []
                        const personsTags = (article.ner_norm?.PERSON && article.ner_norm?.PERSON.slice(0,3)) || []
                        tags.push(...productsTags, ...organizationTags, ...personsTags)
                        return {
                            used_summaries: article._source.summary.slice(0, 5),
                            unused_summaries: article._source.summary.slice(5),
                            keyword: article.keyword,
                            name: name && name === "file" ? "note" : name,
                            id
                        }
                    })
                )
            )
            // console.log(texts)
            try {
                const {usedIdeasArr, updatedBlogs, description}: any = await blogGeneration({
                    db,
                    text: texts,
                    regenerate: true,
                    title: blog.keyword,
                    imageUrl: imageUrl ? imageUrl : blog.imageUrl,
                })
                let newData: any = []
                blog.publish_data.forEach((data: any, index: any) => {
                    const platformUpdatedData = updatedBlogs.find((pd: any) => pd.platform === data.platform)
                    if(!data.published) {
                        return blog.publish_data[index] = platformUpdatedData
                    } else {
                        return newData.push({...platformUpdatedData})
                    }
                })
                if(newData.length) blog.publish_data = [...blog.publish_data, ...newData]
                let newIdeas: any = []
                ideas.forEach((newIdea) => {
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
                    const filteredIdData = articleNames.find((data: any) => data._id === newIdea.article_id)
                    if(filteredIdData) {
                        name = filteredIdData && filteredIdData.name === "file" ? "note" : filteredIdData.name
                    } 
                    return newIdeas.push(
                        {
                            idea: newIdea.text,
                            article_id: newIdea.article_id,
                            reference: null,
                            used: 1,
                            name
                        }
                    )
                })
                let uniqueTags: String[] = [];
                tags.forEach((c) => {
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
                        imageUrl: blog.imageUrl ? blog.imageUrl : imageUrl,
                        imageSrc,
                        updatedAt: getTimeStamp()
                    }
                })
                if(blogIdeas.ideas && blogIdeas.ideas.length) {
                    blogIdeas.ideas = await (
                        Promise.all(
                            blogIdeas.ideas.map(async (ideasData: any) => {
                                const ideaExistInBlog = await fetchUsedBlogIdeasByIdea({idea: ideasData.idea, db, userId: blog.userId})
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
                                    const article = await fetchArticleById({id: ideasData.article_id, db, userId: blog.userId})
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
                if(blog){
                    const id: any = blog._id
                    blogDetails = await db.db('lilleBlogs').collection('blogs').findOne({_id: new ObjectID(id)})
                }
                if(blogIdeas._id){
                    blogIdeasDetails = await fetchBlogIdeas({id: blogId, db})
                }
                let refUrls: {
                    url: string
                    source: string
                }[] = []
                if(blog) refUrls = await fetchArticleUrls({db, blog: blog})
                let endRequest = new Date()
                let respTime = diff_minutes(endRequest, startRequest)
                return {...blogDetails, ideas: blogIdeasDetails, references: refUrls, respTime}
            } catch(e: any) {
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
            const imageUrl = args.options.imageUrl
            const blogDetails = await fetchBlog({id: blogId, db})
            if(!blogDetails){
                throw "@No blog found"
            }
            let updatedPublisData = blogDetails.publish_data.map((data: any) => {
                if(platform === data.platform) {
                    if(!data.published) {
                        return {
                            ...data,
                            tiny_mce_data: tinymce_json
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
                } else {
                    return {...data}
                }
            })
            await db.db('lilleBlogs').collection('blogs').updateOne({_id: new ObjectID(blogId)}, {
                $set: {
                    publish_data: updatedPublisData,
                    status: blogDetails.status === 'published' ? blogDetails.status : "saved",
                    userId: new ObjectID(user.id),
                    updatedAt: getTimeStamp(),
                    imageUrl: imageUrl && imageUrl.length && imageUrl !== blogDetails.imageUrl ? imageUrl : blogDetails.imageUrl
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
            let i = 0;
            await (async function loop() {
                return new Promise(async (resolve) => {
                    if(++i <= pythonData.length) {
                        const data = pythonData[i-1]
                        console.log(`running for data ${data.user_id}`)
                        const userId = data.user_id
                        const articles = data.sequence_ids
                        let texts = ""
                        let keyword = null
                        let imageUrl: String | null = null
                        let imageSrc: string | null = null
                        let article_ids: String[] = []
                        let tags: String[] = []
                        const articlesData = await (
                            Promise.all(
                                articles.map(async (id, index) => {
                                    const article = await db.db('lilleArticles').collection('articles').findOne({_id: id})
                                    const name = article._source?.source?.name
                                    const productsTags = (article.ner_norm?.PRODUCT && article.ner_norm?.PRODUCT.slice(0,3)) || []
                                    const organizationTags = (article.ner_norm?.ORG && article.ner_norm?.ORG.slice(0,3)) || []
                                    const personsTags = (article.ner_norm?.PERSON && article.ner_norm?.PERSON.slice(0,3)) || []
                                    tags.push(...productsTags, ...organizationTags, ...personsTags)
                                    if(!((article.proImageLink).toLowerCase().includes('placeholder'))) {
                                        imageUrl = article.proImageLink
                                        imageSrc = article._source?.orig_url
                                    } else {
                                        if(index === (articles.length - 1) && !imageUrl) {
                                            imageUrl = article.proImageLink
                                            imageSrc = article._source?.orig_url
                                        }
                                    }
                                    keyword = article.keyword
                                    return {
                                        used_summaries: article._source.summary.slice(0, 5),
                                        unused_summaries: article._source.summary.slice(5),
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
                            })
                            article_ids.push(data.id)
                        })
                        try {
                            const {updatedBlogs, description}: any = await blogGeneration({
                                db,
                                text: texts,
                                regenerate: true,
                                title: articlesData[0]?.keyword,
                                imageUrl,
                                imageSrc
                            })
                            let uniqueTags: String[] = [];
                            tags.forEach((c) => {
                                if (!uniqueTags.includes(c)) {
                                    uniqueTags.push(c);
                                }
                            });
                            const finalBlogObj = {
                                article_id: article_ids,
                                publish_data: updatedBlogs,
                                userId: new ObjectID(userId),
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
                            articlesData.forEach((data) => {
                                data.used_summaries.forEach((summary: string) => updatedIdeas.push({
                                    idea:summary,
                                    article_id: data.id,
                                    reference: null,
                                    used: 1,
                                }))
                                // data.unused_summaries.forEach((summary: string) => updatedIdeas.push({
                                //     idea:summary,
                                //     article_id: data.id,
                                //     reference: null,
                                //     used: 0,
                                // }))
                            })
                            if(updatedIdeas && updatedIdeas.length) {
                                updatedIdeas = await (
                                    Promise.all(
                                        updatedIdeas.map(async (ideasData: any) => {
                                            const ideaExistInBlog = await fetchUsedBlogIdeasByIdea({idea: ideasData.idea, db, userId})
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
                        } catch(e: any) {
                            console.log(`Ending IR Blog generation with error ===== ${e}`)
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
            const updatedCredits = ((userDetails.credits || 25) - 1)
            await db.db('lilleAdmin').collection('users').updateOne({_id: new ObjectID(userDetails._id)}, {$set: {credits: updatedCredits}})
            await updateUserCredit({id: user._id, credit: updatedCredits, db})
            await publishBlog({id: blog_id, db, platform: "wordpress"})
            return true
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
        newLink: {
            subscribe: withFilter(
              (_, args, {db}) => {
                console.log("pubsub")
                return pubsub.asyncIterator([SOMETHING_CHANGED_TOPIC])
              },
              async (payload, variables): Promise<any> => {
                console.log("payload", payload)
                return true
              }
            ),
        },
    },
}
