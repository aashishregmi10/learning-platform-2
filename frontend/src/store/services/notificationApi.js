import { baseApi } from "./baseApi";

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyNotifications: builder.query({
      query: (params) => ({ url: "/notifications/mine", params }),
      providesTags: ["Notification"],
    }),
    markNotificationRead: builder.mutation({
      query: (id) => ({ url: `/notifications/${id}/read`, method: "PATCH" }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const { useGetMyNotificationsQuery, useMarkNotificationReadMutation } = notificationApi;
