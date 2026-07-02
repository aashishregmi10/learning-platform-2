import { baseApi } from "./baseApi";

export const liveClassApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // student
    getUpcomingLiveClasses: builder.query({
      query: () => "/live-classes/upcoming",
      providesTags: ["LiveClass"],
    }),
    joinLiveClass: builder.query({
      query: (id) => `/live-classes/${id}/join`,
    }),
    attendanceHeartbeat: builder.mutation({
      query: (id) => ({ url: `/live-classes/${id}/attendance/heartbeat`, method: "POST" }),
    }),
    getRecording: builder.query({
      query: (id) => `/live-classes/${id}/recording`,
    }),

    // teacher/admin
    listLiveClasses: builder.query({
      query: (params) => ({ url: "/live-classes/list", params }),
      providesTags: ["LiveClass"],
    }),
    getLiveClass: builder.query({
      query: (id) => `/live-classes/${id}`,
      providesTags: (r, e, id) => [{ type: "LiveClass", id }],
    }),
    createLiveClass: builder.mutation({
      query: (body) => ({ url: "/live-classes", method: "POST", body }),
      invalidatesTags: ["LiveClass"],
    }),
    updateLiveClass: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/live-classes/${id}`, method: "PUT", body }),
      invalidatesTags: ["LiveClass"],
    }),
    cancelLiveClass: builder.mutation({
      query: (id) => ({ url: `/live-classes/${id}`, method: "DELETE" }),
      invalidatesTags: ["LiveClass"],
    }),
    startLiveClass: builder.mutation({
      query: (id) => ({ url: `/live-classes/${id}/start`, method: "PATCH" }),
      invalidatesTags: ["LiveClass"],
    }),
    endLiveClass: builder.mutation({
      query: (id) => ({ url: `/live-classes/${id}/end`, method: "PATCH" }),
      invalidatesTags: ["LiveClass"],
    }),
    listAttendance: builder.query({
      query: (id) => `/live-classes/${id}/attendance`,
      providesTags: ["LiveClass"],
    }),
  }),
});

export const {
  useGetUpcomingLiveClassesQuery,
  useLazyJoinLiveClassQuery,
  useAttendanceHeartbeatMutation,
  useLazyGetRecordingQuery,
  useListLiveClassesQuery,
  useGetLiveClassQuery,
  useCreateLiveClassMutation,
  useUpdateLiveClassMutation,
  useCancelLiveClassMutation,
  useStartLiveClassMutation,
  useEndLiveClassMutation,
  useListAttendanceQuery,
} = liveClassApi;
