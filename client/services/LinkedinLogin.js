import { LI_API_ENDPOINTS, API_BASE_PATH } from "../constants/apiEndpoints";

const Headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
    "Access-Control-Allow-Headers": "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers",
}


export const LinkedinLogin =  (code, loaderFunction, login) => {
    fetch(`${API_BASE_PATH}${LI_API_ENDPOINTS.LI_ACCESS_TOKEN}`,{
        method : "POST",
        headers : Headers,
        body : JSON.stringify({
            code: code,
            url: window.location.origin,
        })
    }).then(res =>  res.json())
      .then(result => {
        console.log(result)
        if(result?.data)
            linkedinUserDetails(result.data.access_token, loaderFunction, login)
        }
      )
      .catch(err => console.error(err))
};

const linkedinUserDetails = async (token, login, loaderFunction) => {
    localStorage.setItem("linkedInAccessToken", token);
    fetch(`${API_BASE_PATH}${LI_API_ENDPOINTS.LI_PROFILE}`,{
        method: "POST",
        headers: Headers,
        body: JSON.stringify({accessToken: token})
    }).then(res => res.json())
      .then(res => {
        const signUpFormData = {
            firstName: res.data.localizedFirstName,
            lastName: res.data.localizedLastName,
            email: res.data.email,
            password: null,
            tempUserId: "",
        }
        fetch(API_BASE_PATH + API_ROUTES.CREATE_USER, {
            method: "POST",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify(signUpFormData),
            })
            .then((res) => res.json())
            .then((res) => {
                setSubmitting(false);
                setModalIsOpen(false);
                afterCreateUser(res);
            })
            .catch((err) => console.error("Error: ", err))
            .finally(() => {
                setSubmitting(false);
                setSignUpFormData({
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                tempUserId: "",
                });
                setModalIsOpen(false);
            });
    })
      .catch(err => console.error(err))
};
