import { baseApi } from "./baseApi";

export const doubtApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChapterDoubts: builder.query({
      query: (chapterId) => `/doubts/chapter/${chapterId}`,
      providesTags: ["Doubt"],
    }),
    getLiveClassDoubts: builder.query({
      query: (liveClassId) => `/doubts/live-class/${liveClassId}`,
      providesTags: ["Doubt"],
    }),
    createDoubt: builder.mutation({
      query: (body) => ({ url: "/doubts", method: "POST", body }),
      invalidatesTags: ["Doubt"],
    }),
    resolveDoubt: builder.mutation({
      query: (id) => ({ url: `/doubts/${id}/resolve`, method: "PATCH" }),
      invalidatesTags: ["Doubt"],
    }),
    upvoteDoubt: builder.mutation({
      query: (id) => ({ url: `/doubts/${id}/upvote`, method: "POST" }),
      invalidatesTags: ["Doubt"],
    }),
  }),
});

export const {
  useGetChapterDoubtsQuery,
  useGetLiveClassDoubtsQuery,
  useCreateDoubtMutation,
  useResolveDoubtMutation,
  useUpvoteDoubtMutation,
} = doubtApi;
