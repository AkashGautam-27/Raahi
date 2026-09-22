import mongoose from "mongoose"

const mongodbUrl = process.env.MONGO_URI
if(!mongodbUrl){
    throw new Error("Database url not found !...")
}

let cached = global.mongooseConn
if(!cached){
    cached = global.mongooseConn={conn:null,promise:null}
}

const connectDB = async ()=>{
    if(cached.conn){
        return cached.conn
    }
     if(!cached.promise){
        cached.promise = mongoose.connect(mongodbUrl).then(c=>c.connection)
    }
    try {
        const conn = await cached.promise
        return conn;
        console.log("db connect")
    } catch (error) {
          cached.promise = null;
        console.log("db connected error",error)
    }
}

export default connectDB;