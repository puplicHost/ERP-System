
module.exports = AllowedTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.decoded.role)) {
            return res.status(403).json({
                message: "You are not allowed to perform this action"
            })
        }
        next()
    }
}
