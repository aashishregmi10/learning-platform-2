import { Link, useNavigate } from "react-router-dom";
import { Chip, IconButton } from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";

import BreadcrumbLayout from "../../../components/Shared/BreadcrumbLayout";
import AppTable from "../../../components/Shared/AppTable";
import { useTablePagination } from "../../../hooks/useTablePagination";
import { useGetSubjectsQuery } from "../../../store/services/subjectApi";

const money = (n) => `NPR ${Number(n || 0).toLocaleString()}`;

// Teacher's own subjects. The /subjects/list endpoint is already scoped to the
// teacher's assignedSubjects server-side, so no client filtering is needed.
const TeacherSubjectsScreen = () => {
  const navigate = useNavigate();
  const { currentPage, perPage, handlePageChange, handlePerRowsChange } = useTablePagination();

  const { data, isFetching, error } = useGetSubjectsQuery({ page: currentPage, limit: perPage });

  const columns = [
    {
      name: "Subject",
      grow: 2,
      cell: (r) => (
        <Link to={`/app/teacher/subjects/${r._id}`} style={{ color: "#1976d3", fontWeight: 600, textDecoration: "none" }}>
          {r.name}
        </Link>
      ),
    },
    { name: "Code", selector: (r) => r.subjectCode || "—", width: "120px" },
    { name: "Chapters", selector: (r) => r.totalChapters ?? 0, width: "110px" },
    {
      name: "Status",
      cell: (r) => <Chip size="small" label={r.isActive ? "Active" : "Draft"} color={r.isActive ? "success" : "default"} />,
      width: "110px",
    },
    { name: "Price", selector: (r) => money(r.pricing?.discountedPrice), width: "130px" },
    {
      name: "",
      cell: (r) => (
        <IconButton size="small" title="Open" onClick={() => navigate(`/app/teacher/subjects/${r._id}`)}>
          <InfoOutlined fontSize="small" />
        </IconButton>
      ),
      width: "60px",
      right: true,
    },
  ];

  return (
    <BreadcrumbLayout breadcrumbs={[{ title: "My Subjects" }]}>
      <BreadcrumbLayout.Error error={error} />
      {!isFetching && (data?.data ?? []).length === 0 ? (
        <BreadcrumbLayout.Paper>
          <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
            No subjects assigned to you yet. Ask an admin to assign you subjects to start authoring content.
          </div>
        </BreadcrumbLayout.Paper>
      ) : (
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
      )}
    </BreadcrumbLayout>
  );
};

export default TeacherSubjectsScreen;
