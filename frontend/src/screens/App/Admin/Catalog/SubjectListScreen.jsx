import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Chip, IconButton } from "@mui/material";
import { Add, InfoOutlined, EditOutlined } from "@mui/icons-material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import AppTable from "../../../../components/Shared/AppTable";
import { useTablePagination } from "../../../../hooks/useTablePagination";
import { useGetSubjectsQuery } from "../../../../store/services/subjectApi";

const money = (n) => `NPR ${Number(n || 0).toLocaleString()}`;

const SubjectListScreen = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const year = params.get("year") || "";
  const { currentPage, perPage, handlePageChange, handlePerRowsChange } = useTablePagination();

  const { data, isFetching, error } = useGetSubjectsQuery({
    page: currentPage,
    limit: perPage,
    ...(year && { year }),
  });

  const columns = [
    { name: "Name", selector: (r) => r.name, grow: 2, cell: (r) => (
      <Link to={`/app/admin/catalog/subjects/${r._id}`} style={{ color: "#1976d3" }}>{r.name}</Link>
    ) },
    { name: "Code", selector: (r) => r.subjectCode || "—", width: "110px" },
    { name: "Price", selector: (r) => money(r.pricing?.discountedPrice), width: "130px" },
    { name: "Chapters", selector: (r) => r.totalChapters, width: "100px" },
    {
      name: "Status",
      cell: (r) => <Chip size="small" label={r.isActive ? "Active" : "Draft"} color={r.isActive ? "success" : "default"} />,
      width: "110px",
    },
    {
      name: "Actions",
      cell: (r) => (
        <>
          <IconButton size="small" title="Open" onClick={() => navigate(`/app/admin/catalog/subjects/${r._id}`)}>
            <InfoOutlined fontSize="small" />
          </IconButton>
          <IconButton size="small" title="Edit" onClick={() => navigate(`/app/admin/catalog/subjects/${r._id}/edit`)}>
            <EditOutlined fontSize="small" />
          </IconButton>
        </>
      ),
      right: true,
    },
  ];

  const createHref = `/app/admin/catalog/subjects/create${year ? `?year=${year}` : ""}`;

  return (
    <BreadcrumbLayout
      breadcrumbs={[{ title: "Catalog" }, { title: "Subjects" }]}
      headerActions={
        <Button component={Link} to={createHref} startIcon={<Add />} variant="contained" sx={{ bgcolor: "#1976d3" }}>
          New Subject
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

export default SubjectListScreen;
