import {
  LI_API_ENDPOINTS,
  API_BASE_PATH,
  API_ROUTES,
} from "../constants/apiEndpoints";

const Headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
  "Access-Control-Allow-Headers":
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers",
};

export const LinkedinLogin = (code, loaderFunction, handleSave) => {
  fetch(`${API_BASE_PATH}${LI_API_ENDPOINTS.LI_ACCESS_TOKEN}`, {
    method: "POST",
    headers: Headers,
    body: JSON.stringify({
      code: code,
      url: window.location.origin + window.location.pathname,
    }),
  })
    .then((res) => res.json())
    .then((result) => {
      if (result?.data)
        linkedinUserDetails(
          result.data.access_token,
          loaderFunction,
          handleSave
        );
    })
    .catch((err) => console.error(err));
};

const linkedinUserDetails = async (token, loaderFunction, handleSave) => {
  console.log("linkedinUserDetails");
  localStorage.setItem("linkedInAccessToken", token);
  fetch(`${API_BASE_PATH}${LI_API_ENDPOINTS.LI_PROFILE}`, {
    method: "POST",
    headers: Headers,
    body: JSON.stringify({ accessToken: token }),
  })
    .then((res) => res.json())
    .then((res) => {
      localStorage.setItem(
        "authorId",
        JSON.stringify(res.data.id).replace(/['"]+/g, "")
      );
      const signUpFormData = {
        firstName: res.data.localizedFirstName,
        lastName: res.data.localizedLastName,
        email: res.data.email,
        password: null,
        tempUserId: "",
      };
      const handleLoginSubmit = (email) => {
        fetch(API_BASE_PATH + API_ROUTES.SOCIAL_LOGIN_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            email: email,
          }),
        })
          .then((res) => res.json())
          .then((data) => redirectPageAfterLogin(data))
          .catch((err) => console.error("Error: ", err))
          .finally(() => {
            // setModalIsOpen(false);
            // setLoginFormData({
            //     email: "",
            //     password: "",
            // });
          });

        function redirectPageAfterLogin(data) {
          console.log(data);

          localStorage.setItem(
            "token",
            JSON.stringify(data.data.accessToken).replace(/['"]+/g, "")
          );

          var raw = JSON.stringify({
            query:
              "query Query {\n  me {\n    upcomingInvoicedDate\n    name\n    lastName\n    subscriptionId\n    subscribeStatus\n    paid\n    lastInvoicedDate\n    isSubscribed\n    interval\n    freeTrialDays\n    freeTrial\n    freeTrailEndsDate\n    email\n    date\n    admin\n    _id\n  credits\n  }\n}",
          });

          fetch("https://maverick.lille.ai/graphql", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
            body: raw,
            redirect: "follow",
          })
            .then((response) => response.text())
            .then((result) => {
              console.log("Succesfully Logged In");
              const json = JSON.parse(result);
              localStorage.setItem(
                "userId",
                JSON.stringify(json.data.me._id).replace(/['"]+/g, "")
              );
            })
            .catch((error) => console.log("error", error))
            .finally(() => {
              if (window.location.pathname === "/dashboard") {
                handleSave();
              }

              if (window.location.pathname === "/") {
                window.location.href = "/dashboard";
              }
            });
          return;
        }
      };
      fetch(API_BASE_PATH + API_ROUTES.CREATE_USER, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(signUpFormData),
      })
        .then((res) => res.json())
        .then((res) => {
          console.log(res);
          // if(res.error === true) return

          console.log("Succesfully signed up");
          handleLoginSubmit(signUpFormData.email);
        })
        .catch((err) => console.error("Error: ", err))
        .finally(() => {
          // setSubmitting(false);
          // setSignUpFormData({
          // firstName: "",
          // lastName: "",
          // email: "",
          // password: "",
          // tempUserId: "",
          // });
          // setModalIsOpen(false);
        });
    })
    .catch((err) => console.error(err));
};
