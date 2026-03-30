import {User} from "../models/User.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import Resume from "../models/resume.model.js";


const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Error while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async(req, res) => {

    const {name, email, password} = req.body

    if(
        [name, email, password].some((field) => field?.trim()==="")
    ){
        throw new ApiError(400, "Name, email and password are required")
    }

    const existingUser = await User.findOne({email})

    if(existingUser){
        throw new ApiError(400, "User with this email already exists")
    }

    const user = await User.create({
        name,
        email,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refrshToken"
    )
    if(!createdUser){
        throw new ApiError(500, "Error while creating user")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User created successfully")
    )
})

const login = asyncHandler(async(req, res) => {
    const {email, password} = req.body
    if(!email || !password){
        throw new ApiError(400, "Email and password are required")
    }
    const user = await User.findOne({email})
    if(!user){
        throw new ApiError(404, "User not found")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid credentials")
    }
    const {accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    const loggedIn = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    }

    return res
    .status(201)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
        new ApiResponse(
            200,
            {
            user: loggedIn, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )

})
const logout = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new:true
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    }
    return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(
        new ApiResponse(200, {}, "User logged out successfully")
    )
})

const getUserdata = asyncHandler(async(req, res) => {
    try {
        const userId = req.user
    
        const user = await User.findById(userId).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(404, "User not found")
        }
    
        return res.status(200).json(
            new ApiResponse(200, user, "User data retrieved successfully")
        )
    } catch (error) {
        throw new ApiError(500, error.message)
    }
})

const getResumeData = asyncHandler(async(req, res) => {
    try {
        const userId = req.user
        const resume = await Resume.find({userId})

        return res.status(201).json(
            new ApiResponse(200, resume, "Resume data retrieved successfully")
        )

    } catch (error) {
        throw new ApiError(400, error.message)
    }
})

const refreshToken = asyncHandler(async(req, res) => {
    try {
        const {refreshToken} = req.cookies

        const user = await User.findOne({refreshToken})

        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }

        const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshToken(user._id)

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        }

        return res
        .status(200)
        .cookie("refreshToken", newRefreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(
                200,
                {
                accessToken, refreshToken: newRefreshToken
                },
                "Tokens refreshed successfully"
            )
        )

    } catch (error) {
        throw new ApiError(401, error.message)
    }
})

export { registerUser, login, logout, getUserdata, getResumeData, refreshToken  }