import dotenv from "dotenv"
dotenv.config()
import express from "express"
import mongoose from "mongoose"
import http from "http"
import { Server } from "socket.io"
import User from "./models/user.model.js"
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
app.use(express.json())
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: process.env.NEXT_BASE_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
})

app.post("/emit", async (req, res) => {
    const { event, userId, data } = req.body
    try {
        const user = await User.findById(userId)
        if (user.socketId) {
            io.to(user.socketId).emit(event, data)
        }

        return res.json({ success: true })
    } catch (error) {
        return res.json({ success: false })
    }
})

io.on("connection", (socket) => {
    console.log("socket connected", socket.id)
    socket.on("identity", async (data) => {
        try {
            const userId = typeof data === "object" && data !== null ? data.userId : data
            if (!userId) return;
            socket.userId = userId
            await User.findByIdAndUpdate(userId, {
                socketId: socket.id,
                isOnline: true
            })
            console.log(`User ${userId} identified with socket ${socket.id}`)
        } catch (error) {
            console.error("Error in identity handler:", error)
        }
    })
    socket.on("update-location", async (data) => {
        try {
            const { userId, latitude, longitude } = data || {}
            if (!userId || latitude == null || longitude == null) return;
            await User.findByIdAndUpdate(userId, {
                location: {
                    type: "Point",
                    coordinates: [longitude, latitude]
                }
            })
        } catch (error) {
            console.error("Error in update-location handler:", error)
        }
    })
    socket.on("join-ride", (bookingId) => {
        if (!bookingId) return
        socket.join(bookingId)
        console.log(`Socket ${socket.id} joined ride room: ${bookingId}`)
    })
    socket.on("driver-location-update", ({ bookingId, latitude, longitude, status }) => {
        if (!bookingId || latitude == null || longitude == null) return
        io.to(bookingId).emit("driver-location", { latitude, longitude, status })
        console.log(`Driver location update for ride ${bookingId}: ${latitude}, ${longitude}`)
    })
    socket.on("chat-message", (data) => {
        io.to(data.bookingId).emit("chat-message", data);
    });
    socket.on("disconnect", async () => {
        console.log("Socket disconnected:", socket.id)
        if (!socket.userId) return;
        try {
            await User.findByIdAndUpdate(socket.userId, {
                socketId: null,
                isOnline: false
            })
        } catch (error) {
            console.error("Error in disconnect handler:", error)
        }
    })
})

server.listen(port, () => {
    console.log(`Server is running on port : ${port}`)
    connectDb()
})