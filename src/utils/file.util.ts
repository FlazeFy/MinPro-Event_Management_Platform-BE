import { v2 as cloudinary } from "cloudinary"

export const cloudinaryDeleteByUrl = async (secureUrl: string): Promise<void> => {
    try {
        const urlWithoutQuery = secureUrl.split("?")[0]

        const parts = urlWithoutQuery.split("/upload/")
        if (parts.length < 2) throw new Error("Invalid Cloudinary URL")

        const publicIdWithExt = parts[1].substring(parts[1].indexOf("/") + 1)
        const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "")

        const result = await cloudinary.uploader.destroy(publicId)
        if (result.result !== "ok") throw new Error(`Failed to delete file: ${result.result}`)
    } catch (err) {
        throw err
    }
}
