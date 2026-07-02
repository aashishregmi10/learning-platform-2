import { baseApi } from "./baseApi";

export const chapterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChapters: builder.query({
      query: (params) => ({ url: "/chapters/list", params }),
      providesTags: ["Chapter"],
    }),
    getChapter: builder.query({
      query: (id) => `/chapters/${id}`,
      providesTags: ["Chapter"],
    }),
    createChapter: builder.mutation({
      query: (body) => ({ url: "/chapters", method: "POST", body }),
      invalidatesTags: ["Chapter", "Subject"],
    }),
    updateChapter: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/chapters/${id}`, method: "PUT", body }),
      invalidatesTags: ["Chapter"],
    }),
    deleteChapter: builder.mutation({
      query: (id) => ({ url: `/chapters/${id}`, method: "DELETE" }),
      invalidatesTags: ["Chapter", "Subject"],
    }),
  }),
});

export const {
  useGetChaptersQuery,
  useGetChapterQuery,
  useCreateChapterMutation,
  useUpdateChapterMutation,
  useDeleteChapterMutation,
} = chapterApi;
