import express from "express"
import "dotenv/config";
import  cors from  "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from "./controller/clerkWebhooks.js";
import userRouter from "./routes/userRouter.js";
import hotelRouter from "./routes/hotelRoutes.js";
import connectCloudinary from "./configs/cloudinary.js"
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";

await connectDB()
connectCloudinary();
const app = express()
// serverside/server.js
app.use(cors()) 

//API to listen to clerk webhooks
app.post("/api/clerk", express.raw({ type: 'application/json' }), clerkWebhooks);

//middlerware
app.use(express.json())
app.use(clerkMiddleware())

app.get("/", (req, res)=>res.send("API is working fine"))

app.use('/api/user', userRouter)
app.use('/api/hotels', hotelRouter)
app.use('/api/rooms', roomRouter)
app.use('/api/booking', bookingRouter)

const PORT = process.env.PORT ||  3000; //set port

app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
