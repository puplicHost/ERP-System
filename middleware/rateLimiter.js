const rateLimit = require('express-rate-limit');

// Rate limiter للـ Login - منع Brute Force
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 5, // 5 محاولات فقط
    message: {
        status: "error",
        message: "Too many login attempts. Please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// General API Rate Limiter
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 دقيقة
    max: 100, // 100 طلب
    message: {
        status: "error",
        message: "Too many requests from this IP."
    }
});

module.exports = { loginLimiter, apiLimiter };
