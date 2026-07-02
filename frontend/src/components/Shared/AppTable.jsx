import DataTable from "react-data-table-component";

// Thin wrapper around react-data-table-component with server pagination,
// matching the props can-logistic uses.
export const AppTable = ({
  columns,
  data = [],
  progressPending = false,
  paginationTotalRows = 0,
  paginationPerPage = 10,
  paginationDefaultPage = 1,
  onChangePage,
  onChangeRowsPerPage,
}) => (
  <DataTable
    columns={columns}
    data={data}
    progressPending={progressPending}
    pagination
    paginationServer
    paginationTotalRows={paginationTotalRows}
    paginationPerPage={paginationPerPage}
    paginationDefaultPage={paginationDefaultPage}
    onChangePage={onChangePage}
    onChangeRowsPerPage={onChangeRowsPerPage}
    highlightOnHover
    responsive
  />
);

export default AppTable;
