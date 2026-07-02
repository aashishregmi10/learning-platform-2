import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import AppTable from "../../../../components/Shared/AppTable";
import { useTablePagination } from "../../../../hooks/useTablePagination";
import { useGetMonitorQuery } from "../../../../store/services/adminApi";

// Shared drill-down table for GET /api/admin/monitor/:resource — used by the
// Users/Subjects/LiveClasses/Content monitor screens (same shape, different columns).
const MonitorTable = ({ resource, title, columns }) => {
  const { currentPage, perPage, handlePageChange, handlePerRowsChange } = useTablePagination();
  const { data, isFetching, error } = useGetMonitorQuery({ resource, page: currentPage, limit: perPage });

  return (
    <BreadcrumbLayout breadcrumbs={[{ title: "Monitor" }, { title }]} isBusy={isFetching}>
      <BreadcrumbLayout.Error error={error} />
      <BreadcrumbLayout.Paper>
        <AppTable
          columns={columns}
          data={data?.data ?? []}
          progressPending={isFetching}
          paginationTotalRows={data?.totalItems ?? 0}
          paginationPerPage={perPage}
          paginationDefaultPage={currentPage}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePerRowsChange}
        />
      </BreadcrumbLayout.Paper>
    </BreadcrumbLayout>
  );
};

export default MonitorTable;
