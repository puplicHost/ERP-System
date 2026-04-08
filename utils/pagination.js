/**
 * Reusable Pagination Utility
 * @param {Model} model - Mongoose Model
 * @param {Object} options - Pagination options
 * @returns {Object} - Paginated result
 */
const paginate = async (model, options = {}) => {
    const {
        page = 1,
        limit = 10,
        filter = {},
        sort = { createdAt: -1 },
        populate = null,
        select = null
    } = options;

    // تحويل القيم لأرقام
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10))); // max 100

    // حساب skip
    const skip = (pageNum - 1) * limitNum;

    // بناء الـ query
    let query = model.find(filter);

    if (select) {
        query = query.select(select);
    }

    if (populate) {
        query = query.populate(populate);
    }

    // تنفيذ الـ query مع pagination
    const [data, total] = await Promise.all([
        query.sort(sort).skip(skip).limit(limitNum).exec(),
        model.countDocuments(filter)
    ]);

    const lastPage = Math.ceil(total / limitNum);

    return {
        data,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            lastPage,
            hasNextPage: pageNum < lastPage,
            hasPrevPage: pageNum > 1,
            nextPage: pageNum < lastPage ? pageNum + 1 : null,
            prevPage: pageNum > 1 ? pageNum - 1 : null
        }
    };
};

/**
 * Middleware لاستخراج pagination params من query
 */
const getPaginationParams = (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);

    req.pagination = { page, limit };
    next();
};

module.exports = { paginate, getPaginationParams };
