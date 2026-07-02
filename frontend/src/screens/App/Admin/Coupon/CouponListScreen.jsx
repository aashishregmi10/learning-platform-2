import { Link, useNavigate } from "react-router-dom";
import { Button, Chip } from "@mui/material";
import { Add } from "@mui/icons-material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import AppTable from "../../../../components/Shared/AppTable";
import { useTablePagination } from "../../../../hooks/useTablePagination";
import { useGetCouponsQuery } from "../../../../store/services/couponApi";

const CouponListScreen = () => {
  const navigate = useNavigate();
  const { currentPage, perPage, handlePageChange, handlePerRowsChange } = useTablePagination();
  const { data, isFetching, error } = useGetCouponsQuery({ page: currentPage, limit: perPage });

  const columns = [
    { name: "Code", selector: (r) => r.code, sortable: true },
    { name: "Discount", selector: (r) => (r.discountType === "percentage" ? `${r.discountValue}%` : `NPR ${r.discountValue}`) },
    { name: "Applies", selector: (r) => r.appliesTo, width: "110px" },
    { name: "Used", selector: (r) => `${r.redemptionCount}${r.maxRedemptions ? `/${r.maxRedemptions}` : ""}`, width: "100px" },
    { name: "Status", cell: (r) => <Chip size="small" label={r.isActive ? "Active" : "Off"} color={r.isActive ? "success" : "default"} />, width: "110px" },
  ];

  return (
    <BreadcrumbLayout
      breadcrumbs={[{ title: "Coupons" }]}
      headerActions={
        <Button component={Link} to="/app/admin/coupons/create" startIcon={<Add />} variant="contained">New Coupon</Button>
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

export default CouponListScreen;
