
import dotenv from "dotenv"
dotenv.config()
import express from "express"
import mongoose from "mongoose"
import http from "http"
import { Server } from "socket.io"
const port = process.env.PORT || 8000
const mongodb_url = process.env.MONGODB_URI






const connectDb = async () => {
    try {
        await mongoose.connect(mongodb_url)
        console.log("db connected")
    } catch (error) {
        console.log("db error")
    }
}

const app = express()

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: process.env.NEXT_BASE_URL
    }
})

io.on("connection", (socket) => {
    console.log(socket.id)

    socket.on("identity", (data) => {
        console.log(data)
    })
})

server.listen(port, () => {
    console.log(`Server is running on port : ${port}`)
    connectDb()
})