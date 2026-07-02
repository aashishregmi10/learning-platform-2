import { useSearchParams } from "react-router-dom";

// URL is the source of truth for page/perPage (mirrors can-logistic).
export const useTablePagination = (defaultPageSize = 10) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page")) || 1;
  const perPage = parseInt(searchParams.get("perPage")) || defaultPageSize;

  const setParams = (next) => {
    const merged = Object.fromEntries(searchParams);
    setSearchParams({ ...merged, ...next });
  };

  return {
    page,
    currentPage: page,
    perPage,
    handlePageChange: (p) => setParams({ page: p }),
    handlePerRowsChange: (size) => setParams({ page: 1, perPage: size }),
  };
};
