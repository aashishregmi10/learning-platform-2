import { baseApi } from "./baseApi";

export const catalogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyCatalog: builder.query({
      query: () => "/catalog/me",
      providesTags: ["Subject"],
    }),
    getSubjectContent: builder.query({
      query: (id) => `/catalog/subject/${id}`,
      providesTags: ["Content"],
    }),
  }),
});

export const { useGetMyCatalogQuery, useGetSubjectContentQuery } = catalogApi;
