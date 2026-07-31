import DataTable from "react-data-table-component";

import { statusTokens, tokens } from "../../theme";

// react-data-table renders its own DOM, so the theme can't reach it through
// MUI — these styles restate the same tokens for it. The header row carries the
// accent tint so every table reads as one banded block.
const customStyles = {
  table: { style: { backgroundColor: tokens.surface } },
  headRow: {
    style: {
      backgroundColor: statusTokens.info.bg,
      borderBottomColor: "#CFE0FF",
      minHeight: 46,
    },
  },
  headCells: {
    style: {
      color: statusTokens.info.fg,
      fontSize: "0.75rem",
      fontWeight: 700,
      letterSpacing: "0.03em",
      textTransform: "uppercase",
    },
  },
  rows: {
    style: {
      minHeight: 52,
      color: tokens.body,
      fontSize: "0.875rem",
      "&:not(:last-of-type)": { borderBottomColor: tokens.border },
    },
    highlightOnHoverStyle: {
      backgroundColor: statusTokens.info.bg,
      color: statusTokens.info.fg,
      borderBottomColor: tokens.border,
      outline: "none",
    },
  },
  pagination: {
    style: {
      borderTopColor: tokens.border,
      color: tokens.muted,
      fontSize: "0.8rem",
      backgroundColor: tokens.surfaceMuted,
    },
  },
  progress: { style: { color: statusTokens.info.solid, padding: 32 } },
  noData: { style: { color: tokens.muted, padding: 32, backgroundColor: tokens.surface } },
};

// Thin wrapper around react-data-table-component with server pagination.
export const AppTable = ({
  columns,
  data = [],
  progressPending = false,
  paginationTotalRows = 0,
  paginationPerPage = 10,
  paginationDefaultPage = 1,
  onChangePage,
  onChangeRowsPerPage,
  noDataComponent,
}) => (
  <DataTable
    columns={columns}
    data={data}
    customStyles={customStyles}
    progressPending={progressPending}
    pagination
    paginationServer
    paginationTotalRows={paginationTotalRows}
    paginationPerPage={paginationPerPage}
    paginationDefaultPage={paginationDefaultPage}
    onChangePage={onChangePage}
    onChangeRowsPerPage={onChangeRowsPerPage}
    noDataComponent={noDataComponent ?? "Nothing here yet."}
    highlightOnHover
    responsive
  />
);

export default AppTable;
