import { Link, useNavigate } from "react-router-dom";
import { Button, Chip, IconButton } from "@mui/material";
import { Add, EditOutlined, MenuBookOutlined } from "@mui/icons-material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import AppTable from "../../../../components/Shared/AppTable";
import StatusChip from "../../../../components/Shared/StatusChip";
import { useTablePagination } from "../../../../hooks/useTablePagination";
import { useGetProgramsQuery } from "../../../../store/services/programApi";

const ProgramListScreen = () => {
  const navigate = useNavigate();
  const { currentPage, perPage, handlePageChange, handlePerRowsChange } = useTablePagination();
  const { data, isFetching, error } = useGetProgramsQuery({ page: currentPage, limit: perPage });

  const columns = [
    { name: "Name", selector: (r) => r.name, sortable: true, grow: 2 },
    { name: "Code", selector: (r) => r.code || "—", width: "110px" },
    {
      name: "Structure",
      cell: (r) => (
        <Chip
          size="small"
          variant="outlined"
          label={
            r.structure === "semester"
              ? `Semester · ${r.semestersPerYear || 2}/yr`
              : "Yearly"
          }
        />
      ),
      width: "160px",
    },
    {
      name: "Status",
      cell: (r) => <StatusChip active={r.isActive} />,
      width: "120px",
    },
    {
      name: "Actions",
      cell: (r) => (
        <>
          <IconButton size="small" color="primary" title="Years" onClick={() => navigate(`/app/admin/catalog/years?program=${r._id}`)}>
            <MenuBookOutlined fontSize="small" />
          </IconButton>
          <IconButton size="small" color="primary" title="Edit" onClick={() => navigate(`/app/admin/catalog/programs/${r._id}/edit`)}>
            <EditOutlined fontSize="small" />
          </IconButton>
        </>
      ),
      right: true,
    },
  ];

  return (
    <BreadcrumbLayout
      breadcrumbs={[{ title: "Catalog" }, { title: "Programs" }]}
      headerActions={
        <Button component={Link} to="/app/admin/catalog/programs/create" startIcon={<Add />} variant="contained">
          New Program
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

export default ProgramListScreen;
