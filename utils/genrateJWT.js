const JWT = require("jsonwebtoken")


module.exports = async (payload) => {
    const Token =  JWT.sign(payload,process.env.JWT_SECRET_KEY, { expiresIn: "10s" })
    return Token
} 