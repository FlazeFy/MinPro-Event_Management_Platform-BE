import jwt, { SignOptions } from "jsonwebtoken"

const SECRET: string = process.env.SECRET || "secret"

interface TokenPayload {
    id: string | number
    role: string
}

export const createToken = (data: TokenPayload, expiresIn: SignOptions["expiresIn"] = "24h"): string => {
    const options: SignOptions = { expiresIn }
    
    return jwt.sign(data, SECRET, options)
}