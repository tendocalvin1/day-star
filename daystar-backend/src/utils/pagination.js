

/**
 * Pagination utility
 * Extracts page and limit from query params
 * Returns offset and metadata
 */

function getPagination(query) {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function paginatedResponse(res, data, total, page, limit) {
  const pages = Math.ceil(total / limit);
  return res.status(200).json({
    success: true,
    count: data.length,
    total,
    pagination: {
      page,
      limit,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    },
    data,
  });
}

module.exports = { getPagination, paginatedResponse };