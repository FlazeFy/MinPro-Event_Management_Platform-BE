import fs from "fs"
import path from "path"

const logDir = path.join(process.cwd(), "logs")
const logFile = path.join(logDir, "error.log")

if (!fs.existsSync(logDir)) fs.mkdirSync(logDir)

export const auditError = (error: any, req?: any) => {
    const log = `
[${new Date().toISOString()}]
Method  : ${req?.method || "-"}
URL     : ${req?.originalUrl || "-"}
Message : ${error?.message || error}
Stack   : ${error?.stack || "-"}
-----------------------------------
    `
    fs.appendFileSync(logFile, log)
}
