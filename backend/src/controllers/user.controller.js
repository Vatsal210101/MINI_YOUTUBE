import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import {Apiresponse} from '../utils/Apiresponse.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';


const generateAccessAndRefereshTokens = async (userId) => {
    try {

        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false});

        return {accessToken, refreshToken};
        
    } catch (error) {
        throw new ApiError(500,"Error in generating tokens");
    }
}


const registerUser = asyncHandler( async (req,res)=>{
    // res.status(200).json({

    //     message : "hello after changes code is working....."
    // })

    /*get user details from frontend
      validate the user details
      check if user already exists : using username or email
      check from images or avatars
      upload the image to cloudinary , avatar 
      create user object - create entry in db
      remove password and refersh token 
      check for user creation 
      return res 
    */

    const {fullname,email,username,password} = req.body;
    console.log("email:",email);

    // if (fullname ===""){
    //     throw new ApiError(400,"fullname is required");
    // }

    if (
        [fullname,email,username,password].some(field => field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required");
    }

    const existedUser = await User.findOne({
        $or:[{ email },{ username }]
    })

    if (existedUser) {
        throw new ApiError(409,"User already exists");
    }

    const avatarLocalPath = req.files?.avatar [0]?.path;
    // const coverImageLocalPath = req.files?.coverImage [0]?.path;

    if (!avatarLocalPath){
        throw new ApiError (400,"Avatar is required");
    }

    let coverImageLocalPath; 
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    //upload to cloudinary
    const avatar =  await uploadToCloudinary(avatarLocalPath) 
    const coverImage = await uploadToCloudinary(coverImageLocalPath);


    if (!avatar){
        throw new ApiError (500,"Error in uploading avatar");
    }

    const user = await User.create({
        fullname,
        avatar:avatar.url,
        coverImage: coverImage?.url || " ",
        email,
        username : username.toLowerCase(),
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser){
        throw new ApiError (500,"Error in creating user");
    }

    return res.status(201).json(
        new Apiresponse(201,createdUser,"User registered successfully")
    )

})

const loginUser = asyncHandler(async (req,res) =>{

    // req body get data 
    // username or email and password 
    // find user 
    //pssword check 
    // access token and refresh token 
    // send cookies 

    const {username,email,password} = req.body;

    // require at least one of username or email
    if (!username && !email){
        throw new ApiError (400,"username or email is required");
    }

    const user = await User.findOne({
        $or : [{username},{email}]
    })

    if(!user){
        throw new ApiError (404,"User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if(!isPasswordCorrect){
        throw new ApiError (401,"Invalid password");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options ={
        httpOnly : true,
        secure : true, 
    }

    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options)
    .json(
        new Apiresponse(
            200,{
                user:loggedInUser , accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )
})


const logoutUser = asyncHandler(async (req,res) =>{
    await User.findByIdAndUpdate(
        req.user._id,{
        $unset : {
            refreshToken : 1
        }
    },
    {
        new : true
    }
)

    const options ={
        httpOnly : true,
        secure : true, 
    }

    return res.status(200).clearCookie("accessToken",options).
    clearCookie("refreshToken",options).
    json(new Apiresponse(200,{},"User logged out successfully"))

})


const refreshAccessToken = asyncHandler(async (req,res) =>
    {
        const incomingRefreshToken  = req.cookies.refreshToken || req.body.refreshToken

        if(!incomingRefreshToken){
            throw new ApiError(401,"Unauthorized request");

        }

        try {
            const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
            const user = await User.findById(decodedToken?._id)
    
            if(!user){
                throw new ApiError(401,"Invialid refresh token");
    
            }
    
            if(incomingRefreshToken !== user.refreshToken){
                throw new ApiError(401,"Refresh token is expired or used");
            }
    
            const options ={
                httpOnly : true,
                secure : true, 
            }
    
            const {accessToken, newRefreshToken} = await generateAccessTokenAndRefereshTokens(user._id)
    
            return res.status(200)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",newRefreshToken,options)
            .json(
                new Apiresponse(
                    200,
                    {accessToken, refreshToken : newRefreshToken},
                    "Access token refreshed successfully"
                )
            )
        } catch (error) {
            throw new ApiError(401,error?.message || "Internal server error");
        }

    })


const changeCurrentUserPassword = asyncHandler(async (req,res) =>{
    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect =await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect){
        throw new ApiError(400,"Old password is incorrect");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave : false});


    return res.status(200)
    .json(
        new Apiresponse(200,{},"Password changed successfully")
    )
})    


const getCurrentUser = asyncHandler(async (req,res) =>
    {
        return res.status(200)
        .json(
            new Apiresponse(200,req.user,"Current user fetched successfully")
        )
    })

const updateAccountDetails = asyncHandler(async (req,res) =>{
    const {fullname,email} = req.body;

    if (!fullname || !email){
        throw new ApiError(400,"fullname and email are required");
    }

    User.findByIdAndUpdate(req.user._id,
    {
        $set : {
            fullname,
            email
        }
    },
    { new : true}

    ).select("-password")


    return res.status(200)
    .json(
        new Apiresponse(200,{},"Account details updated successfully")
    )
})



const updateUserAvatar = asyncHandler(async (req,res) =>{
    const avatarLocalPath =req.file?.path 

    if (!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }

    const avatar = await uploadToCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"Error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,{
            avatar : avatar.url
        },
        {new : true}
    ).select("-password");

    return res.status(200)
    .json(
        new Apiresponse(200,user,"Avatar image updated successfully")
    )

})


const updateUserCoverImage = asyncHandler(async (req,res) =>{
    const coverImageLocalPath =req.file?.path 

    if (!coverImageLocalPath){
        throw new ApiError(400,"Cover image file is missing")
    }

    const coverImage = await uploadToCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading cover image")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,{
            coverImage : coverImage.url
        },
        {new : true}
    ).select("-password");


    return res.status(200)
    .json(
        new Apiresponse(200,user,"Cover image updated successfully")
    )

})


