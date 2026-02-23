import { v2 as cloudinary, UploadApiResponse } from "cloudinary"
import * as streamifier from "streamifier"

cloudinary.config({
    api_key: process.env.CLOUDINARY_APIKEY || "",
    api_secret: process.env.CLOUDINARY_APISECRET || "",
    cloud_name: process.env.CLOUDINARY_CLOUDNAME || "",
})

export const cloudinaryUpload = (file : Express.Multer.File) : Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream((err, result: UploadApiResponse) => {
            if(err){
                reject(err)
            } else {
                resolve(result)
            }
        })
        streamifier.createReadStream(file.buffer).pipe(uploadStream)
    })
}