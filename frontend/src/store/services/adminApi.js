import { baseApi } from "./baseApi";

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboard: builder.query({
      query: () => "/admin/dashboard",
      providesTags: ["AdminDashboard"],
    }),
    getMonitor: builder.query({
      query: ({ resource, ...params }) => ({ url: `/admin/monitor/${resource}`, params }),
      providesTags: ["AdminDashboard"],
    }),
  }),
});

export const { useGetAdminDashboardQuery, useGetMonitorQuery } = adminApi;