const getUserChannelProfile = asyncHandler(async (req,res) =>
    {
        const {username} = req.params;

        if(!username?.trim()){
            throw new ApiError(400,"username is required");
        }
        
        const channel =await User.aggregate([
            {
                $match : { username : username.toLowerCase()}
            },
            {
                $lookup :{
                    from : "subscriptions",
                    localField : "_id",
                    foreignField : "channel",
                    as : "subscribers"
                }
            },
            {
                $lookup:{
                    from : "subscriptions",
                    localField : "_id",
                    foreignField : "subscriber",
                    as : "subscribedChannel"
                }
            },
            {
                $addFields: {
                    subscribersCount : {$size: "$subscribers"},
                    subscribedChannelsCount : {$size : "$subscribedChannel"},
                    isSubscribed : {
                        $cond: {
                            if: {$in : [req.user?._id, "$subscribers.subscriber"]},
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project : {
                    fullname : 1,
                    username : 1,
                    subscribersCount : 1,
                    subscribedChannelsCount : 1,
                    isSubscribed : 1,
                    avatar : 1,
                    coverImage : 1,

                }
            }
        ])
        
        if (!channel?.length){
            throw new ApiError(404,"Channel not found");
        }

        return res.status(200)
        .json(
            new Apiresponse(200,channel[0],"User channel profile fetched successfully")
        )

    }
)


const getWatchHistory = asyncHandler(async (req,res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from : "videos",
                localField : "watchHistory",
                foreignField : "_id",
                as : "watchHistoryVideos",
                pipeline : [
                    {
                        $lookup : {
                            from : "users",
                            localField : "owner",
                            foreignField : "_id",
                            as : "uploadedByDetails",
                            pipeline : [
                                {
                                    $project:{
                                        fullname : 1,
                                        username : 1,
                                        avatar : 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            ownedByDetails : {
                                $first : "$uploadedByDetails"
                            }
                        }
                    }
                ]

            }
        }
    ])

    return res.status(200)
    .json(
        new Apiresponse(200,user[0].watchHistoryVideos,"Watch history fetched successfully")
    )
})




export {
    registerUser,
    loginUser, 
    logoutUser, 
    refreshAccessToken,
    changeCurrentUserPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
};
