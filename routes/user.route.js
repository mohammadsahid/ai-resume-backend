import express from "express"
import { getResumeData, getUserdata, login, logout, registerUser } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/user.middleware.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser)
userRouter.post("/login", login)
userRouter.post("/logout", verifyJwt, logout)
userRouter.get("/data", verifyJwt, getUserdata)
userRouter.get("/resume", verifyJwt, getResumeData)

export default userRouter



