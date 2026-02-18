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

export const randomEnumValue = <T>(values: readonly T[]): T => values[Math.floor(Math.random() * values.length)]

export const generateTier = (role: string, total: number) => {
    if (role === "customer") {
        if (total <= 5) return "Explorer"
        if (total <= 15) return "Supporter"
        if (total <= 30) return "Enthusiast"
        if (total <= 100) return "VIP"
        return "Elite"
    }

    if (role === "event_organizer") {
        if (total <= 500) return "Starter"
        if (total <= 3000) return "Rising"
        if (total <= 10000) return "Pro"
        if (total <= 50000) return "Elite"
        return "Premier"
    }

    return "Unknown"
}