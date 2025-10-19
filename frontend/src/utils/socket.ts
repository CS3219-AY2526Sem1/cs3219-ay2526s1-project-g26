import { io } from 'socket.io-client'

export const socket = io('http://localhost:4020', {
    auth: {
        token: localStorage.getItem('authToken')
    }
})
