import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Box, Button, Chip, IconButton } from "@mui/material";
import { Add, EditOutlined, MenuBookOutlined } from "@mui/icons-material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import AppTable from "../../../../components/Shared/AppTable";
import StatusChip from "../../../../components/Shared/StatusChip";
import { useGetYearsQuery } from "../../../../store/services/yearApi";

const money = (n) => `NPR ${Number(n || 0).toLocaleString()}`;

const YearListScreen = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const program = params.get("program") || "";

  const { data, isFetching, error } = useGetYearsQuery({ ...(program && { program }) });

  const columns = [
    { name: "Year", selector: (r) => r.yearName, sortable: true },
    { name: "Program", selector: (r) => r.program?.name || "—", grow: 2 },
    {
      name: "Semesters",
      cell: (r) =>
        r.semesters?.length ? (
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", py: 0.5 }}>
            {r.semesters.map((s) => (
              <Chip key={s.semesterNumber} size="small" variant="outlined" label={s.name} />
            ))}
          </Box>
        ) : (
          "—"
        ),
      grow: 1,
    },
    { name: "Bundle", selector: (r) => money(r.bundlePrice?.discountedPrice), width: "140px" },
    {
      name: "Status",
      cell: (r) => <StatusChip active={r.isActive} />,
      width: "110px",
    },
    {
      name: "Actions",
      cell: (r) => (
        <>
          <IconButton size="small" color="primary" title="Subjects" onClick={() => navigate(`/app/admin/catalog/subjects?year=${r._id}`)}>
            <MenuBookOutlined fontSize="small" />
          </IconButton>
          <IconButton size="small" color="primary" title="Edit" onClick={() => navigate(`/app/admin/catalog/years/${r._id}/edit`)}>
            <EditOutlined fontSize="small" />
          </IconButton>
        </>
      ),
      right: true,
    },
  ];

  const createHref = `/app/admin/catalog/years/create${program ? `?program=${program}` : ""}`;

  return (
    <BreadcrumbLayout
      breadcrumbs={[{ title: "Catalog" }, { title: "Programs", path: "/app/admin/catalog/programs" }, { title: "Years" }]}
      headerActions={
        <Button component={Link} to={createHref} startIcon={<Add />} variant="contained">
          New Year
        </Button>
      }
    >
      <BreadcrumbLayout.Error error={error} />
      <BreadcrumbLayout.Paper>
        <AppTable columns={columns} data={data?.data ?? []} progressPending={isFetching} paginationTotalRows={data?.totalItems ?? 0} />
      </BreadcrumbLayout.Paper>
    </BreadcrumbLayout>
  );
};

export default YearListScreen;
