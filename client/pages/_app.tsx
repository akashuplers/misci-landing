import "@/styles/globals.css";
import axios from "axios";
import type { AppProps } from "next/app";
import { useEffect, useLayoutEffect, useState } from "react";

import { ApolloClient, ApolloProvider, InMemoryCache, HttpLink } from "@apollo/client";
import { ApolloLink } from "@apollo/client";
import { split, useSubscription, gql } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "apollo-utilities";
import { GRAPHQL_URL, WEBSOCKET_URL } from "@/constants";
import useTempId from "@/store/store";
import { useRouter } from "next/router";
import { API_BASE_PATH, API_ROUTES } from "../constants/apiEndpoints";

// axios.interceptors.request.use(
//   (config) => {
//     // Add any headers or modify the request as needed
//     console.log("request : ",config)
//     return config;
//   },
//   (error) => {
//     // Handle any request errors
//     // return Promise.reject(error);
//     console.error("request : ",error)
//   }
// );

// axios.interceptors.response.use(
//   (response) => {
//     // Handle successful responses
//     console.log("response : ",response)
//     return response;
//   },
//   (error) => {
//     // Handle any response errors
//     // return Promise.reject(error);
//     console.error("response : ",error)
//   }
// );

export default function App({ Component, pageProps }: AppProps) {
  
  // const changeTempId = useTempId((state) => state.changeTempId);
  // const tempId = useTempId((state) => state.tempId);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const router = useRouter();
  const pathName = router.pathname;
  const notAllowedRoutes = [""];
  const allowedRoutes = [
    "/",
    "/login",
    "/signUp",
    "/dashboard",
    "/pricing",
    "/subscription",
    "/public/[bid]",
  ];

  useEffect(() => {
    axios.get(API_BASE_PATH + API_ROUTES.TEMP_ID, {
            headers: {
              'Content-Type': 'application/json'
            }
          })
          .then((response) => {
            // alert("axios request")
            console.log("axios temp id ",response)
            localStorage.setItem("tempId", response.data.data.userId);
          })
          .catch((error) => {
            console.error("Error: ", error);
          });

    const getToken = localStorage.getItem("token");
    if (
      getToken === "undefined" ||
      getToken === null ||
      getToken == undefined
    ) {
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  /*useEffect(() => {
    if (
      localStorage.getItem("token") &&
      (router.asPath === "/login" ||
        router.asPath === "/signUp" ||
        router.asPath === "/")
    ) {
      // router.push("/dashboard");
    }
  }, []);*/

  if (typeof window !== "undefined") {
    // Perform localStorage action
    var getToken = localStorage.getItem("token");
  }
  const httpLink = new HttpLink({
    // You should use an absolute URL here
    uri: GRAPHQL_URL,
  });
  const wsLink =
    typeof window !== "undefined"
      ? new GraphQLWsLink(
          createClient({
            url: WEBSOCKET_URL,
          })
        )
      : null;

  // using the ability to split links, you can send data to each link
  // depending on what kind of operation is being sent
  const link =
    typeof window !== "undefined" && wsLink != null
      ? split(
          ({ query }) => {
            const def = getMainDefinition(query);
            return (
              def.kind === "OperationDefinition" &&
              def.operation === "subscription"
            );
          },
          wsLink,
          httpLink
        )
      : httpLink;

  const authLink = new ApolloLink((operation, forward) => {
    // Retrieve the authorization token from local storage or wherever you have stored it
    const authToken = localStorage.getItem("token");

    // Set the authorization header if the token exists
    if (authToken) {
      operation.setContext(({ headers = {} }) => ({
        headers: {
          ...headers,
          authorization: `Bearer ${authToken}`,
        },
      }));
    }

    return forward(operation).map((response) => {
      if (response.errors) {
        const statusCode =
          response.errors[0]?.extensions?.exception?.response?.status;
        if (statusCode === 401) {
          console.log("logout");
        }
      }
      return response;
    });
  });

  const client = new ApolloClient({
    link: authLink.concat(link),
    cache: new InMemoryCache(),
  });

  if (isAuthenticated) {
    return (
      <>
        <ApolloProvider client={client}>
          <Component {...pageProps} />
        </ApolloProvider>
      </>
    );
  } else if (!isAuthenticated && allowedRoutes.includes(pathName)) {
    return (
      <>
        <ApolloProvider client={client}>
          <Component {...pageProps} />
        </ApolloProvider>
      </>
    );
  } else if (!isAuthenticated && notAllowedRoutes.includes(pathName)) {
    return <>{/* <LoginComponent {...pageProps} /> */}</>;
  }
}
