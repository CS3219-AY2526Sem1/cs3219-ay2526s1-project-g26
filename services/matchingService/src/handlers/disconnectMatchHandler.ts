import { Socket } from "socket.io"
import { SocketIdStorage } from "../database/socketIdStorage"
import { UserStorage } from "../database/userStorage"
import { getUserId } from "./matchingSocketHandler"

export async function disconnectMatchHandler(socket: Socket, reason: string) {
    console.log('User disconnected with reason: ' + reason)
    const userId = getUserId(socket)
    if (!userId) {
        console.log('Missing userId in the socket')
        return
    }
    await SocketIdStorage.removeSocketId(userId)
    await UserStorage.removeUser(userId)
}