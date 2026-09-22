import mongoose from "mongoose"

const mongodbUrl = process.env.MONGO_URI
if (!mongodbUrl) {
    throw new Error("Database url not found !...")
}

let cached =global.mongooseConn;

if (!cached) {
    cached = global.mongooseConn = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

     if(!cached.promise){
        cached.promise = mongoose.connect(mongodbUrl).then(c=>c.connection)
    }
    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        console.error("db connection error:", error);
        throw error;
    }

    return cached.conn;
};

export default connectDB;