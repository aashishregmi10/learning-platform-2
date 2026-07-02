import { baseApi } from "./baseApi";

export const certificateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyCertificates: builder.query({
      query: () => "/certificates/mine",
      providesTags: ["Certificate"],
    }),
    getCertificateStatus: builder.query({
      query: (subjectId) => `/certificates/subject/${subjectId}/status`,
      providesTags: ["Certificate"],
    }),
    issueCertificate: builder.mutation({
      query: (subjectId) => ({ url: "/certificates/issue", method: "POST", body: { subjectId } }),
      invalidatesTags: ["Certificate"],
    }),
  }),
});

export const {
  useGetMyCertificatesQuery,
  useGetCertificateStatusQuery,
  useIssueCertificateMutation,
} = certificateApi;
