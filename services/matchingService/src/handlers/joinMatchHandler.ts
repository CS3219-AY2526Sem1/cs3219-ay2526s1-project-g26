import { Server, Socket } from "socket.io";
import { UserManager } from "../database/userManager";

export async function joinMatchHandler(io: Server, socket: Socket, data: any): Promise<void> {
    console.log("joinMatch event received");
    const userId = data.id
    try {
        await UserManager.storeUser(userId, {
            socketId: socket.id
        });
        io.to(socket.id).emit("waitingForMatch");
    } catch (error) {
        if (await UserManager.userExist(userId)) {
            UserManager.deleteUser(userId);
        }
        console.error("Join match error: ", error);
        io.to(socket.id).emit("error", {message: "Failed to join match"});
    }
}