import { baseApi } from "./baseApi";

export const contentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContents: builder.query({
      query: (params) => ({ url: "/contents/list", params }),
      providesTags: ["Content"],
    }),
    // create accepts a FormData (file upload) — RTK Query passes it through.
    createContent: builder.mutation({
      query: (formData) => ({ url: "/contents", method: "POST", body: formData }),
      invalidatesTags: ["Content", "Chapter", "Subject"],
    }),
    updateContent: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/contents/${id}`, method: "PUT", body }),
      invalidatesTags: ["Content"],
    }),
    deleteContent: builder.mutation({
      query: (id) => ({ url: `/contents/${id}`, method: "DELETE" }),
      invalidatesTags: ["Content", "Chapter", "Subject"],
    }),
    // lazy: fetch a signed playback url on demand
    playContent: builder.query({
      query: (id) => `/contents/${id}/play`,
    }),
  }),
});

export const {
  useGetContentsQuery,
  useCreateContentMutation,
  useUpdateContentMutation,
  useDeleteContentMutation,
  useLazyPlayContentQuery,
} = contentApi;
