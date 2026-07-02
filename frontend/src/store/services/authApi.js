import { baseApi } from "./baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    googleLogin: builder.mutation({
      query: (idToken) => ({
        url: "/auth/google",
        method: "POST",
        body: { idToken },
      }),
    }),
    staffLogin: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    getMe: builder.query({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),
  }),
});

export const {
  useGoogleLoginMutation,
  useStaffLoginMutation,
  useGetMeQuery,
} = authApi;
