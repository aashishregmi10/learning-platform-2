import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Single API surface. Each domain file uses baseApi.injectEndpoints(...).
export const baseApi = createApi({
  reducerPath: "baseApi",

  // Central cache tags — append new ones here as parts are built.
  tagTypes: [
    "User",
    "Teacher",
    "Student",
    // Part 2+
    "Program",
    "Year",
    "Subject",
    "Chapter",
    "Content",
    // Part 3+
    "Order",
    "Coupon",
    "Subscription",
    "Entitlement",
    // Part 4+
    "Progress",
    "Quiz",
    "Certificate",
    // Part 5+
    "LiveClass",
    "Notification",
    "Session",
    // Part 6+
    "Review",
    "Doubt",
    "ActivityLog",
  ],

  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.user?.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  endpoints: () => ({}),
});
