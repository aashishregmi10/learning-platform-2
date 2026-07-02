import { baseApi } from "./baseApi";

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubjectReviews: builder.query({
      query: ({ id, ...params }) => ({ url: `/reviews/subject/${id}`, params }),
      providesTags: ["Review"],
    }),
    getTeacherReviews: builder.query({
      query: ({ id, ...params }) => ({ url: `/reviews/teacher/${id}`, params }),
      providesTags: ["Review"],
    }),
    createReview: builder.mutation({
      query: (body) => ({ url: "/reviews", method: "POST", body }),
      invalidatesTags: ["Review", "Subject"],
    }),
    respondToReview: builder.mutation({
      query: ({ id, text }) => ({ url: `/reviews/${id}/respond`, method: "PATCH", body: { text } }),
      invalidatesTags: ["Review"],
    }),
    updateReviewVisibility: builder.mutation({
      query: ({ id, isVisible }) => ({ url: `/reviews/${id}/visibility`, method: "PATCH", body: { isVisible } }),
      invalidatesTags: ["Review", "Subject"],
    }),
  }),
});

export const {
  useGetSubjectReviewsQuery,
  useGetTeacherReviewsQuery,
  useCreateReviewMutation,
  useRespondToReviewMutation,
  useUpdateReviewVisibilityMutation,
} = reviewApi;
