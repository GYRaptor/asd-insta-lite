function parsePagination(query) {
  let page = 1;
  let limit = 10;

  if (query.page !== undefined) {
    if (!/^[1-9]\d*$/.test(String(query.page))) {
      return { error: "page and limit must be positive integers" };
    }
    page = parseInt(query.page, 10);
  }

  if (query.limit !== undefined) {
    if (!/^[1-9]\d*$/.test(String(query.limit))) {
      return { error: "page and limit must be positive integers" };
    }
    limit = parseInt(query.limit, 10);
    if (limit > 50) {
      limit = 50;
    }
  }

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

function formatPaginationMeta(page, limit, total) {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
  };
}

module.exports = {
  parsePagination,
  formatPaginationMeta,
};
