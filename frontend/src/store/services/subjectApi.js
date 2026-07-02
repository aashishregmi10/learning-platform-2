import { baseApi } from "./baseApi";

export const subjectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubjects: builder.query({
      query: (params) => ({ url: "/subjects/list", params }),
      providesTags: ["Subject"],
    }),
    getSubject: builder.query({
      query: (id) => `/subjects/${id}`,
      providesTags: ["Subject"],
    }),
    getSubjectBySlug: builder.query({
      query: (slug) => `/subjects/slug/${slug}`,
      providesTags: ["Subject"],
    }),
    createSubject: builder.mutation({
      query: (body) => ({ url: "/subjects", method: "POST", body }),
      invalidatesTags: ["Subject", "Year"],
    }),
    updateSubject: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/subjects/${id}`, method: "PUT", body }),
      invalidatesTags: ["Subject"],
    }),
    deleteSubject: builder.mutation({
      query: (id) => ({ url: `/subjects/${id}`, method: "DELETE" }),
      invalidatesTags: ["Subject", "Year"],
    }),
  }),
});

export const {
  useGetSubjectsQuery,
  useGetSubjectQuery,
  useGetSubjectBySlugQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} = subjectApi;
