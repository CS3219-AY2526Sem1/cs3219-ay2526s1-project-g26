import { Socket } from "socket.io"
import { SocketIdStorage } from "../database/socketIdStorage"
import { UserStorage } from "../database/userStorage"

export async function disconnectMatchHandler(socket: Socket, reason: string) {
    console.log('User disconnected with reason: ' + reason)
    const userId = socket.handshake.auth.userId
    if (!userId) {
        console.log('Missing userId in disconnect for socket', socket.id)
        return
    }
    await SocketIdStorage.removeSocketId(userId)
    await UserStorage.removeUser(userId)
}