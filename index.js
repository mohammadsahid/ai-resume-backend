import "dotenv/config";
import express from "express";
import cors from "cors";
import ConnectDB from "./db/ConnectDB.js";
import userRouter from "./routes/user.route.js";
import cookieParser from "cookie-parser";
import resumeRouter from "./routes/resume.routes.js";
import aiRouter from "./routes/ai.routes.js";

console.log("KEY:", process.env.IMAGEKIT_PRIVATE_KEY);
const app = express();

const PORT = process.env.PORT || 4000
app.use(cors());
app.use(express.json());
app.use(cookieParser());
ConnectDB();

app.get("/", (req, res) => {
    res.send("server is live");
})
app.use("/api/user", userRouter)
app.use("/api/resume", resumeRouter)
app.use("/api/ai", aiRouter)
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})