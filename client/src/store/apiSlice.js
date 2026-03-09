import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { auth } from "../firebase";
import { API_ORIGIN } from "../services/apiBase";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_ORIGIN,
});

const baseQueryWithAuth = async (args, api, extraOptions) => {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : null;
  const normalizedArgs = typeof args === "string" ? { url: args } : { ...args };

  normalizedArgs.headers = {
    ...(normalizedArgs.headers || {}),
    "Content-Type": "application/json",
  };

  if (token) {
    normalizedArgs.headers.Authorization = `Bearer ${token}`;
  }

  return rawBaseQuery(normalizedArgs, api, extraOptions);
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Ideas", "Idea", "Comments", "Offers", "ContactMessages", "User"],
  endpoints: (builder) => ({
    getIdeas: builder.query({
      query: () => "/api/ideas",
      providesTags: ["Ideas"],
      keepUnusedDataFor: 120,
    }),
    getIdea: builder.query({
      query: (id) => `/api/ideas/${id}`,
      providesTags: (result, error, id) => [{ type: "Idea", id }],
      keepUnusedDataFor: 120,
    }),
    getComments: builder.query({
      query: (id) => `/api/ideas/${id}/comments`,
      providesTags: (result, error, id) => [{ type: "Comments", id }],
      keepUnusedDataFor: 120,
    }),
    getInvestorOffers: builder.query({
      query: () => "/api/ideas/investor/offers",
      providesTags: ["Offers"],
      keepUnusedDataFor: 120,
    }),
    getContactMessages: builder.query({
      query: () => "/api/contact?limit=50",
      providesTags: ["ContactMessages"],
      keepUnusedDataFor: 120,
    }),
    getUserProfile: builder.query({
      query: () => "/api/users/me",
      providesTags: ["User"],
      keepUnusedDataFor: 120,
    }),
    createIdea: builder.mutation({
      query: (body) => ({
        url: "/api/ideas",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Ideas"],
    }),
  }),
});

export const {
  useGetIdeasQuery,
  useGetIdeaQuery,
  useGetCommentsQuery,
  useGetInvestorOffersQuery,
  useGetContactMessagesQuery,
  useGetUserProfileQuery,
  useCreateIdeaMutation,
} = apiSlice;
