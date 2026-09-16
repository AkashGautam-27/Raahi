const mongodbUrl = process.env.MONGO_URI
if(!mongodbUrl){
    throw new Error("Database url not found !...")
}

