import { ObjectID } from "bson";

export const fetchBlog = async ({id, db}: {
    id: string;
    db: any
}) => {
   return await db.db('lilleBlogs').collection('blogs').findOne({_id: new ObjectID(id)})
}