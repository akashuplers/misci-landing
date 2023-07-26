import { ObjectID, ObjectId } from "mongodb";
import { fetchBlog, fetchUser } from "../graphql/resolver/blogs/blogsRepo";

const express = require("express");
const router = express.Router();

router.post('/comment', async (req: any, res: any) => {
    const db = req.app.get('db')
    const {userId, name, email, text, blogId} = req.body
    try{
        const blog = await fetchBlog({db, id: blogId})
        if(!blog) {
            return res.status(404).send({
                type: "ERROR",
                message: "Blog not found"
            })    
        }
        if(userId) {
            const user = await fetchUser({db, id: userId})
            if(!user) {
                return res.status(404).send({
                    type: "ERROR",
                    message: "User not found"
                })    
            }
        }
        const commentObject = {
            userId: new ObjectID(userId),
            blogId: new ObjectID(blogId),
            text,
            name,
            email,
            parentCommentId: null,
            like: null
        }
        await db.db('lilleBlogs').collection('comments').insertOne(commentObject)
        return res.status(200).send({
            type: "SUCCESS",
            message: "Comment Added!"
        })
    }catch(e){
        return res.status(500).send({
            type: "ERROR",
            message: e.message
        })
    }
})

router.post('/comment/like', async (req: any, res: any) => {
    const db = req.app.get('db')
    const {commentId} = req.body
    try{
        const comment = await db.db('blogs').collection('comments').findOne({
            _id: new ObjectID(commentId)
        })
        if(!comment) {
            return res.status(404).send({
                type: "ERROR",
                message: "Comment not found"
            })    
        }
        await db.db('blogs').collection('comments').updateOne({
            _id: new ObjectID(commentId)
        }, {
            $inc: {
                like: 1
            }
        })
        return res.status(200).send({
            type: "SUCCESS",
            message: "Like Added!"
        })
    }catch(e){
        return res.status(500).send({
            type: "ERROR",
            message: e.message
        })
    }
})

router.post('/like', async (req: any, res: any) => {
    const db = req.app.get('db')
    const {blogId} = req.body
    try{
        const blog = await fetchBlog({db, id: blogId})
        if(!blog) {
            return res.status(404).send({
                type: "ERROR",
                message: "Blog not found"
            })    
        }
        await db.db('lilleBlogs').collection('blogs').updateOne({
            _id: new ObjectID(blogId)
        }, {
            $inc: {
                likes: 1
            }
        })
        return res.status(200).send({
            type: "SUCCESS",
            message: "Like Added!"
        })
    }catch(e){
        return res.status(500).send({
            type: "ERROR",
            message: e.message
        })
    }
})

module.exports = router