import { withFilter } from 'graphql-subscriptions';
import { FetchBlog, GenerateBlogMutationArg, IRNotifiyArgs, ReGenerateBlogMutationArg, UpdateBlogMutationArg } from 'interfaces';
import { ChatGPT } from '../../../services/chatGPT';
import { pubsub } from '../../../pubsub';
import { getBase64Image } from '../../../utils/image';
import { ObjectID } from 'bson';
import { randomUUID } from 'crypto';
import { blogGeneration, fetchBlog, fetchBlogIdeas } from './blogsRepo';
import { Azure } from '../../../services/azure';
import axios from 'axios';

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
            parent: unknown, args: any, {db, pubsub, user}: any
        ) => {
            const blogLists = await db.db('lilleBlogs').collection('blogs').find({userId: new ObjectID(user.id)}).toArray()    
            const updatedList = blogLists.map((blog: any) => {
                return {
                    _id: blog._id,
                    title: blog.keyword,
                    description: blog.description,
                    tags: [],
                    image: ""
                }
            })
            return updatedList
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
            let pythonRes: any = null
            try {
                const data = JSON.stringify({
                    "userId": userId,
                    "comp": "nowigence",
                    "topic": keyword,
                    "topicType": "other",
                    "subscriptionReason": "Select how this topic relates to you",
                    "excludedTopicKeywords": [],
                    "marketCode": [
                      "en-US"
                    ]
                });
                  
                const config: any = {
                    method: 'post',
                    url: `${process.env.PYTHON_REST_BASE_ENDPOINT}/topics_check`,
                    headers: { 
                        'Content-Type': 'application/json'
                    },
                    data : data
                };
                pythonRes = await axios(config)
            }catch(e){
                console.log(e, "error from python")
            }
            // console.log(pythonRes.data, "pythonRes")
            const articleIds = pythonRes.data
            let texts = ""
            let imageUrl: string | null = null
            let article_ids: String[] = []
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
            console.log(articlesData)
            console.log(article_ids)
            console.log(texts)
            // let newsLetter: any = {
            //     linkedin: null,
            //     twitter: null,
            //     wordpress: null,
            //     image: null
            // }
            // await (
            //     Promise.all(
            //         Object.keys(newsLetter).map(async (key: string) => {
            //             try {
            //                 if(key === "wordpress") {
            //                     const chatGPTText = await new ChatGPT({apiKey: availableApi.key, text: `write a large blog for ${key} on  "${text}" with title and content`, db}).textCompletion()
            //                     newsLetter = {...newsLetter, [key]: chatGPTText}
            //                 } else {
            //                     const chatGPTText = await new ChatGPT({apiKey: availableApi.key, text: `write a blog on "${text}" for a ${key === "medium" ? "medium" : `${key}`}`, db}).textCompletion()
            //                     newsLetter = {...newsLetter, [key]: chatGPTText}
            //                 }
            //             } catch(e: any) {
            //                 throw e
            //             }
            //         })
            //     )
            // )
            try {
                const {usedIdeasArr, updatedBlogs, description}: any = await blogGeneration({
                    db,
                    text: keyword,
                    regenerate: false,
                    imageUrl
                })
                const finalBlogObj = {
                    article_id: article_ids,
                    publish_data: updatedBlogs,
                    userId: new ObjectID(userId),
                    keyword,
                    status: "draft",
                    description
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
            ideas.forEach((idea, index) => {
                return texts += `${index+1} - ${idea.text} \n`
            })
            console.log(texts)
            try {
                const {usedIdeasArr, updatedBlogs, description}: any = await blogGeneration({
                    db,
                    text: texts,
                    regenerate: true,
                    title: blog.keyword
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
                ideas.forEach((newIdea: any) => {
                    const filteredIdea = blogIdeas.ideas.find((oldidea: any) => newIdea.text.trim() === oldidea.idea.trim())
                    if(filteredIdea) {
                        return {
                            ...filteredIdea,
                            used: 1
                        }
                    } else {
                        return newIdeas.push(
                            {
                                idea: newIdea.text,
                                article_id: blog.article_id,
                                reference: null,
                                used: 1,
                            }
                        )
                    }
                })
                if(newIdeas.length) blogIdeas.ideas = [...blogIdeas.ideas, ...newIdeas]
                
                await db.db('lilleBlogs').collection('blogs').updateOne({
                    _id: new ObjectID(blog._id)
                }, {
                    $set: {
                        publish_data: blog.publish_data,
                        status: "draft",
                        description
                    }
                })
                await db.db('lilleBlogs').collection('blogIdeas').updateOne({
                    _id: new ObjectID(blogIdeas._id)
                }, {
                    $set: {
                        ideas: blogIdeas.ideas
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
            return updatedBlog
        },
        irNotify: async (
            parent: unknown, args: {options: IRNotifiyArgs}, {db, pubsub}: any
        ) => {
            console.log(`Running IR Blog generation =====`)
            const userId = args.options.userId
            const articles = args.options.articles
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
                console.log(`Ending IR Blog generation =====`)
                return true
            } catch(e: any) {
                console.log(`Ending IR Blog generation with error ===== ${e}`)
                throw e
            }
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
