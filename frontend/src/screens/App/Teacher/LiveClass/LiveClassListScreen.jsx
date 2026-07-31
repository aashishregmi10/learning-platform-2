import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button, IconButton } from "@mui/material";
import { Add, CancelOutlined, PlayArrowOutlined, StopOutlined, VisibilityOutlined } from "@mui/icons-material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import AppTable from "../../../../components/Shared/AppTable";
import StatusBadge from "../../../../components/Shared/StatusBadge";
import { useTablePagination } from "../../../../hooks/useTablePagination";
import { useAuth } from "../../../../hooks/useAuth";
import {
  useListLiveClassesQuery,
  useStartLiveClassMutation,
  useEndLiveClassMutation,
  useCancelLiveClassMutation,
} from "../../../../store/services/liveClassApi";

const LiveClassListScreen = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const { currentPage, perPage, handlePageChange, handlePerRowsChange } = useTablePagination();
  const { data, isFetching, error } = useListLiveClassesQuery({ page: currentPage, limit: perPage });
  const [startLiveClass] = useStartLiveClassMutation();
  const [endLiveClass] = useEndLiveClassMutation();
  const [cancelLiveClass] = useCancelLiveClassMutation();

  const act = async (fn, id, label) => {
    try {
      await fn(id).unwrap();
      toast.success(label);
    } catch (err) {
      toast.error(err?.data?.message || "Failed");
    }
  };

  const columns = [
    { name: "Title", selector: (r) => r.title, sortable: true, grow: 2 },
    { name: "When", selector: (r) => new Date(r.scheduledAt).toLocaleString(), width: "200px" },
    { name: "Duration", selector: (r) => `${r.duration} min`, width: "100px" },
    {
      name: "Status",
      cell: (r) => <StatusBadge status={r.status} />,
      width: "120px",
    },
    {
      name: "Actions",
      cell: (r) => (
        <>
          <IconButton size="small" color="primary" title="Detail" onClick={() => navigate(`/app/${role}/live-classes/${r._id}`)}>
            <VisibilityOutlined fontSize="small" />
          </IconButton>
          {r.status === "scheduled" && (
            <IconButton size="small" color="success" title="Start" onClick={() => act(startLiveClass, r._id, "Class started")}>
              <PlayArrowOutlined fontSize="small" />
            </IconButton>
          )}
          {r.status === "live" && (
            <IconButton size="small" color="error" title="End" onClick={() => act(endLiveClass, r._id, "Class ended")}>
              <StopOutlined fontSize="small" />
            </IconButton>
          )}
          {r.status === "scheduled" && (
            <IconButton size="small" color="error" title="Cancel" onClick={() => act(cancelLiveClass, r._id, "Class cancelled")}>
              <CancelOutlined fontSize="small" />
            </IconButton>
          )}
        </>
      ),
      right: true,
      width: "160px",
    },
  ];

  return (
    <BreadcrumbLayout
      breadcrumbs={[{ title: "Live Classes" }]}
      headerActions={
        <Button component={Link} to={`/app/${role}/live-classes/create`} startIcon={<Add />} variant="contained">
          Schedule Class
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

export default LiveClassListScreen;
