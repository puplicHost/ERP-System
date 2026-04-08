/**
 * Environment Variables Validator
 * يتحقق من وجود جميع المتغيرات المطلوبة قبل تشغيل التطبيق
 */

const requiredEnvVars = [
    'PORT',
    'DB_URI',
    'JWT_SECRET_KEY',
    'JWT_REFRESH_SECRET_KEY'
];

const validateEnv = () => {
    const missing = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:');
        missing.forEach(varName => console.error(`   - ${varName}`));
        console.error('\n📝 Please check your .env file and add the missing variables.');
        process.exit(1);
    }
    
    // Validate JWT secrets length (minimum 32 characters for security)
    if (process.env.JWT_SECRET_KEY.length < 32) {
        console.error('❌ JWT_SECRET_KEY must be at least 32 characters long');
        process.exit(1);
    }
    
    if (process.env.JWT_REFRESH_SECRET_KEY.length < 32) {
        console.error('❌ JWT_REFRESH_SECRET_KEY must be at least 32 characters long');
        process.exit(1);
    }
    
    console.log('✅ Environment variables validated successfully');
};

module.exports = validateEnv;
