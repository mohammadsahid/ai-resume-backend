import express from "express";
import { verifyJwt } from "../middlewares/user.middleware.js";
import { enhanceJobDescription, enhanceProfessionalSummary } from "../controllers/ai.controller.js";
import { updateResume } from "../controllers/resume.controller.js";


const aiRouter = express.Router();

aiRouter.post("/enhance-summary", verifyJwt, enhanceProfessionalSummary)
aiRouter.post("/enhance-job-desc", verifyJwt, enhanceJobDescription)
aiRouter.post("/upload-resume", verifyJwt, updateResume)

export default aiRouter

