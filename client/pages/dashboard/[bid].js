import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import ReactConfetti from "react-confetti";
import { ToastContainer, toast } from "react-toastify";
import DashboardInsights from "../../components/DashboardInsights";
import Layout from "../../components/Layout";
import TinyMCEEditor from "../../components/TinyMCEEditor";
import { API_BASE_PATH } from "../../constants/apiEndpoints";
import { getBlogbyId } from "../../graphql/queries/getBlogbyId";
import { meeAPI } from "../../graphql/querys/mee";
import { jsonToHtml } from "../../helpers/helper";
import PreferencesModal from "../../modals/PreferencesModal";
import Head from "next/head";

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", function (event) {
    event.stopImmediatePropagation();
  });
}


// get the path of link in server

// export const getServerSideProps = async (context) => {
//   const { params } = context;
//   console.log("CONTEXT");
//   console.log(context);
//   const { bid } = params;
//   console.log(params);
//   console.log('PARAMS');
//   console.log(bid);

//   return {
//     props: { bid: bid }
//   };
// };



export default function Post() {
  const [pfmodal, setPFModal] = useState(false);
  const router = useRouter();
  const { bid, isPublished } = router.query;
  const [reference, setReference] = useState([]);
  const [freshIdeasReferences, setFreshIdeasReferences] = useState([]);
  const [option, setOption] = useState("blog");
  console.log('ROUTER QUERY');
  console.log(router);
  // console.log("isPublished", isPublished);
  console.log("router.query", router.query);
  const { data, loading, error } = useQuery(getBlogbyId, {
    variables: {
      fetchBlogId: bid,
    },
  });
  // const [isPublished, setIsPublished] = useState(false);
  const [ideas, setIdeas] = useState([]);
  const [freshIdeas, setFreshIdeas] = useState([]);

  const [freshIdeaTags, setFreshIdeaTags] = useState([]);

  const [editorText, setEditorText] = useState([]);
  const [tags, setTags] = useState([]);
  const [blogData, setBlogData] = useState([]);

  const [pyResTime, setPyResTime] = useState(null);
  const [ndResTime, setNdResTime] = useState(null);
  const [isPayment, setIsPayment] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);
  useEffect(() => {

    setWindowWidth(window.innerWidth);

  }, []);
  useEffect(() => {
    if (data == null) return;

    console.log("fetchBlog ", data);
    setBlogData(data.fetchBlog);
    setIdeas(data.fetchBlog.ideas.ideas);
    setTags(data.fetchBlog.tags);
    setFreshIdeaTags(data.fetchBlog.freshIdeasTags);
    setFreshIdeasReferences(data.fetchBlog.freshIdeasReferences);
    setReference(data.fetchBlog.references);
    setFreshIdeas(data.fetchBlog.ideas.freshIdeas);
    // setIsPublished(data?.fetchBlog?.publish_data[2]?.published);

    // const aa = data.generate.publish_data[2].tiny_mce_data;
    const newArray = data.fetchBlog.publish_data.filter(
      (obj) => obj.platform === "wordpress"
    );
    var aa;
    const arr = newArray.find((pd) => pd.published === false);
    if (arr) {
      aa = arr.tiny_mce_data;
    } else {
      aa = newArray[newArray.length - 1].tiny_mce_data;
    }
    const htmlDoc = jsonToHtml(aa);
    setEditorText(htmlDoc);
  }, [data]);

  var getToken;
  if (typeof window !== "undefined") {
    getToken = localStorage.getItem("token");
  }

  const { data: meeData } = useQuery(meeAPI, {
    context: {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + getToken,
      },
    },
    onError: ({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        for (let err of graphQLErrors) {
          switch (err.extensions.code) {
            case "UNAUTHENTICATED":
              localStorage.clear();
              window.location.href = "/";
          }
        }
      }
      if (networkError) {
        console.log(`[Network error]: ${networkError}`);
        if (
          `${networkError}` ===
          "ServerError: Response not successful: Received status code 401"
        ) {
          localStorage.clear();
          toast.error("Session Expired! Please Login Again..", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
        }
      }
    },
  });
  useEffect(() => {
    console.log(router);
    console.log('LOCAL STORERAGE');
    console.log(localStorage);
    /* asPath "/?payment=true" */
    // query 
    const query = router.query;
    console.log('QUERY');
    console.log(query);
    console.log('ROUTER');
    const { payment } = router.query;
    if (payment === 'true') {
      // The "?payment=true" parameter is present in the URL
      console.log('Payment is true');
      console.log('ROUTER CHECK IF PAYMENT==TRUE');
      console.log('USER CONTRIBUTION');

      // console.log(userContribution);
      if (localStorage.getItem('userContribution') !== null) {
        var userContribution = JSON.parse(localStorage.getItem('userContribution') || '{}');
        console.log('USER CONTRIBUTION IS NOT NULL');
        console.log(userContribution);
        // /auth/save-user-support
        const SAVE_USER_SUPPORT_URL = 'https://maverick.lille.ai/auth/save-user-support';

        const requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem("token")
          },
          body: JSON.stringify(userContribution)
        };
        console.log('REQUEST OPTIONS');
        fetch(SAVE_USER_SUPPORT_URL, requestOptions).then((response) => {
          console.log('RESPONSE FROM SAVE USER SUPPORT');
          console.log(response);
          console.log(response.json());
        }).catch((error) => {
          console.log('ERROR FROM SAVE USER SUPPORT');
          console.log(error);
        }
        );
      }
      setIsPayment(true);
      toast.success("Payment Successful!", {
        toastId: "payment-success",
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      localStorage.setItem("payment", "true");
    } else {
      console.log('ROUTER CHECK IF PAYMENT==TRUE ELSE');
      localStorage.removeItem("userContribution");
    }


  }, [router]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = null;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    console.log(meeData);
    if (meeData?.me.prefFilled === false) {
      setPFModal(true);
    }
  }, [meeData]);

  console.log(freshIdeasReferences);

  return (
    <>
 <Head><title>{blogData}</title><meta about="body">{blogData}</meta></Head>
      <Layout>
       
        <ToastContainer />
        {
          isPayment && <ReactConfetti
            width={windowWidth}
            recycle={false}
            numberOfPieces={2000}
          />
        }
        <div className="flex">
          {pfmodal && (
            <PreferencesModal
              pfmodal={pfmodal}
              setPFModal={setPFModal}
              getToken={getToken}
            />
          )}
          {API_BASE_PATH === "https://maverick.lille.ai" && (
            <div
              style={{
                zIndex: "10",
                display: "none",
                position: "absolute",
                background: "white",
                border: "1px solid black",
                width: "200px",
                top: "2%",
                left: "50%",
                transform: "translateX(-30%)",
                fontSize: "0.75rem",
              }}
            >
              <span>
                Python Response Time : {(pyResTime * 60).toFixed(2) ?? ""}sec
              </span>
              <br />
              <span>
                Node Response Time : {(ndResTime * 60).toFixed(2) ?? ""}sec
              </span>
            </div>
          )}
          <div className="relative" style={{ width: "var(--tinymce-width)" }}>
            <TinyMCEEditor
              isAuthenticated={true}
              editorText={editorText}
              blogData={blogData}
              blog_id={bid}
              isPublished={isPublished}
              loading={loading}
              option={option}
              setOption={setOption}
            />
          </div>
          <div
            className="relative"
            style={{ width: "var(--dashboardInsight-width)" }}
          >
            <DashboardInsights
              ideas={ideas}
              setIdeas={setIdeas}
              tags={tags}
              setTags={setTags}
              freshIdeaTags={freshIdeaTags}
              freshIdeas={freshIdeas}
              freshIdeasReferences={freshIdeasReferences}
              setFreshIdeaReferences={setFreshIdeasReferences}
              reference={reference}
              setReference={setReference}
              blog_id={bid}
              loading={loading}
              setEditorText={setEditorText}
              setBlogData={setBlogData}
              // tags={data?.fetchBlog?.tags}
              setPyResTime={setPyResTime}
              setNdResTime={setNdResTime}
            />
          </div>
        </div>
      </Layout>
    </>
  );
}
