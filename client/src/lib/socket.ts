import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export const getSocket = () => {
    if (!socket) {
        const url = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:8000"
        socket = io(url, {
            transports: ["websocket", "polling"],
        })

        socket.on("connect", () => {
            console.log("Connected to socket server with id:", socket?.id)
        })

        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error.message)
        })

        socket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason)
        })
    }

    return socket
}