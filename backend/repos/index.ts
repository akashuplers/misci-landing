import { ObjectID } from "bson";

export const fetchArticles = async ({db, id}: {
    db: any;
    id: string
}) => {
    return await db.db('lilleArticles').collection('articles').findOne({_id: id})
}