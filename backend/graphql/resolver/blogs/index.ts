import { withFilter } from 'graphql-subscriptions';
import { FetchBlog, GenerateBlogMutationArg, ReGenerateBlogMutationArg, UpdateBlogMutationArg } from 'interfaces';
import { ChatGPT } from '../../../services/chatGPT';
import { pubsub } from '../../../pubsub';
import { getBase64Image } from '../../../utils/image';
import { ObjectID } from 'bson';
import { randomUUID } from 'crypto';
import { blogGeneration, fetchBlog, fetchBlogIdeas } from './blogsRepo';
import { Azure } from '../../../services/azure';

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
            const keyword = args.options.keyword
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
            
            let newsLetter: any = {
                linkedin: null,
                twitter: null,
                wordpress: null,
                image: null
            }
            const text = keyword
            await (
                Promise.all(
                    Object.keys(newsLetter).map(async (key: string) => {
                        try {
                            if(key === "wordpress") {
                                const chatGPTText = await new ChatGPT({apiKey: availableApi.key, text: `write a large blog for ${key} on  "${text}" with title and content`, db}).textCompletion()
                                newsLetter = {...newsLetter, [key]: chatGPTText}
                            } else {
                                const chatGPTText = await new ChatGPT({apiKey: availableApi.key, text: `write a blog on "${text}" for a ${key === "medium" ? "medium" : `${key}`}`, db}).textCompletion()
                                newsLetter = {...newsLetter, [key]: chatGPTText}
                            }
                        } catch(e: any) {
                            throw e
                        }
                    })
                )
            )
            try {
                const {usedIdeasArr, updatedBlogs}: any = await blogGeneration({
                    db,
                    args: args.options,
                    text: keyword,
                    regenerate: false
                })
                const finalBlogObj = {
                    article_id: randomUUID(),
                    publish_data: updatedBlogs,
                    userId: new ObjectID(userId),
                    keyword
                }
                const updatedIdeas = usedIdeasArr.map((idea: string) => {
                    return {
                        idea,
                        article_id: finalBlogObj.article_id,
                        reference: null,
                        used: 1,
                    }
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
                const {usedIdeasArr, updatedBlogs}: any = await blogGeneration({
                    db,
                    args: args.options,
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
                if(newData.length)
                blog.publish_data = [...blog.publish_data, newData]
                let newIdeas: any = []
                blogIdeas.ideas.map((oldidea: any) => {
                    const filteredIdea = ideas.find((idea: any) => idea.text.trim() === oldidea.idea.trim())
                    if(!filteredIdea) {
                        return {
                            ...oldidea,
                            used: 1
                        }
                    } else {
                        return newIdeas.push(
                            {
                                ideas: filteredIdea.text,
                                article_id: blog.article_id,
                                reference: null,
                                used: 1,
                            }
                        )
                    }
                })
                if(newIdeas.length) 
                    blogIdeas.ideas = [...blogIdeas.ideas, newIdeas]
                
                const updateBlog = await db.db('lilleBlogs').collection('blogs').updateOne({
                    _id: new ObjectID(blog._id)
                }, {
                    $set: {
                        publish_data: blog.publish_data
                    }
                })
                const insertBlogIdeas = await db.db('lilleBlogs').collection('blogIdeas').updateOne({
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
                if(insertBlogIdeas.insertedId){
                    const id: any = blogIdeas._id
                    blogIdeasDetails = await db.db('lilleBlogs').collection('blogIdeas').findOne({_id: new ObjectID(id)})
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
                    publish_data: updatedPublisData
                }
            })
            const updatedBlog = await fetchBlog({id: blogId, db})
            return updatedBlog
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