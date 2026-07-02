import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Chip, IconButton } from "@mui/material";
import { Add, EditOutlined, MenuBookOutlined } from "@mui/icons-material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import AppTable from "../../../../components/Shared/AppTable";
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
    { name: "Bundle", selector: (r) => money(r.bundlePrice?.discountedPrice), width: "140px" },
    {
      name: "Status",
      cell: (r) => <Chip size="small" label={r.isActive ? "Active" : "Draft"} color={r.isActive ? "success" : "default"} />,
      width: "110px",
    },
    {
      name: "Actions",
      cell: (r) => (
        <>
          <IconButton size="small" title="Subjects" onClick={() => navigate(`/app/admin/catalog/subjects?year=${r._id}`)}>
            <MenuBookOutlined fontSize="small" />
          </IconButton>
          <IconButton size="small" title="Edit" onClick={() => navigate(`/app/admin/catalog/years/${r._id}/edit`)}>
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
        <Button component={Link} to={createHref} startIcon={<Add />} variant="contained" sx={{ bgcolor: "#1976d3" }}>
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
