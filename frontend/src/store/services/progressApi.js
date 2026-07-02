import { baseApi } from "./baseApi";

export const progressApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubjectProgress: builder.query({
      query: (subjectId) => `/progress/subject/${subjectId}`,
      providesTags: ["Progress"],
    }),
    saveProgress: builder.mutation({
      query: (body) => ({ url: "/progress", method: "PUT", body }),
      invalidatesTags: ["Progress", "Certificate"],
    }),
  }),
});

export const { useGetSubjectProgressQuery, useSaveProgressMutation } = progressApi;
