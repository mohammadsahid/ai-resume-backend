import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ConnectDB from "./db/ConnectDB.js";
import userRouter from "./routes/user.route.js";
import cookieParser from "cookie-parser";

dotenv.config();

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
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})