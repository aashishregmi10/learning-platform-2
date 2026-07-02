import { baseApi } from "./baseApi";

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (body) => ({ url: "/orders", method: "POST", body }),
      invalidatesTags: ["Order"],
    }),
    validateCoupon: builder.mutation({
      query: (body) => ({ url: "/orders/coupons/validate", method: "POST", body }),
    }),
    getOrder: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: ["Order"],
    }),
    getMyOrders: builder.query({
      query: (params) => ({ url: "/orders/mine", params }),
      providesTags: ["Order"],
    }),
    getMySubscriptions: builder.query({
      query: () => "/orders/me/subscriptions",
      providesTags: ["Subscription"],
    }),
    refundOrder: builder.mutation({
      query: ({ id, reason }) => ({ url: `/orders/${id}/refund`, method: "POST", body: { reason } }),
      invalidatesTags: ["Order", "Subscription"],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useValidateCouponMutation,
  useGetOrderQuery,
  useGetMyOrdersQuery,
  useGetMySubscriptionsQuery,
  useRefundOrderMutation,
} = orderApi;
