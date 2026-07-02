import { baseApi } from "./baseApi";

export const sessionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sessionHeartbeat: builder.mutation({
      query: (body) => ({ url: "/sessions/heartbeat", method: "POST", body }),
      invalidatesTags: ["Session"],
    }),
    getMySessions: builder.query({
      query: () => "/sessions/mine",
      providesTags: ["Session"],
    }),
    deleteSession: builder.mutation({
      query: (deviceId) => ({ url: `/sessions/${deviceId}`, method: "DELETE" }),
      invalidatesTags: ["Session"],
    }),
  }),
});

export const { useSessionHeartbeatMutation, useGetMySessionsQuery, useDeleteSessionMutation } = sessionApi;
