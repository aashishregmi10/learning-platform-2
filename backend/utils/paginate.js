/**
 * Shared $facet paginator. Runs the given pipeline stages, then splits into a
 * page of data + a total count. Returns { data, totalItems }.
 */
export const facetPaginate = async (
  Model,
  { match = {}, pipeline = [], sort = { createdAt: -1 }, page = 1, limit = 10, project = null }
) => {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.max(1, parseInt(limit) || 10);

  const dataStages = [{ $sort: sort }, { $skip: (p - 1) * l }, { $limit: l }];
  if (project) dataStages.push({ $project: project });

  const result = await Model.aggregate([
    { $match: match },
    ...pipeline,
    { $facet: { data: dataStages, count: [{ $count: "total" }] } },
  ]);

  return {
    data: result[0]?.data ?? [],
    totalItems: result[0]?.count?.[0]?.total ?? 0,
  };
};

/** Case-insensitive regex match for a search term over one field. */
export const searchMatch = (field, term) =>
  term ? { [field]: { $regex: new RegExp(term, "i") } } : {};
