import { withFilter } from 'graphql-subscriptions';
import { BlogListArgs, FetchBlog, GenerateBlogMutationArg, IRNotifiyArgs, ReGenerateBlogMutationArg, UpdateBlogMutationArg } from 'interfaces';
import { pubsub } from '../../../pubsub';
import { ObjectID } from 'bson';
import { blogGeneration, fetchBlog, fetchBlogIdeas } from './blogsRepo';
import { Python } from '../../../services/python';

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
            return {...blogDetails, ideas: blogIdeas}
        },
        getAllBlogs: async (
            parent: unknown, args: { options: BlogListArgs }, {db, pubsub, user}: any
        ) => {
            const options = args.options
            console.log(options)
            let baseMatch: any = {
                userId: new ObjectID(user.id)
            }
            if(options.status) {
                baseMatch = {
                    ...baseMatch,
                    status: options.status
                } 
            }
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
                                    description: 1
                                }
                            },
                            {
                                $sort: {
                                    keyword: 1
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
                        image: blog.imageUrl || null
                    }
                })
                return {blogs: updatedList, count: blogLists[0].total[0].count}
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
            let keyword = args.options.keyword
            if(!keyword.length) {
                throw "No keyword passed!"
            }
            const userId = args.options.user_id
            const chatgptApis = await db.db('admin').collection('chatGPT').findOne()
            console.log(args)
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
            try {
                articleIds = await new Python({userId: userId}).uploadKeyword({keyword})
            }catch(e){
                console.log(e, "error from python")
            }
            let texts = ""
            let imageUrl: string | null = null
            let article_ids: String[] = []
            let tags: String[] = []
            const articlesData = await (
                Promise.all(
                    articleIds.map(async (id: string, index: number) => {
                        const article = await db.db('lilleArticles').collection('articles').findOne({_id: id})
                        if(!((article.proImageLink).toLowerCase().includes('placeholder'))) {
                            imageUrl = article.proImageLink
                        } else {
                            if(index === (articleIds.length - 1) && !imageUrl) imageUrl = article.proImageLink
                        }
                        keyword = article.keyword
                        const productsTags = (article.ner_norm?.PRODUCT && article.ner_norm?.PRODUCT.slice(0,3)) || []
                        const organizationTags = (article.ner_norm?.ORG && article.ner_norm?.ORG.slice(0,3)) || []
                        const personsTags = (article.ner_norm?.PERSON && article.ner_norm?.PERSON.slice(0,3)) || []
                        tags.push(...productsTags, ...organizationTags, ...personsTags)
                        return {
                            used_summaries: article._source.summary.slice(0, 5),
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
            console.log(articlesData)
            console.log(article_ids)
            console.log(texts)
            try {
                const {usedIdeasArr, updatedBlogs, description}: any = await blogGeneration({
                    db,
                    text: keyword,
                    regenerate: false,
                    imageUrl
                })
                const finalBlogObj = {
                    article_id: articleIds,
                    publish_data: updatedBlogs,
                    userId: new ObjectID(userId),
                    keyword,
                    status: "draft",
                    description,
                    tags,
                    imageUrl
                }
                let updatedIdeas: any = []
                articlesData.forEach((data) => {
                    data.used_summaries.forEach((summary: string) => updatedIdeas.push({
                        idea: summary,
                        article_id: data.id,
                        reference: null,
                        used: 1,
                    }))
                    data.unused_summaries.forEach((summary: string) => updatedIdeas.push({
                        idea: summary,
                        article_id: data.id,
                        reference: null,
                        used: 0,
                    }))
                })
                console.log(updatedIdeas)
                // const updatedIdeas = usedIdeasArr.map((idea: string) => {
                //     return {
                //         idea,
                //         article_id: finalBlogObj.article_id,
                //         reference: null,
                //         used: 1,
                //     }
                // })
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
                return {...blogDetails, ideas: blogIdeasDetails}
            } catch(e: any) {
                throw e
            }
            
        },
        regenerateBlog: async (
            parent: unknown, args: {options: ReGenerateBlogMutationArg}, {req, res, db, pubsub}: any
        ) => {
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
            let tags: string[] = []
            await (
                Promise.all(
                    articleIds.map(async (id: String, index: number) => {
                        const article = await db.db('lilleArticles').collection('articles').findOne({_id: id})
                        const productsTags = (article.ner_norm?.PRODUCT && article.ner_norm?.PRODUCT.slice(0,3)) || []
                        const organizationTags = (article.ner_norm?.ORG && article.ner_norm?.ORG.slice(0,3)) || []
                        const personsTags = (article.ner_norm?.PERSON && article.ner_norm?.PERSON.slice(0,3)) || []
                        tags.push(...productsTags, ...organizationTags, ...personsTags)
                        return {
                            used_summaries: article._source.summary.slice(0, 5),
                            unused_summaries: article._source.summary.slice(5),
                            keyword: article.keyword,
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
                    imageUrl: blog.imageUrl
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
                    return newIdeas.push(
                        {
                            idea: newIdea.text,
                            article_id: newIdea.article_id,
                            reference: null,
                            used: 1,
                        }
                    )
                })
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
                        tags
                    }
                })
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
                return {...blogDetails, ideas: blogIdeasDetails}
            } catch(e: any) {
                throw e
            }
        },
        updateBlog: async (
            parent: unknown, args: {options: UpdateBlogMutationArg}, {req, res, db, pubsub}: any
        ) => {
            const blogId = args.options.blog_id
            const tinymce_json = args.options.tinymce_json
            const platform = args.options.platform
            const blogDetails = await fetchBlog({id: blogId, db})
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
                    status: "draft"
                }
            })
            const updatedBlog = await fetchBlog({id: blogId, db})
            const blogIdeas = await fetchBlogIdeas({id: blogId, db})
            return {...updatedBlog, ideas: blogIdeas}
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
                        let article_ids: String[] = []
                        const articlesData = await (
                            Promise.all(
                                articles.map(async (id, index) => {
                                    const article = await db.db('lilleArticles').collection('articles').findOne({_id: id})
                                    if(!((article.proImageLink).toLowerCase().includes('placeholder'))) {
                                        imageUrl = article.proImageLink
                                    } else {
                                        if(index === (articles.length - 1) && !imageUrl) imageUrl = article.proImageLink
                                    }
                                    keyword = article.keyword
                                    return {
                                        used_summaries: article._source.summary.slice(0, 5),
                                        unused_summaries: article._source.summary.slice(5),
                                        keyword: article.keyword,
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
                                imageUrl
                            })
                            const finalBlogObj = {
                                article_id: article_ids,
                                publish_data: updatedBlogs,
                                userId: new ObjectID(userId),
                                keyword,
                                status: "ir_generated",
                                description,
                                imageUrl
                            }
                            let updatedIdeas: any = []
                            articlesData.forEach((data) => {
                                data.used_summaries.forEach((summary: string) => updatedIdeas.push({
                                    summary,
                                    article_id: data.id,
                                    reference: null,
                                    used: 1,
                                }))
                                data.unused_summaries.forEach((summary: string) => updatedIdeas.push({
                                    summary,
                                    article_id: data.id,
                                    reference: null,
                                    used: 0,
                                }))
                            })
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
        }
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
