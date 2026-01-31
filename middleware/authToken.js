const JWT = require("jsonwebtoken")
const Auth = (req, res, next) => {
    const authHeaders = req.headers['Authorization'] || req.headers['authorization']

if(!authHeaders){
       return res.status(401).json({
        message : "Authentication failed"
    })
}

    const token = authHeaders.split(' ')[1]

try{
     const decoded = JWT.verify(token ,process.env.JWT_SECRET_KEY)
         next()
}catch(err){
    return res.status(401).json({
        message : "Session expired, please login again"
    })
}


}

module.exports = Auth