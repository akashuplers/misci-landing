import "@/styles/globals.css";
import axios from "axios";
import type { AppProps } from "next/app";
import { useEffect, useLayoutEffect, useState } from "react";
import { split, useSubscription, gql } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "apollo-utilities";
import { ApolloProvider } from "@apollo/client";
import { GRAPHQL_URL, WEBSOCKET_URL } from "@/constants";
import useTempId from "@/store/store";
import { useRouter } from "next/router";
import { API_BASE_PATH, API_ROUTES } from "../constants/apiEndpoints";
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";

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
    fetch(API_BASE_PATH + API_ROUTES.TEMP_ID, {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => localStorage.setItem("tempId", data.data.userId))
      .catch((err) => console.error("Error: ", err));

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

  useEffect(() => {
    if (
      localStorage.getItem("token") &&
      (router.asPath === "/login" ||
        router.asPath === "/signUp" ||
        router.asPath === "/")
    ) {
      // router.push("/dashboard");
    }
  }, []);

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
    console.log(
      `[GraphQL] Request: ${operation.operationName}`,
      operation.variables
    );

    return forward(operation).map((response) => {
      if (response.errors) {
        // localStorage.clear();
        // toast.success("Bad Request!!", {
        //   position: "top-center",
        //   autoClose: 5000,
        //   hideProgressBar: false,
        //   closeOnClick: true,
        //   pauseOnHover: true,
        //   draggable: true,
        //   progress: undefined,
        //   theme: "light",
        // });
      }
      console.log(`[GraphQL] Response: ${operation.operationName}`, response);
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
          <ToastContainer />
          <Component {...pageProps} />
        </ApolloProvider>
      </>
    );
  } else if (!isAuthenticated && allowedRoutes.includes(pathName)) {
    return (
      <>
        <ApolloProvider client={client}>
          <ToastContainer />
          <Component {...pageProps} />
        </ApolloProvider>
      </>
    );
  } else if (!isAuthenticated && notAllowedRoutes.includes(pathName)) {
    return <>{/* <LoginComponent {...pageProps} /> */}</>;
  }
}
