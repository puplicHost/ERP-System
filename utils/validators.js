const mongoose = require('mongoose');

/**
 * Validation utilities for ERP System
 */

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean}
 */
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate file type (images only)
 * @param {string} mimetype
 * @returns {boolean}
 */
const isValidImageType = (mimetype) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    return allowedTypes.includes(mimetype);
};

/**
 * Check if file upload exists and is valid
 * @param {Object} file - req.file object from multer
 * @returns {Object} - { valid: boolean, error?: string }
 */
const validateFileUpload = (file, required = true) => {
    if (!file) {
        if (required) {
            return { valid: false, error: 'File is required' };
        }
        return { valid: true };
    }
    
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        return { valid: false, error: 'File size exceeds 5MB limit' };
    }
    
    // Check file type
    if (!isValidImageType(file.mimetype)) {
        return { valid: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed' };
    }
    
    return { valid: true };
};

/**
 * Validate request body fields
 * @param {Object} body - Request body
 * @param {Array<string>} requiredFields - List of required field names
 * @returns {Object} - { valid: boolean, missing?: string[] }
 */
const validateRequiredFields = (body, requiredFields) => {
    if (!body || typeof body !== 'object') {
        return { valid: false, missing: requiredFields };
    }
    
    const missing = requiredFields.filter(field => {
        const value = body[field];
        return value === undefined || value === null || value === '';
    });
    
    if (missing.length > 0) {
        return { valid: false, missing };
    }
    
    return { valid: true };
};

module.exports = {
    isValidObjectId,
    isValidEmail,
    isValidImageType,
    validateFileUpload,
    validateRequiredFields
};
