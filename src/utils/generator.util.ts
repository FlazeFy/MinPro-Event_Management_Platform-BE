export const generateRefferalCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    const len: number = 6 // reff code char length
    let res: string = ""
  
    for (let i = 0; i < len; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length)
        res += chars[randomIndex]
    }
  
    return res
}  