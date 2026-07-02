import { baseApi } from "./baseApi";

export const activityLogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActivityLogs: builder.query({
      query: (params) => ({ url: "/activity-logs", params }),
      providesTags: ["ActivityLog"],
    }),
  }),
});

export const { useGetActivityLogsQuery } = activityLogApi;
