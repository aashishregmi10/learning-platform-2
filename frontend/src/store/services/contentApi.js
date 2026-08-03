import { baseApi } from "./baseApi";

export const contentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContents: builder.query({
      query: (params) => ({ url: "/contents/list", params }),
      providesTags: ["Content"],
    }),
    // Full document including the note body — /list strips it deliberately,
    // so anything that EDITS a lesson must load through here.
    getContent: builder.query({
      query: (id) => `/contents/${id}`,
      providesTags: (r, e, id) => [{ type: "Content", id }],
    }),
    // create accepts a FormData (file upload) — RTK Query passes it through.
    createContent: builder.mutation({
      query: (formData) => ({ url: "/contents", method: "POST", body: formData }),
      invalidatesTags: ["Content", "Chapter", "Subject"],
    }),
    updateContent: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/contents/${id}`, method: "PUT", body }),
      invalidatesTags: (r, e, { id }) => ["Content", { type: "Content", id }],
    }),
    // Images pasted into a note body — returns a public URL to embed.
    uploadNoteImage: builder.mutation({
      query: (formData) => ({ url: "/contents/upload-image", method: "POST", body: formData }),
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
  useGetContentQuery,
  useCreateContentMutation,
  useUpdateContentMutation,
  useUploadNoteImageMutation,
  useDeleteContentMutation,
  useLazyPlayContentQuery,
} = contentApi;
