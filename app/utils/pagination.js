function parsePage(query) {
  const page = Math.max(1, parseInt(query.page ?? '1', 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(query.pageSize ?? '10', 10) || 10));
  return { page, pageSize };
}
module.exports = { parsePage };
