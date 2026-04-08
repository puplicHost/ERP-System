const JWT = require("jsonwebtoken")

const generateTokens = async (payload) => {
    // Access Token - قصير المدى (15 دقيقة)
    const accessToken = JWT.sign(
        payload,
        process.env.JWT_SECRET_KEY,
        { expiresIn: "15m" }
    )

    // Refresh Token - طويل المدى (7 أيام)
    const refreshToken = JWT.sign(
        { id: payload.id }, // فقط الـ ID في الـ refresh token
        process.env.JWT_REFRESH_SECRET_KEY,
        { expiresIn: "7d" }
    )

    return { accessToken, refreshToken }
}

module.exports = generateTokens