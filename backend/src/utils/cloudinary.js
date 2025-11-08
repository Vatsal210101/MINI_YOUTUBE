import {v2 as cloudinary} from "cloudinary";
import fs from "fs"; // fs is filesystem bulid in node js 


cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type : "auto" // auto mean image , video , pdf etc
        })
        // file has been uploaded successfully
        // console.log('file is upload on cloudinary',response.url);
        fs.unlinkSync(localFilePath); // remove file from local storage after upload
        return response;
    }

    catch(error){
    try { fs.unlinkSync(localFilePath); } catch(_){}
        return null;

    }
}

export {uploadToCloudinary};