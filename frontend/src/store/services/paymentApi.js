import { baseApi } from "./baseApi";

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    initiateEsewa: builder.mutation({
      query: (orderId) => ({ url: "/payments/esewa/initiate", method: "POST", body: { orderId } }),
    }),
    // dev-only: simulate a successful payment without eSewa's sandbox
    devComplete: builder.mutation({
      query: (orderId) => ({ url: `/payments/dev/complete/${orderId}`, method: "POST" }),
      invalidatesTags: ["Order", "Subscription", "Content"],
    }),
  }),
});

export const { useInitiateEsewaMutation, useDevCompleteMutation } = paymentApi;

// Build a hidden form and POST to eSewa (standard ePay v2 redirect).
export const submitEsewaForm = ({ esewaUrl, fields }) => {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = esewaUrl;
  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
};
