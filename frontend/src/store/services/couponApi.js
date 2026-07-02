import { baseApi } from "./baseApi";

export const couponApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCoupons: builder.query({
      query: (params) => ({ url: "/coupons/list", params }),
      providesTags: ["Coupon"],
    }),
    createCoupon: builder.mutation({
      query: (body) => ({ url: "/coupons", method: "POST", body }),
      invalidatesTags: ["Coupon"],
    }),
    updateCoupon: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/coupons/${id}`, method: "PUT", body }),
      invalidatesTags: ["Coupon"],
    }),
    deleteCoupon: builder.mutation({
      query: (id) => ({ url: `/coupons/${id}`, method: "DELETE" }),
      invalidatesTags: ["Coupon"],
    }),
  }),
});

export const {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponApi;
