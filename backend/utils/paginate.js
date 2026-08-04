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

/**
 * Case-insensitive "contains" match for a search box.
 *
 * The term is escaped rather than compiled as-is: a raw user string went
 * straight into `new RegExp`, so a search for `(a+)+$` was a denial-of-service
 * and one for `.*` scanned every document. Length is capped for the same
 * reason. Non-string input (arrays from `?search[]=`) is ignored outright.
 */
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const searchMatch = (field, term) => {
  if (typeof term !== "string") return {};
  const trimmed = term.trim().slice(0, 100);
  if (!trimmed) return {};
  return { [field]: { $regex: new RegExp(escapeRegex(trimmed), "i") } };
};
