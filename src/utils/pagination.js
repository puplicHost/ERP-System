const paginate = async (model, query = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const [data, total] = await Promise.all([
    model.find(query).skip(skip).limit(limit),
    model.countDocuments(query)
  ]);
  
  return {
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      last_page: Math.ceil(total / limit)
    }
  };
};

module.exports = paginate;
