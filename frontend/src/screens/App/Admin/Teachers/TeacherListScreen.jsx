import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@mui/material";
import { Add } from "@mui/icons-material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import AppTable from "../../../../components/Shared/AppTable";
import { useTablePagination } from "../../../../hooks/useTablePagination";
import { useGetTeachersQuery } from "../../../../store/services/userApi";

const TeacherListScreen = () => {
  const { currentPage, perPage, handlePageChange, handlePerRowsChange } = useTablePagination();
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  const { data, isFetching, error } = useGetTeachersQuery({
    page: currentPage,
    limit: perPage,
    ...(search && { search }),
  });

  const columns = [
    { name: "Name", selector: (r) => r.name, sortable: true },
    { name: "Email", selector: (r) => r.email },
    { name: "Verified", selector: (r) => (r.isVerified ? "Yes" : "No"), width: "120px" },
    { name: "Active", selector: (r) => (r.isActive ? "Yes" : "No"), width: "120px" },
  ];

  return (
    <BreadcrumbLayout
      breadcrumbs={[{ title: "Teachers" }]}
      headerActions={
        <Button component={Link} to="/app/admin/teachers/create" startIcon={<Add />} variant="contained" sx={{ bgcolor: "#1976d3" }}>
          New Teacher
        </Button>
      }
    >
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

export default TeacherListScreen;
