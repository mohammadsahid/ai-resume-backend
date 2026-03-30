import Resume from "../models/resume.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import imageKit from "../utils/imageKit.js";
import fs from "fs"

const createResume = asyncHandler(async(req, res) => {
    try {
        const userId = req.user
        const {title} = req.body

        const newResume = await Resume.create({
            userId,
            title
        })
        return res.status(201).json(
            new ApiResponse(201, newResume, "Resume created successfully")
        )
        
    } catch (error) {
        throw new ApiError(400, error.message)
    }
})

const deleteResume = asyncHandler(async(req, res) => {
    try {
        const userId = req.user
        const {resumeId} = req.params
        await Resume.findOneAndDelete({userId, _id: resumeId})
        return res.status(200).json(
            new ApiResponse(200, null, "Resume deleted successfully")
        )
    } catch (error) {
        throw new ApiError(400, error.message)
    }

})

const getResumeById = asyncHandler(async(req, res) => {
    try {
        const userId = req.userId
        const {resumeId} = req.params
        const resume = await Resume.findOne({userId, _id: resumeId})
        if(!resume){
            throw new ApiError(404, "Resume not Found")
        }
        resume.__v = undefined
        resume.createdAt = undefined
        resume.updatedAt = undefined
        return res.status(200).json(
            new ApiResponse(201, resume, "Resume retrieved successfully")
        )
    } catch (error) {
        throw new ApiError(400, error.message)
    }
})

const getPublicResumeById = asyncHandler(async(req, res) => {
    try {
        const {resumeId} = req.params
        const resume = await Resume.findOne({isPublic: true, _id: resumeId})
        if(!resume){
            throw new ApiError(404, "Resume not Found")
        }
        return res.status(200).json(
            new ApiResponse(201, resume, "Resume retrieved successfully")
        )
    } catch (error) {
        throw new ApiError(400, error.message)
    }
})

const updateResume = asyncHandler(async(req, res) => {
    try {
        const userId = req.user
        const {resumeId,resumeData, removeBackground} = req.body
        const image = req.file;

        if(image){

            const imageBufferData = fs.createReadStream(image.path)
            const response = await imageKit.files.upload({
                file: imageBufferData,
                filename: "resume.png",
                folder:"user-resumes",
                transformation: {
                    pre: "w-300, h-300, fo-face, z-0.75" + (removeBackground ? ", e-bgremove" : "")
                }
            })
            resumeDataCopy.personal_info.image = response.url
        }
        
        let resumeDataCopy = JSON.parse(resumeData)
        await Resume.findOneAndUpdate({userId, _id: resumeId}, resumeDataCopy, {new: true})
        return res.status(200).json(
            new ApiResponse(201, resumeData, "Resume updated successfully")
        )
    } catch (error) {
        throw new ApiError(400, error.message)
    }
})


export { createResume, deleteResume, getResumeById, getPublicResumeById, updateResume }