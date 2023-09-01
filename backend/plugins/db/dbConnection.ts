import fastifyPlugin from "fastify-plugin"
import {MongoClient} from 'mongodb'

const db = async ({type}: {
    type?: string | null
}) => {
    try {
        console.log("tada")
        const database = await MongoClient.connect(type ? `${process.env.MONGO_STRING_LIVE}` : `${process.env.MONGO_STRING}`, {
            // @ts-ignore
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        if(!database) throw new Error("Mongo not connected!")
        return database
    }catch(err: any){
        console.log(`error while connecting db ${err}`)
        throw "error while connecting db"
    }
}

export default db