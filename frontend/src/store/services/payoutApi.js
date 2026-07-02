import { baseApi } from "./baseApi";

export const payoutApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listPayouts: builder.query({
      query: (params) => ({ url: "/payouts/list", params }),
      providesTags: ["Payout"],
    }),
    getPayout: builder.query({
      query: (id) => `/payouts/${id}`,
      providesTags: ["Payout"],
    }),
    computePayouts: builder.mutation({
      query: (body) => ({ url: "/payouts/compute", method: "POST", body }),
      invalidatesTags: ["Payout"],
    }),
    updatePayout: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/payouts/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Payout"],
    }),
  }),
});

export const { useListPayoutsQuery, useGetPayoutQuery, useComputePayoutsMutation, useUpdatePayoutMutation } = payoutApi;
