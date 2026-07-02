import { baseApi } from "./baseApi";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTeachers: builder.query({
      query: (params) => ({ url: "/users/teachers", params }),
      providesTags: ["Teacher"],
    }),
    createTeacher: builder.mutation({
      query: (body) => ({ url: "/users/teachers", method: "POST", body }),
      invalidatesTags: ["Teacher"],
    }),
    approveTeacher: builder.mutation({
      query: (id) => ({ url: `/users/teachers/${id}/approve`, method: "PATCH" }),
      invalidatesTags: ["Teacher"],
    }),
    getUsers: builder.query({
      query: (params) => ({ url: "/users", params }),
      providesTags: ["User"],
    }),
    deactivateUser: builder.mutation({
      query: (id) => ({ url: `/users/${id}/deactivate`, method: "PATCH" }),
      invalidatesTags: ["User", "Teacher"],
    }),
  }),
});

export const {
  useGetTeachersQuery,
  useLazyGetTeachersQuery,
  useCreateTeacherMutation,
  useApproveTeacherMutation,
  useGetUsersQuery,
  useDeactivateUserMutation,
} = userApi;
