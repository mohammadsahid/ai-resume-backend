import express from "express";
import { verifyJwt } from "../middlewares/user.middleware.js";
import { createResume, deleteResume, getPublicResumeById, getResumeById, updateResume } from "../controllers/resume.controller.js";
import upload from "../middlewares/multer.middleware.js";

const resumeRouter = express.Router();


resumeRouter.post("/create", verifyJwt, createResume)
resumeRouter.put("/update", upload.single("image"), verifyJwt, updateResume)
resumeRouter.delete("/delete/:resumeId", verifyJwt, deleteResume)
resumeRouter.get("/get/:resumeId", verifyJwt, getResumeById)
resumeRouter.get("/public/:resumeId", getPublicResumeById)


export default resumeRouter