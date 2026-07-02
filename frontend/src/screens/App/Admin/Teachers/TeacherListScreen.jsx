import { Link, useSearchParams } from "react-router-dom";
import { Button, Chip } from "@mui/material";
import { Add, MenuBookOutlined } from "@mui/icons-material";

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
    {
      name: "Name",
      cell: (r) => (
        <Link to={`/app/admin/teachers/${r._id}`} style={{ color: "#1976d3", fontWeight: 600, textDecoration: "none" }}>
          {r.name}
        </Link>
      ),
      sortable: true,
    },
    { name: "Email", selector: (r) => r.email },
    {
      name: "Assigned",
      cell: (r) => <Chip size="small" label={`${r.assignedSubjectsCount ?? 0} subject${r.assignedSubjectsCount === 1 ? "" : "s"}`} color={r.assignedSubjectsCount ? "success" : "default"} />,
      width: "140px",
    },
    { name: "Active", selector: (r) => (r.isActive ? "Yes" : "No"), width: "90px" },
    {
      name: "Subjects",
      cell: (r) => (
        <Button
          component={Link}
          to={`/app/admin/teachers/${r._id}`}
          size="small"
          variant="outlined"
          startIcon={<MenuBookOutlined fontSize="small" />}
        >
          Assign
        </Button>
      ),
      width: "160px",
    },
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
