import { withFilter } from 'graphql-subscriptions';
import { FetchBlog, GenerateBlogMutationArg, ReGenerateBlogMutationArg, UpdateBlogMutationArg } from 'interfaces';
import { ChatGPT } from '../../../services/chatGPT';
import { pubsub } from '../../../pubsub';
import { getBase64Image } from '../../../utils/image';
import { ObjectID } from 'bson';
import { randomUUID } from 'crypto';
import { fetchBlog, fetchBlogIdeas } from './blogsRepo';
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
                const chatGPTImage = await new ChatGPT({apiKey: availableApi.key, text, db}).fetchImage()
                newsLetter = {...newsLetter, image: chatGPTImage}
                const base64 = await getBase64Image(newsLetter.image)
                let imageUrl: string | null = null
                try {
                    const blobName = `blogs/${new Date().getTime()}.jpeg`;
                    const {url} = await new Azure({
                        blobName
                    }).getBlogUrlFromBase(base64)
                    imageUrl = url
                }catch(e){
                    console.log(e, "error from azure")
                }
                delete newsLetter.image
                let usedIdeasArr: any = []
                const updated = await (
                    Promise.all(
                        Object.keys(newsLetter).map(async (key: string) => {
                            try {
                                switch(key) {
                                    case "image":
                                        break;
                                    case "wordpress":
                                        const title = newsLetter[key].slice(newsLetter[key].indexOf("Title:"), newsLetter[key].indexOf("Content:")).trim()
                                        const content = newsLetter[key].slice(newsLetter[key].indexOf("Content:"), newsLetter[key].length).trim()
                                        console.log(content)
                                        console.log(content.split('Content:')[1])
                                        usedIdeasArr = (content.split('Content:')[1]).split('.')
                                        return {
                                            published: false,
                                            published_date: false,
                                            platform: "wordpress",
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
                                                                    title.split("Title: ")[1]
                                                                ]
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        "tag": "P",
                                                        "attributes": {},
                                                        "children": [
                                                            {
                                                                "tag": "IMG",
                                                                "attributes": {
                                                                    "style": "display: block; margin-left: auto; margin-right: auto;",
                                                                    "src": imageUrl,
                                                                    "width": "441",
                                                                    "height": "305"
                                                                },
                                                                "children": []
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        "tag": "P",
                                                        "attributes": {},
                                                        "children": []
                                                    },
                                                    {
                                                        "tag": "P",
                                                        "attributes": {},
                                                        "children": [
                                                            content.split('Content:')[1]
                                                        ]
                                                    }
                                                ]
                                            }  
                                        }   
                                    case "linkedin":
                                        return {
                                            published: false,
                                                published_date: false,
                                                platform: "linkedin",
                                                creation_date: Math.round(new Date().getTime() / 1000) ,
                                                tiny_mce_data: {
                                                    "tag": "BODY",
                                                    children: [
                                                        {
                                                            "tag": "P",
                                                            "attributes": {},
                                                            "children": [
                                                                newsLetter[key]
                                                            ]
                                                        },
                                                        {
                                                            "tag": "P",
                                                            "attributes": {},
                                                            "children": []
                                                        },
                                                        {
                                                            "tag": "P",
                                                            "attributes": {},
                                                            "children": [
                                                                {
                                                                    "tag": "IMG",
                                                                    "attributes": {
                                                                        "style": "display: block; margin-left: auto; margin-right: auto;",
                                                                        "src": imageUrl,
                                                                        "width": "441",
                                                                        "height": "305"
                                                                    },
                                                                    "children": []
                                                                }
                                                            ]
                                                        },
                                                    ]
                                                }
                                        }
                                    case "twitter":
                                        return {
                                            published: false,
                                            published_date: false,
                                            platform: "twitter",
                                            creation_date: Math.round(new Date().getTime() / 1000) ,
                                            tiny_mce_data: {
                                                "tag": "BODY",
                                                children: [
                                                    {
                                                        "tag": "P",
                                                        "attributes": {},
                                                        "children": [
                                                            newsLetter[key]
                                                        ]
                                                    },
                                                    {
                                                        "tag": "P",
                                                        "attributes": {},
                                                        "children": []
                                                    }
                                                ]
                                            }
                                        }      
                                    default:
                                        return newsLetter[key]    
                                }
                            } catch(e: any) {
                                throw e
                            }
                        })
                    )
                )
                const finalBlogObj = {
                    article_id: randomUUID(),
                    publish_data: updated,
                    userId: new ObjectID(userId)
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
        regenerate: async (
            parent: unknown, args: {options: ReGenerateBlogMutationArg}, {req, res, db, pubsub}: any
        ) => {
            const id = args.options.blog_id
            const blogDetails = await db.db('lilleBlogs').collection('blogs').findOne({id})
            const keyword = args.options.blog_id
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