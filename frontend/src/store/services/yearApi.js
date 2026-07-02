import { baseApi } from "./baseApi";

export const yearApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getYears: builder.query({
      query: (params) => ({ url: "/years/list", params }),
      providesTags: ["Year"],
    }),
    getYear: builder.query({
      query: (id) => `/years/${id}`,
      providesTags: ["Year"],
    }),
    createYear: builder.mutation({
      query: (body) => ({ url: "/years", method: "POST", body }),
      invalidatesTags: ["Year"],
    }),
    updateYear: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/years/${id}`, method: "PUT", body }),
      invalidatesTags: ["Year"],
    }),
    deleteYear: builder.mutation({
      query: (id) => ({ url: `/years/${id}`, method: "DELETE" }),
      invalidatesTags: ["Year"],
    }),
  }),
});

export const {
  useGetYearsQuery,
  useGetYearQuery,
  useCreateYearMutation,
  useUpdateYearMutation,
  useDeleteYearMutation,
} = yearApi;
