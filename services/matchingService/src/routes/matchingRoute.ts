import { Router } from "express";
import { authenticate } from "../middleware/auth";
import redisClient from "../database/redis";

const router = Router();

router.get('/matchmaking', authenticate, async (req, res) => {
    res.send("welcome to matching service")
});

router.post('/matchmaking/join', async (req, res) => {
    // Extract user id
    const userId = req.body["id"]

    if (!userId) {
        return res.status(400).json( {error: "Missing Fields"} );
    }
    
    const userQueue = "userQueue";
    const queueSize = await redisClient.lLen(userQueue);
    
    // Checks if there is a user in queue to match with
    if (queueSize >= 1) {
        const otherUserId = await redisClient.rPop(userQueue);

        // Fetch a question
        const stubQuestion = {
            id: 1, 
            title: "StubQuestion", 
            description: "-", 
            difficulty: "easy",
        }

        return res.json({
            status: "matched",
            users: [userId, otherUserId, stubQuestion],
        });
    } else {
        // Push user into queue to wait
        redisClient.rPush(userQueue, userId)
        return res.json({status: "waiting"});
    }
});

export default router;