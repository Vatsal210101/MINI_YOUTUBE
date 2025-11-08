
import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {Apiresponse} from "../utils/Apiresponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user._id

    // Get total videos count
    const totalVideos = await Video.countDocuments({ owner: userId })

    // Get total views across all videos
    const viewsResult = await Video.aggregate([
        {
            $match: { owner: new mongoose.Types.ObjectId(userId) }
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" }
            }
        }
    ])

    const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0

    // Get total subscribers
    const totalSubscribers = await Subscription.countDocuments({ channel: userId })

    // Get total likes across all videos
    const videos = await Video.find({ owner: userId }).select("_id")
    const videoIds = videos.map(video => video._id)

    const totalLikes = await Like.countDocuments({
        video: { $in: videoIds }
    })

    const stats = {
        totalVideos,
        totalViews,
        totalSubscribers,
        totalLikes
    }

    return res.status(200).json(
        new Apiresponse(200, stats, "Channel stats fetched successfully")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const videos = await Video.aggregate([
        {
            $match: { owner: new mongoose.Types.ObjectId(userId) }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" }
            }
        },
        {
            $project: {
                likes: 0
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ])

    return res.status(200).json(
        new Apiresponse(200, videos, "Channel videos fetched successfully")
    )
})

export {
    getChannelStats,
    getChannelVideos
}
