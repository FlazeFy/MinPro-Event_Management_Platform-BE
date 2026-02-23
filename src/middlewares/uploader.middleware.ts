import { Request } from "express"
import multer from "multer"
import path from "path"
import fs from "fs"

export const uploader = (filePrefix: string, folderDir: string) => {
    const uploadPath = path.join(__dirname, "../public", folderDir)

    // Create dir if not exist
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true })
    }

    // Config the file upload
    const storage = multer.diskStorage({
        destination: (req: Request, file, cb) => {
            cb(null, uploadPath)
        },
        filename: (req: Request, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase()
            const newName = `${filePrefix}_${Date.now()}${ext}`
            cb(null, newName)
        }
    })

    // File validation
    const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
        const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"]
        const allowedExtensions = [".jpg", ".jpeg", ".png"]
        const ext = path.extname(file.originalname).toLowerCase()

        if (!allowedMimeTypes.includes(file.mimetype)) {
            const error: any = new Error("Only JPG, JPEG, and PNG images are allowed")
            error.status = 400
            return cb(error)
        }

        if (!allowedExtensions.includes(ext)) {
            const error: any = new Error("Invalid file extension")
            error.status = 400
            return cb(error)
        }

        cb(null, true)
    }

    return multer({
        storage,
        fileFilter,
        // File max size
        limits: {
            fileSize: 2 * 1024 * 1024 // 2MB
        }
    })
}

export const memoryUploader = () => {
    return multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 2 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"]
            if (!allowedMimeTypes.includes(file.mimetype)) return cb(new Error("Only JPG, JPEG, and PNG images are allowed"))
            cb(null, true)
        }
    })
}
