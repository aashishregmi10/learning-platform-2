import { baseApi } from "./baseApi";

export const programApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPrograms: builder.query({
      query: (params) => ({ url: "/programs/list", params }),
      providesTags: ["Program"],
    }),
    getActivePrograms: builder.query({
      query: () => "/programs/active",
      providesTags: ["Program"],
    }),
    getProgram: builder.query({
      query: (id) => `/programs/${id}`,
      providesTags: ["Program"],
    }),
    createProgram: builder.mutation({
      query: (body) => ({ url: "/programs", method: "POST", body }),
      invalidatesTags: ["Program"],
    }),
    updateProgram: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/programs/${id}`, method: "PUT", body }),
      invalidatesTags: ["Program"],
    }),
    deleteProgram: builder.mutation({
      query: (id) => ({ url: `/programs/${id}`, method: "DELETE" }),
      invalidatesTags: ["Program"],
    }),
  }),
});

export const {
  useGetProgramsQuery,
  useGetActiveProgramsQuery,
  useGetProgramQuery,
  useCreateProgramMutation,
  useUpdateProgramMutation,
  useDeleteProgramMutation,
} = programApi;
