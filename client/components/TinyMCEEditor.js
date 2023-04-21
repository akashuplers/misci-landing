/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { htmlToJson, jsonToHtml } from "../helpers/helper";
import { updateBlog } from "../graphql/mutations/updateBlog";
import LoaderPlane from "./LoaderPlane";
import { useMutation } from "@apollo/client";
import AuthenticationModal from "./AuthenticationModal";
import { useRouter } from "next/router";
import { LINKEDIN_CLIENT_ID } from "../constants/apiEndpoints";
import ReactLoading from "react-loading";
import Modal from "react-modal";
import axios from "axios";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  EmailShareButton,
} from "react-share";
import {
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  TelegramIcon,
  EmailIcon,
} from "react-share";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast, ToastContainer } from "react-toastify";

export default function TinyMCEEditor({
  topic,
  isAuthenticated,
  editorText,
  loading,
  blog_id,
  blogData: dataIncoming,
  blogData,
  isPublished,
  ref,
}) {
  const [updatedText, setEditorText] = useState(editorText);
  const [saveLoad, setSaveLoad] = useState(false);
  const [saveText, setSaveText] = useState("Save!");
  const [publishLoad, setPublishLoad] = useState(false);
  const [publishText, setPublishText] = useState("Publish");
  const [publishLinkLoad, setPublishLinkLoad] = useState(false);
  const [publishLinkText, setPublishLinkText] = useState("Publish on Linkedin");
  const [openModal, setOpenModal] = useState(false);
  const [text, setText] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [option, setOption] = useState("blog");
  const [imageURL, setImageURL] = useState();
  const [isalert, setAlert] = useState(false);
  const [load, setLoad] = useState(false);

  const onCopyText = () => {
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  useEffect(() => {
    setEditorText(editorText);
  }, [editorText]);

  const [authenticationModalType, setAuthneticationModalType] = useState("");
  const [authenticationModalOpen, setAuthenticationModalOpen] = useState(false);
  const router = useRouter();
  let token, linkedInAccessToken, authorId;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
    linkedInAccessToken = localStorage.getItem("linkedInAccessToken");
    authorId = localStorage.getItem("authorId");
  }
  const [
    UpdateBlog,
    { data: updateData, loading: updateLoading, error: updateError },
  ] = useMutation(updateBlog);

  const handleSave = async () => {
    var getToken;
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", (event) => {
        event.preventDefault();
        event.returnValue = null;
      });
      getToken = localStorage.getItem("token");
    }

    if (getToken) {
      setSaveLoad(true);

      console.log("token", getToken);

      const jsonDoc = htmlToJson(updatedText, imageURL).children;
      const formatedJSON = { children: [...jsonDoc] };
      UpdateBlog({
        variables: {
          options: {
            tinymce_json: formatedJSON,
            blog_id: blog_id,
            platform: option === "blog" ? "wordpress" : option,
            imageUrl: imageURL,
            imageSrc: imageURL ? null : imageURL,
          },
        },
        context: {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + getToken,
          },
        },
      })
        .then(() => {
          console.log(">>", window.location);
          if (window.location.pathname !== "/dashboard/" + blog_id)
            window.location.href = "/dashboard/" + blog_id;
          // router.push("/dashboard/" + blog_id);
        })
        .catch((err) => {
          //console.log(err);
        })
        .finally(() => {
          toast.success("Updated & Saved!!", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          setSaveLoad(false);
          setSaveText("Saved!");
        });
      setAuthenticationModalOpen(false);
    } else {
      setAuthneticationModalType("signup");
      setAuthenticationModalOpen(true);
    }
  };

  const [callBack, setCallBack] = useState();

  useEffect(() => {
    if (load) {
      const inputElement = document.getElementsByClassName("tox-textfield");
      inputElement[0].value = "Loading...";
    }
  }, [load]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setText(window.location.origin + "/public/");
    }
    if (typeof window !== "undefined") {
      let temp = `${window.location.origin}${router.pathname}`;
      if (temp.substring(temp.length - 1) == "/")
        setCallBack(temp.substring(0, temp.length - 1));
      else {
        setCallBack(window.location.origin + "/dashboard");
      }
    }
  }, []);

  const handleconnectLinkedin = () => {
    localStorage.setItem("loginProcess", true);
    localStorage.setItem("bid", blog_id);
    const redirectUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${callBack}&scope=r_liteprofile%20r_emailaddress%20w_member_social`;
    window.location = redirectUrl;
  };

  const handleSavePublish = () => {
    let getToken;
    if (typeof window !== "undefined") {
      getToken = localStorage.getItem("token");
    }
    if (getToken) {
      setPublishLoad(true);
      const jsonDoc = htmlToJson(updatedText).children;
      const formatedJSON = { children: [...jsonDoc] };

      // console.log("save and publish");
      axios({
        method: "post",
        url: "https://maverick.lille.ai/graphql",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + token,
        },
        data: {
          query:
            "mutation SavePreferences($options: PublisOptions) {\n  publish(options: $options)\n}",
          variables: {
            options: {
              blog_id: blog_id,
            },
          },
        },
      })
        .then((response) => {
          if (response?.data?.data?.publish) {
            toast.success("Published!!", {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });
            setOpenModal(true);
            setPublishLoad(false);
            setPublishText("Published!!");
          }
        })
        .catch((error) => console.log("error", error));
    }
  };

  const handlePublish = () => {
    const datafromapi = htmlToJson(editorText);
    const jsonData = datafromapi?.children[3]?.children[0];
    setPublishLinkLoad(true);
    console.log("req here", jsonData);

    const data = {
      token: linkedInAccessToken,
      author: `urn:li:person:${authorId}`,
      data: jsonData,
      blogId: blog_id,
    };

    axios
      .post("https://maverick.lille.ai/auth/linkedin/post", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        console.log(response.data);
        setPublishLinkLoad(false);
        setPublishLinkText("Published on Linkedin!!");
        toast.success("Published on Linkedin!!", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      })
      .catch((error) => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          toast.success(error.response.data, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          console.log(error.response.data); // log error response message
          console.log(error.response.status); // log error status code
        } else if (error.request) {
          // The request was made but no response was received
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log("Error", error.message);
        }
      });
  };

  function handleBlog(e) {
    setOption("blog");
    const siblingButton = document.querySelectorAll(".blog-toggle-button");
    siblingButton.forEach((el) => el.classList.remove("active"));
    const button = e.target;
    button.classList.add("active");

    // const aa = blogData?.publish_data[2].tiny_mce_data;
    const aa = blogData?.publish_data?.find(
      (pd) => pd.platform === "wordpress"
    ).tiny_mce_data;

    const htmlDoc = jsonToHtml(aa);

    setEditorText(htmlDoc);
  }
  function handleLinkedinBlog(e) {
    setOption("linkedin");
    const siblingButton = document.querySelectorAll(".blog-toggle-button");
    siblingButton.forEach((el) => el.classList.remove("active"));
    const button = e.target;
    button.classList.add("active");
    // const aa = blogData?.publish_data[0]?.tiny_mce_data;
    const aa = blogData?.publish_data?.find(
      (pd) => pd.platform === "linkedin"
    ).tiny_mce_data;
    const htmlDoc = jsonToHtml(aa);
    setEditorText(htmlDoc);
  }
  function handleTwitterBlog(e) {
    setOption("twitter");
    const siblingButton = document.querySelectorAll(".blog-toggle-button");
    siblingButton.forEach((el) => el.classList.remove("active"));
    const button = e.target;
    button.classList.add("active");
    // const aa = blogData?.publish_data[1]?.tiny_mce_data;
    const aa = blogData?.publish_data?.find(
      (pd) => pd.platform === "twitter"
    ).tiny_mce_data;
    const htmlDoc = jsonToHtml(aa);
    setEditorText(htmlDoc);
  }

  if (loading) return <LoaderPlane />;
  return (
    <>
      <ToastContainer />
      <Modal
        isOpen={openModal}
        onRequestClose={() => setOpenModal(false)}
        ariaHideApp={false}
        className="w-[100%] sm:w-[38%] max-h-[95%]"
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: "9999",
          },
          content: {
            position: "absolute",
            top: "50%",
            left: "50%",
            right: "auto",
            border: "none",
            background: "white",
            boxShadow: "0px 4px 20px rgba(170, 169, 184, 0.1)",
            borderRadius: "8px",
            // height: "75%",
            width: "80%",
            maxWidth: "580px",
            bottom: "",
            zIndex: "999",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            padding: "20px",
            paddingBottom: "0px",
          },
        }}
      >
        <div className="pl-4 text-xl font-bold">Share</div>
        <WhatsappShareButton
          url={text + blog_id}
          quote={""}
          hashtag={"#Lille"}
          description={"Lille"}
          className="Demo__some-network__share-button m-5"
        >
          <WhatsappIcon size={62} round /> Whatsapp
        </WhatsappShareButton>
        <FacebookShareButton
          url={text + blog_id}
          quote={""}
          hashtag={"#Lille"}
          description={"Lille"}
          className="Demo__some-network__share-button m-5"
        >
          <FacebookIcon size={62} round /> Facebook
        </FacebookShareButton>
        <TwitterShareButton
          url={text + blog_id}
          hashtags={["lille", "nowg"]}
          className="m-5"
        >
          <TwitterIcon size={62} round />
          Twitter
        </TwitterShareButton>
        <EmailShareButton
          url={text + blog_id}
          subject="Link for my Blog"
          className="Demo__some-network__share-button m-5"
        >
          <EmailIcon size={62} round /> Email
        </EmailShareButton>
        <TelegramShareButton
          url={text + blog_id}
          quote={""}
          hashtag={"#Lille"}
          description={"Lille"}
          className="Demo__some-network__share-button m-5"
        >
          <TelegramIcon size={62} round /> Telegram
        </TelegramShareButton>
        <div className="p-5 pl-2 flex">
          <input
            type="text"
            value={text + blog_id}
            className="w-[70%] h-[40px] mr-5"
          />
          <CopyToClipboard text={text + blog_id} onCopy={onCopyText}>
            <div className="copy-area">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
                Copy
              </button>
              <span className={`copy-feedback ${isCopied ? "active" : ""}`}>
                Copied!
              </span>
            </div>
          </CopyToClipboard>
        </div>
      </Modal>
      <AuthenticationModal
        type={authenticationModalType}
        setType={setAuthneticationModalType}
        modalIsOpen={authenticationModalOpen}
        setModalIsOpen={setAuthenticationModalOpen}
        handleSave={handleSave}
        bid={blog_id}
      />
      <div
        style={{
          paddingBottom: "0.5em",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        className="text-sm mx-2"
      >
        {isAuthenticated ? (
          <div
            style={{
              display: "flex",
              gap: "0.25em",
            }}
          >
            <div
              className="blog-toggle-button cta active wordpress flex gap-1 items-center"
              onClick={handleBlog}
            >
              <svg
                style={{ pointerEvents: "none" }}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 50 50"
                width="19px"
                height="19px"
              >
                <path d="M 30.398438 2 L 7 2 L 7 48 L 43 48 L 43 14.601563 Z M 15 28 L 31 28 L 31 30 L 15 30 Z M 35 36 L 15 36 L 15 34 L 35 34 Z M 35 24 L 15 24 L 15 22 L 35 22 Z M 30 15 L 30 4.398438 L 40.601563 15 Z" />
              </svg>
              Blog
            </div>
            <div
              className="blog-toggle-button cta linkedin flex gap-1 items-center"
              onClick={handleLinkedinBlog}
            >
              <svg
                style={{ pointerEvents: "none" }}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 50 50"
                width="20px"
                height="20px"
              >
                <path
                  fill="#0288D1"
                  d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z"
                />
                <path
                  fill="#FFF"
                  d="M12 19H17V36H12zM14.485 17h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501 0-2.313 1.012-2.707 1.99C24.957 25.543 25 26.511 25 27v9h-5V19h5v2.616C25.721 20.5 26.85 19 29.738 19c3.578 0 6.261 2.25 6.261 7.274L36 36 36 36z"
                />
              </svg>
              Linkedin
            </div>
            <div
              className="blog-toggle-button cta twitter flex gap-1 items-center"
              onClick={handleTwitterBlog}
            >
              <svg
                style={{ pointerEvents: "none" }}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 50 50"
                width="20px"
                height="20px"
              >
                <path
                  fill="#03A9F4"
                  d="M42,12.429c-1.323,0.586-2.746,0.977-4.247,1.162c1.526-0.906,2.7-2.351,3.251-4.058c-1.428,0.837-3.01,1.452-4.693,1.776C34.967,9.884,33.05,9,30.926,9c-4.08,0-7.387,3.278-7.387,7.32c0,0.572,0.067,1.129,0.193,1.67c-6.138-0.308-11.582-3.226-15.224-7.654c-0.64,1.082-1,2.349-1,3.686c0,2.541,1.301,4.778,3.285,6.096c-1.211-0.037-2.351-0.374-3.349-0.914c0,0.022,0,0.055,0,0.086c0,3.551,2.547,6.508,5.923,7.181c-0.617,0.169-1.269,0.263-1.941,0.263c-0.477,0-0.942-0.054-1.392-0.135c0.94,2.902,3.667,5.023,6.898,5.086c-2.528,1.96-5.712,3.134-9.174,3.134c-0.598,0-1.183-0.034-1.761-0.104C9.268,36.786,13.152,38,17.321,38c13.585,0,21.017-11.156,21.017-20.834c0-0.317-0.01-0.633-0.025-0.945C39.763,15.197,41.013,13.905,42,12.429"
                />
              </svg>
              Twitter
            </div>
          </div>
        ) : (
          <div style={{ display: "none" }}></div>
        )}
        {!isPublished ? (
          <div className="flex" style={{ gap: "0.25em", marginLeft: "auto" }}>
            <button
              className="cta"
              onClick={saveText === "Save Now!" && handleSave}
            >
              {saveLoad ? (
                <ReactLoading
                  width={25}
                  height={25}
                  round={true}
                  color={"#2563EB"}
                />
              ) : (
                saveText
              )}
            </button>
            {option === "linkedin" ? (
              linkedInAccessToken ? (
                <button
                  className="cta-invert"
                  onClick={
                    publishLinkText === "Publish on Linkedin" && handlePublish
                  }
                >
                  {publishLinkLoad ? (
                    <ReactLoading
                      width={25}
                      height={25}
                      round={true}
                      color={"#2563EB"}
                    />
                  ) : (
                    publishLinkText
                  )}
                </button>
              ) : (
                <button className="cta-invert" onClick={handleconnectLinkedin}>
                  Connect with Linkedin
                </button>
              )
            ) : option === "twitter" ? (
              <button className="cta-invert">Coming Soon...</button>
            ) : isAuthenticated ? (
              <button
                className="cta-invert"
                onClick={publishText === "Publish" && handleSavePublish}
              >
                {publishLoad ? (
                  <ReactLoading
                    width={25}
                    height={25}
                    round={true}
                    color={"#2563EB"}
                  />
                ) : (
                  publishText
                )}
              </button>
            ) : (
              <></>
            )}
          </div>
        ) : (
          <div className="flex" style={{ gap: "0.25em", marginLeft: "auto" }}>
            <button
              className="cta"
              onClick={saveText === "Save Now!" && handleSave}
            >
              {saveLoad ? (
                <ReactLoading
                  width={25}
                  height={25}
                  round={true}
                  color={"#2563EB"}
                />
              ) : (
                "Update"
              )}
            </button>
          </div>
        )}
      </div>
      {isalert && (
        <div className="p-2 text-xs">
          Lille is not responsible for any images which are uploaded by you
          which contains copyright infringement.
          <button
            onClick={() => {
              setAlert(false);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-6 ml-2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
      )}

      <Editor
        value={updatedText || editorText}
        apiKey="aas0t2r78qalxl9x1wl2byv0fchtnoh13dlufm5ez5annbr2"
        init={{
          setup: (editor) => {
            if (editor.inline) {
              registerPageMouseUp(editor, throttledStore);
            }
          },
          skin: "naked",
          icons: "small",
          toolbar_location: "bottom",
          plugins: "lists code table codesample link",
          menubar: false,
          statusbar: false,
          height: "82vh",
          images_upload_base_path: `https://pluarisazurestorage.blob.core.windows.net/nowigence-web-resources/blogs`,
          images_upload_credentials: true,
          plugins:
            "preview casechange importcss tinydrive searchreplace save directionality advcode visualblocks visualchars fullscreen image link media mediaembed template codesample table charmap pagebreak nonbreaking anchor tableofcontents insertdatetime advlist lists checklist wordcount a11ychecker editimage help formatpainter permanentpen pageembed charmap mentions linkchecker emoticons advtable export footnotes mergetags",
          menu: {
            tc: {
              title: "Comments",
              items: "addcomment showcomments deleteallconversations",
            },
          },
          toolbar:
            "undo redo image| bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist checklist | forecolor backcolor casechange permanentpen formatpainter removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media pageembed template link anchor codesample | a11ycheck ltr rtl | showcomments addcomment | footnotes | mergetags",
          image_title: true,
          automatic_uploads: true,
          file_picker_types: "image",
          file_picker_callback: function (cb, value, meta) {
            var input = document.createElement("input");
            input.setAttribute("type", "file");
            input.setAttribute("accept", "image/*");
            var url = `https://maverick.lille.ai/upload/image`;
            var xhr = new XMLHttpRequest();
            var fd = new FormData();
            xhr.open("POST", url, true);

            input.onchange = function () {
              var file = this.files[0];
              var reader = new FileReader();
              xhr.onload = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                  // File uploaded successfully
                  var response = JSON.parse(xhr.responseText);

                  // https://res.cloudinary.com/cloudName/image/upload/v1483481128/public_id.jpg
                  var url = response.url;
                  setImageURL(url);
                  setAlert(true);
                  console.log("response.data", response.data);
                  console.log("imageURL", imageURL);
                  console.log("88", url);
                  console.log("999", load);
                  setLoad(false);
                  // Create a thumbnail of the uploaded image, with 150px width
                  cb(url, { title: response.type });
                }
              };

              reader.onload = function () {
                setLoad(true);
                var id = "blobid" + new Date().getTime();
                var blobCache =
                  window.tinymce.activeEditor.editorUpload.blobCache;
                var base64 = reader.result.split(",")[1];

                var blobInfo = blobCache.create(id, file, base64);
                blobCache.add(blobInfo);

                // call the callback and populate the Title field with the file name

                // fd.append("upload_preset", unsignedUploadPreset);
                // fd.append("path", "browser_upload");
                fd.append("file", blobInfo.blob());

                xhr.send(fd);
              };

              reader.readAsDataURL(file);
            };

            input.click();
          },
          images_upload_handler: (blobInfo, success, failure) => {
            /*var formdata = new FormData();
            formdata.append("file", blobInfo.blob());

            var requestOptions = {
              method: "POST",
              body: formdata,
              redirect: "follow",
            };

            fetch("https://maverick.lille.ai/upload/image", requestOptions)
              // .then((response) => response.text())
              // .then((result) => {
              //   const data = JSON.parse(result);
              //   success(data.url);
              // })
              .catch((error) => console.log("error", error));*/

            console.log("Harsh test this block");

            const formdata = new FormData();
            formdata.append("file", blobInfo.blob());

            const config = {
              method: "post",
              url: "https://maverick.lille.ai/upload/image",
              data: formdata,
            };

            axios(config)
              .then((response) => {})
              .catch((error) => console.log("error", error));
          },
        }}
        onEditorChange={(content, editor) => {
          setEditorText(content);
          setSaveText("Save Now!");
          // console.log(updatedText);
        }}
      />
      <hr />
    </>
  );
}
