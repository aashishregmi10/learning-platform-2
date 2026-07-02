import { baseApi } from "./baseApi";

export const quizApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // student — answer keys stripped
    getQuiz: builder.query({
      query: (id) => `/quizzes/${id}`,
      providesTags: (r, e, id) => [{ type: "Quiz", id }],
    }),
    submitQuiz: builder.mutation({
      query: ({ id, answers, startedAt }) => ({
        url: `/quizzes/${id}/submit`,
        method: "POST",
        body: { answers, startedAt },
      }),
      invalidatesTags: (r, e, { id }) => [{ type: "Quiz", id }],
    }),
    getMyAttempts: builder.query({
      query: (id) => `/quizzes/${id}/attempts`,
      providesTags: (r, e, id) => [{ type: "Quiz", id }],
    }),

    // teacher/admin authoring — includes answer keys
    listQuizzes: builder.query({
      query: (params) => ({ url: "/quizzes/list", params }),
      providesTags: ["Quiz"],
    }),
    createQuiz: builder.mutation({
      query: (body) => ({ url: "/quizzes", method: "POST", body }),
      invalidatesTags: ["Quiz"],
    }),
    updateQuiz: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/quizzes/${id}`, method: "PUT", body }),
      invalidatesTags: ["Quiz"],
    }),
    deleteQuiz: builder.mutation({
      query: (id) => ({ url: `/quizzes/${id}`, method: "DELETE" }),
      invalidatesTags: ["Quiz"],
    }),
  }),
});

export const {
  useGetQuizQuery,
  useSubmitQuizMutation,
  useGetMyAttemptsQuery,
  useListQuizzesQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
} = quizApi;
