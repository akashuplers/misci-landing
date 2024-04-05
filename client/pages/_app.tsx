/* eslint-disable react-hooks/exhaustive-deps */
import "@/styles/globals.css";
import axios from "axios";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import CookieConsent from "react-cookie-consent";
import localFont from "next/font/local";

import { GRAPHQL_URL, WEBSOCKET_URL } from "@/constants";
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  split,
} from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "apollo-utilities";
import { createClient } from "graphql-ws";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";
import { API_BASE_PATH, API_ROUTES } from "../constants/apiEndpoints";
import { WebSocketLink } from "@apollo/client/link/ws";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { useClientUserStore } from "@/store/store";

axios.interceptors.request.use(
  (config) => {
    // Add any headers or modify the request as needed
    console.log("request : ", config);
    return config;
  },
  (error) => {
    // Handle any request errors
    console.error("request : ", error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    if (!localStorage.getItem("token")) return response;

    // Handle successful responses
    console.log("response : ", response);
    if (response.status === 401) {
      console.log("User Not Unauthorized");
      localStorage.clear();
      window.location.href = "/";
    }
    return response;
  },
  (error) => {
    if (!localStorage.getItem("token")) return error;

    // Handle any response errors
    console.error("error response : ", error);
    if (error?.response?.status === 401) {
      console.log("User Not Unauthorized");
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);
const ubuntu = localFont({
  src: [
    {
      path: "../public/fonts/Ubuntu-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Ubuntu-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/Ubuntu-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/Ubuntu-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
});

export default function App({ Component, pageProps }: AppProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const {
    token: userToken,
    userID: userLocalId,
    loadingConfigs,
    addValues,
  } = useClientUserStore();
  const router = useRouter();
  const pathName = router.pathname;
  console.log("pathName", pathName);
  const notAllowedRoutes = [""];
  const allowedRoutes = [
    "/",
    "/login",
    "/signUp",
    "/dashboard",
    "/dashboard/[bid]",
    "/pricing",
    "/subscription",
    "/public/[bid]",
    "/profile/[bid]",
    "/resetPass",
    "/cancellation-policy",
    "/faq",
    "/aboutus",
    "/test",
    "/public/[[...slug]]",
    "/misci",
    "/misci/article",
    "/misci/topqna",
    '/library',
    '/library/[lid]',
    '/features',
    '/misci/home',
    '/misci/food-list',
    '/misci/document',
    '/misci/document/[foodName]',
  ];

  useEffect(() => {
    import('react-facebook-pixel')
      .then((x) => x.default)
      .then((ReactPixel) => {
        ReactPixel.init('3524555041095937')
        ReactPixel.pageView()

        router.events.on('routeChangeComplete', () => {
          ReactPixel.pageView()
        })
      })
  }, [router.events])

  useEffect(() => {
    axios
      .get(API_BASE_PATH + API_ROUTES.TEMP_ID, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        // alert("axios request")
        console.log("axios temp id ", response);
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

  if (typeof window !== "undefined") {
    // Perform localStorage action
    var getToken = localStorage.getItem("token");
    const userID = localStorage.getItem("userId");
    const tempID = localStorage.getItem("tempId");
    const userLocalId = userID ?? tempID;
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
      console.log(`[GraphQL] Response: ${operation.operationName}`, response);
      return response;
    });
  });

  const client = new ApolloClient({
    link: authLink.concat(link),
    cache: new InMemoryCache(),
  });

  useEffect(() => {
    const script = document.createElement("script");
    script.innerHTML = `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "gx2upzxn6g");
    `;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (isAuthenticated) {
    return (
      <>
        <ApolloProvider client={client}>
          <ToastContainer />
          <Component {...pageProps} />
          {pathName.startsWith("/misci") ? null : (
            <>
              <CookieConsent
                location="bottom"
                buttonText="I Understand"
                cookieName="myAwesomeCookieName2"
                style={{ background: "#2B373B" }}
                buttonStyle={{ color: "#4e503b", fontSize: "10px" }}
                expires={150}
              >
                <span style={{ fontSize: "12px" }}>
                  This website uses cookies to enhance the user experience. We
                  only use this for better feature development and any support
                  requirements that come up.
                </span>
              </CookieConsent>
            </>
          )}
        </ApolloProvider>
      </>
    );
  } else if (
    !isAuthenticated &&
    (allowedRoutes.includes(pathName) || pathName.includes("public"))
  ) {
    return (
      <>
        <ApolloProvider client={client}>
          <ToastContainer />
          <Component {...pageProps} />
          {pathName.startsWith("/misci") ? null : (
            <>
              <CookieConsent
                location="bottom"
                buttonText="I Understand"
                cookieName="myAwesomeCookieName2"
                style={{ background: "#2B373B" }}
                buttonStyle={{ color: "#4e503b", fontSize: "10px" }}
                expires={150}
              >
                {" "}
                <span style={{ fontSize: "12px" }}>
                  This website uses cookies to enhance the user experience. We
                  only use this for better feature development and any support
                  requirements that come up.
                </span>
              </CookieConsent>
            </>
          )}
        </ApolloProvider>
      </>
    );
  } else if (
    !isAuthenticated &&
    (notAllowedRoutes.includes(pathName) || pathName.includes("public"))
  ) {
    return <>{/* <LoginComponent {...pageProps} /> */}</>;
  }
}