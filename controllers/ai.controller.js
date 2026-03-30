import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import ai from "../middlewares/ai.middleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const enhanceProfessionalSummary = asyncHandler(async(req, res) => {
    try {
        const { userContent } = req.body
        if(!userContent){
            throw new ApiError(400, "Content is required")
        }
        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                {role: "system", content: "You are an expert in resume writing. Your task is to enhance the professional summary of a resume. The summary should be 1-2 sentences also highlighting key skills, experience and carrer objectives. Make it compelling and ATS-friendly and only return text no options or anyhthig else."},
                {role: "user", content: userContent}
            ]
        })
        const enhancedConetxt = response.choices[0].message.content

        return res.status(200).json(
            new ApiResponse(200, enhancedConetxt, "Professional summary enhanced successfully")
        )
    } catch (error) {
        throw new ApiError(400, error.message)
    }
})

export const enhanceJobDescription = asyncHandler(async(req, res) => {
    try {
        const { userContent } = req.body
        if(!userContent){
            throw new ApiError(400, "Content is required")
        }
        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                {role: "system", content: "You are an expert in resume writing. Your task is to enhance the job description of a resume. The description should be only in 1-2 sentences also highlighting key responsibilities and achievements.Use action verbs and quantifiable result where possible. Make it ATS-friendly and only return text no options or anyhthig else."},
                {role: "user", content: userContent}
            ]
        })
        const enhancedConetxt = response.choices[0].message.content

        return res.status(200).json(
            new ApiResponse(200, enhancedConetxt, "Professional summary enhanced successfully")
        )
    } catch (error) {
        throw new ApiError(400, error.message)
    }
})

export const uploadResume = asyncHandler(async(req, res) => {
    try {
        const { resumeText, title } = req.body
        const userId = req.userId

        if(!resumeText){
            throw new ApiError(400, "Resume text is required")
        }

        const systemPrompt = "You are an expert AI agent to extract data from resume."

        const userPompt = `Extract data from this resume: ${resumeText} 
                            provide the data in the following json format with no additional text before or after 
                            {
                            professional_summary: {
        type: String,
        default: ""
    },
    skills: [{
        type: String
    }],
    personal_info: {
        image: {
            type: String,
            default: ""
        },
        full_name: {
            type: String,
            default: ""
        },
        profession: {
            type: String,
            default: ""
        },
        email: {
            type: String,
            default: ""
        },
        phone: {
            type: String,
            default: ""
        },
        location: {
            type: String,
            default: ""
        },
        linkedin: {
            type: String,
            default: ""
        },
        website: {
            type: String,
            default: ""
        }
    },
    experiences: [{
        comapny:{
            type: String
        },
        position: {
            type: String
        },
        start_date: {
            type: String
        },
        end_date: {
            type: String
        },
        description: {
            type: String
        },
        is_current: {
            type: Boolean
        }
    }],
    projects: [{
        name: {
            type: String
        },
        type: {
            type: String
        },
        description: {
            type: String
        }
    }],
    education: [{
        institution: {
            type: String
        },
        degree: {
            type: String
        },
        field: {
            type: String
        },
        graduation_date: {
            type: String
        },
        gpa: {
            type: String
        }
    }]
        }`
        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                {role: "system", content: systemPrompt},
                {role: "user", content: userPompt}
            ],
            response_format: { type: "json_object"}
        })

        const extractedData = response.choices[0].message.content;
        const parsedData = JSON.parse(extractedData)
        const newResume = await Resume.create({
            user, title, ...parsedData
        })
        return res.status(200).json(
            new ApiResponse(200, { resumeId: newResume._id }, "Data extracted successfully")
        )
    } catch (error) {
        throw new ApiError(400, error.message)
    }
})