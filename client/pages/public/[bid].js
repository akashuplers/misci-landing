import { concat, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { getBlogbyId } from "../../graphql/queries/getBlogbyId";
import styles from "../../styles/publish.module.css";
import LoaderPlane from "../../components/LoaderPlane";
import { jsonToHtml } from "../../helpers/helper";
import {sendAComment, sendLikeToBlog} from '../../helpers/apiMethodsHelpers';
import { ChatBubbleOvalLeftIcon, CheckCircleIcon, DocumentDuplicateIcon, HandThumbUpIcon, ShareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import TextareaAutosize from "react-textarea-autosize";
import ShareLinkModal from "../../components/component/ShareLinkModal";
import CopyToClipboard from "react-copy-to-clipboard";
import { toast } from "react-toastify";
import ReactModal from "react-modal";
import { useStore } from "zustand";
export default function Post() {
  const router = useRouter();
  const { bid } = router.query;
  const [data, setData] = useState("");
  const [showShareModal, setShareModal] = useState(false);
  const [text, setText] = useState("");
  const [callBack, setCallBack] = useState();
  const[showModalComment,setShowModalComment]=useState(false);
  const {
    data: gqlData,
    loading,
    error,
    refetch: blogRefetch,
  } = useQuery(getBlogbyId, {
    variables: {
      fetchBlogId: bid,
    },
  });

  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", function (event) {
      event.stopImmediatePropagation();
    });
  }
  
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
  const [copyStart, setCopyStart] = useState(false);

  useEffect(() => {
    // const html = jsonToHtml(gqlData?.fetchBlog?.publish_data[2].tiny_mce_data);
    
    const aa = gqlData?.fetchBlog?.publish_data.find(
      (pd) => pd.platform === "wordpress"
    ).tiny_mce_data;
    const html = jsonToHtml(aa);

    setData(html);
  }, [router, gqlData]);

  useEffect(() => {
    const publishContainer = document.getElementById("publishContainer");
    if (publishContainer != null) {
      const tempElement = document.createElement('div');
      tempElement.innerHTML = data;
      const nullElement = tempElement.querySelector('null[undefined]');
      if (nullElement) {
        const divElement = document.createElement('div');
        divElement.innerHTML = nullElement.innerHTML;
        nullElement.parentNode.replaceChild(divElement, nullElement);
      }
      var modifiedHtml = tempElement.innerHTML;
      console.log(modifiedHtml);
      const phraseToRemove = 'A placeholder image has been added, you can upload your own image.';
      const modifiedString = modifiedHtml.replace(new RegExp(`<span[^>]*>${phraseToRemove}</span>`, 'g'), '');
      console.log(modifiedString);
      publishContainer.innerHTML = modifiedString;
    }

  }, [data]);
  function handleLikeBlog(){
    sendLikeToBlog({
      blogId: gqlData.fetchBlog._id
    }).then((res)=>{
      if(res.type=='SUCCESS'){
        toast.success('Liked Successfully');
        blogRefetch();
      }else{
        toast.error('Error in liking');
      }
    })
  }

  if (loading) return <LoaderPlane />;
  return (
    <div className="bg-[#00000014] min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center max-w-[1056px] mx-auto flex-col ">
        <div className={styles.publishContainer} id="publishContainer"></div>
        <ShareLinkModal openModal={showShareModal} setOpenModal={setShareModal} blog_id={gqlData.fetchBlog._id} text={text} closeModal={() => setShareModal(false)} />
        <ReactModal
          isOpen={showModalComment}
          onRequestClose={() => setShowModalComment(false)}
          shouldCloseOnOverlayClick={true}
          style={{
            overlay: {
              backgroundColor: "rgba(0,0,0,0.1)",
              zIndex: "9998",
            },
            content: {
              position: "absolute",
              top: "65%",
              left: "50%",
              right: "auto",
              border: "none",
              borderRadius: '10px',
              background: "white",
              maxWidth: "1056px",
              width: '100%',
              bottom: "",
              zIndex: "999",
              marginRight: "-50%",
              padding: '0px',
              transform: "translate(-50%, -50%)",
            },
          }}>
          <CommentSection comments={gqlData.fetchBlog.comments} text={text} data={gqlData} setShowModalComment={setShowModalComment} blogRefetch={blogRefetch} setShareModal={setShareModal} />
        </ReactModal>
      </div>
      <div className="fixed bottom-0 pb-1 flex items-center bg-[#EBEBEB] left-0 w-full">
        <div className="border-y border-neutral-300 max-w-[1056px] mx-auto w-full  h-[80.18px] bg-[#EBEBEB] justify-center items-center gap-6 inline-flex">
          <div className="h-full justify-start items-center flex w-[75%]"> 
            <CommentButton icon={CommentButtonMap.like.icon} text={ gqlData.fetchBlog.likes + " " +CommentButtonMap.like.text} onClick={handleLikeBlog}/>
            <CommentButton icon={CommentButtonMap.comment.icon} text={CommentButtonMap.comment.text}
            onClick={
              ()=> setShowModalComment(true)
            }
            />

          </div>
          <div className="justify-end items-center flex w-[25%]">
            <CopyToClipboard text={text + gqlData.fetchBlog._id} onCopy={() => {
              setCopyStart(true);
              setTimeout(() => {
                setCopyStart(false);
              }
                , 2000);

            }}>
              <CommentButton icon={
                copyStart ? CommentButtonMap.check.icon : CommentButtonMap.link.icon
              } text={CommentButtonMap.link.text} />
            </CopyToClipboard>
            <CommentButton icon={CommentButtonMap.share.icon} text={CommentButtonMap.share.text} onClick={
              () => {
                setShareModal(true);
              }
            } />
          </div>
        </div>
      </div>
    </div>
  );
}
var CommentButtonMap = {
  like: {
    icon: <svg xmlns="http://www.w3.org/2000/svg" height={16} width={16}  viewBox="0 0 512 512"> <path d="M320 96c8.844 0 16-7.156 16-16v-64C336 7.156 328.8 0 320 0s-16 7.156-16 16v64C304 88.84 311.2 96 320 96zM383.4 96c5.125 0 10.16-2.453 13.25-7.016l32.56-48c1.854-2.746 2.744-5.865 2.744-8.951c0-8.947-7.273-16.04-15.97-16.04c-5.125 0-10.17 2.465-13.27 7.02l-32.56 48C368.3 73.76 367.4 76.88 367.4 79.97C367.4 88.88 374.7 96 383.4 96zM384 357.5l0-163.9c0-6.016-4.672-33.69-32-33.69c-17.69 0-32.07 14.33-32.07 31.1L320 268.1L169.2 117.3C164.5 112.6 158.3 110.3 152.2 110.3c-13.71 0-24 11.21-24 24c0 6.141 2.344 12.28 7.031 16.97l89.3 89.3C227.4 243.4 228.9 247.2 228.9 251c0 3.8-1.45 7.6-4.349 10.5c-2.899 2.899-6.7 4.349-10.5 4.349c-3.8 0-7.6-1.45-10.5-4.349l-107.6-107.6C91.22 149.2 85.08 146.9 78.94 146.9c-13.71 0-24 11.21-24 24c0 6.141 2.344 12.28 7.031 16.97l107.6 107.6C172.5 298.4 173.9 302.2 173.9 305.1c0 3.8-1.45 7.6-4.349 10.5c-2.899 2.9-6.7 4.349-10.5 4.349c-3.8 0-7.6-1.45-10.5-4.349L59.28 227.2C54.59 222.5 48.45 220.1 42.31 220.1c-13.71 0-24 11.21-24 24c0 6.141 2.344 12.28 7.031 16.97l89.3 89.3c2.9 2.899 4.349 6.7 4.349 10.5c0 3.8-1.45 7.6-4.349 10.5c-2.899 2.899-6.7 4.349-10.5 4.349c-3.8 0-7.6-1.45-10.5-4.349L40.97 318.7C36.28 314 30.14 311.7 24 311.7c-13.71 0-23.99 11.26-23.99 24.05c0 6.141 2.332 12.23 7.02 16.92C112.6 458.2 151.3 512 232.3 512C318.1 512 384 440.9 384 357.5zM243.3 88.98C246.4 93.55 251.4 96 256.6 96c8.762 0 15.99-7.117 15.99-16.03c0-3.088-.8906-6.205-2.744-8.951l-32.56-48C234.2 18.46 229.1 15.98 223.1 15.98c-8.664 0-15.98 7.074-15.98 16.05c0 3.086 .8906 6.205 2.744 8.951L243.3 88.98zM480 160c-17.69 0-32 14.33-32 32v76.14l-32-32v121.4c0 94.01-63.31 141.5-78.32 152.2C345.1 510.9 352.6 512 360.3 512C446.1 512 512 440.9 512 357.5l-.0625-165.6C511.9 174.3 497.7 160 480 160z" /></svg>,
    text: "Like"
  },
    comment: {
      icon: <ChatBubbleOvalLeftIcon  className="w-4 h-4 relative" />,
      text: "Comment"
    },
    link: {
      icon:<DocumentDuplicateIcon className="w-4 h-4 relative" />,
      text: "Copy Link"
    },
    share:{
      icon: <ShareIcon className="w-4 h-4 relative" />,
      text: "Share"
    },
    check: {
      icon: <CheckCircleIcon className="w-4 h-4 relative" />,
      text: 'Check'
    }
}

const CommentButton = ({
  icon, text, onClick
}) => {
  return (
    <button onClick={
      onClick ? onClick : () => { }
    } className="min-w-8 h-8 p-3 rounded-2xl justify-end items-center gap-2 inline-flex hover:bg-gray-100">
      {icon}
      <div className="text-black text-base font-normal">{text}</div>
    </button>

  )
}
const typesOfTabForComments = {newest: "Newest", oldest: "Oldest"}
const CommentSection = ({data,comments,  setShowModalComment,setShareModal, blogRefetch, text}) => {
  const [commmentValue, setCommentValue] = useState("");
  const [dataForComment, setDataForComment] = useState(comments.slice().reverse());
  const [tabToShow, setTabToShow] = useState(typesOfTabForComments.newest);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  // const isAuthenticated = useStore((state) => state.isAuthenticated);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if(typeof window !== "undefined"){
      setIsAuthenticated(localStorage.getItem("token") ? true : false);
    }
  }, []);

  useEffect(() => {
    // setDataForComment(comments.slice().reverse());
    if(tabToShow == typesOfTabForComments.newest){
      setDataForComment(comments.slice().reverse());
    }
    if(tabToShow == typesOfTabForComments.oldest){
      setDataForComment(comments.slice());
    }
    
  }),[data]
  const [errors, setErrors] = useState({
    name: {
      status: false,
      message: ""
    },
    email: {
      status: false,
      message: ""
    }
  });
  function handleCommentSend(){
    // verify 
    if(!commmentValue  || commmentValue.trim() == ""){
      toast.warn("Please write a comment");  
      return;
    }
    if(!isAuthenticated){
      if(!name || name.trim() == ""){
        setErrors({
          ...errors,
          name: {
            status: true,
            message: "Please enter your name"
          }
        });
        toast.warn("Please enter your name");
        return;
      }
      if(!email || email.trim() == ""){
        setErrors({
          ...errors,
          email: {
            status: true,
            message: "Please enter your email"
          }
        });
        toast.warn("Please enter your email");
        return;
      }

    }
    sendAComment({
      text: commmentValue,
      blogId: data.fetchBlog._id,
      email: data.fetchBlog.userDetail.email
    }).then(
      (res) => {
        console.log(res);
        if(res.type){
          if(res.type == "SUCCESS"){
            toast.success(res.message);
            blogRefetch();
          }else{
            toast.error(res.message);
          }
        }
        setCommentValue("");
      }
    )
  }
  function handleTabChange(tab){
    setTabToShow(tab);
    if(tab == typesOfTabForComments.newest){
      setDataForComment(comments.slice().reverse());
    }else if(tab == typesOfTabForComments.oldest){
      setDataForComment(comments);
    }
  }
  return <div className="w-full border h-full p-5 rounded-lg bg-white ">
    <div>
    <div className="text-slate-800 relative text-lg font-bold grid grid-cols-2 ">
    <h1 className="text-slate-800 text-lg font-bold">
          Write a comment 
      </h1>
      {/* cross btn */}
      <h2>
        Other Reviews ({data.fetchBlog.comments.length})
      </h2>
      <button  onClick={
        ()=> setShowModalComment(false)
      } className="focus:outline-none absolute top-0 right-0">
        <XMarkIcon className="w-5 h-5 text-slate-800" />
      </button>
    </div>
    </div>
    {/*  */}
    <div className="grid grid-cols-2 gap-4 h-full mt-8 max-h-[600px]">
      {/* Left side for comments */}
      <div className="h-full">
        
      <div className="w-full bg-white rounded-lg flex-col justify-start items-start gap-[15px] inline-flex">
          <div className="justify-start items-center gap-2 inline-flex">
            <img className="w-10 h-10 rounded-full" src={data.fetchBlog.userDetail.profileImage ?data.fetchBlog.userDetail.profileImage :"https://via.placeholder.com/40x40" }/>
            <div className="text-black text-lg font-bold">{data.fetchBlog.userDetail.name + " "+ data.fetchBlog.userDetail.lastName}</div>
          </div>
          {
            !isAuthenticated && <>
              <InputBox label={'Full Name'} name={'name'} value={name} onChange={(e) => setName(e.target.value)} error={
                errors.name.status
              } />
              <InputBox label={'Email'} name={'email'} value={email} onChange={(e) => setEmail(e.target.value)} error={
                errors.email.status
              } /></>
          }
          <h4 className="text-black text-base font-normal">{'Write a review'}</h4>
          <TextareaAutosize
             maxRows={5}
             value={commmentValue}
              onChange={(e) => setCommentValue(e.target.value)}
             minRows={3}
            className="w-full h-10 p-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-slate-500 hover:shadow"
            placeholder="Write a comment..."
          />
          <div className="self-stretch justify-start items-center gap-2 inline-flex">
            <div className="grow shrink basis-0 h-5 justify-start items-start gap-3 flex">
              <div className="w-5 h-5 relative" />
              <div className="w-5 h-5 relative" />
              <div className="w-5 h-5 relative" />
            </div>
            <button className="px-5 py-2 rounded-lg justify-start items-start gap-2 flex"
            onClick={
              () => setCommentValue("")
            }
            >
              <span className="text-slate-600 text-base font-normal leading-7">Cancel</span>
            </button>
            <button className="px-[18px] py-1.5 bg-indigo-600 rounded-lg justify-start items-start gap-2 flex" onClick={handleCommentSend}>
              <span className="text-white text-base font-bold leading-7">Comment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right side for other comments */}
      <div className="flex flex-col gap-2 h-full  overflow-y-scroll max-h-[300px]">
        <div className="w-[132px] h-9 p-1.5 bg-white rounded-lg border border-gray-300 justify-start items-center gap-1 inline-flex">
          <button  onClick={
            ()=> handleTabChange(typesOfTabForComments.newest)
          } className={`px-2.5 py-[3px]  rounded justify-center items-center gap-2.5 transition-colors  flex ${
            tabToShow == typesOfTabForComments.newest ? "bg-indigo-600 bg-opacity-10 text-indigo-600" : "text-gray-900"
           }`}>
            <span className="text-xs font-medium leading-[18px]">Newest</span>
          </button>
          <button onClick={
            ()=> handleTabChange(typesOfTabForComments.oldest)
          }  className={`px-2.5 py-[3px] rounded justify-center transition-colors items-center gap-2.5 flex 
          ${
            tabToShow == typesOfTabForComments.oldest ? "bg-indigo-600 bg-opacity-10 text-indigo-600" : "text-gray-900"
           }
          `}>
            <span className=" text-xs font-normal leading-[18px]">Oldest</span>
          </button>
        </div>
       {
        dataForComment && dataForComment.map((comment) => {
          return <UserComment key={comment?.userId+comment?.text} name={comment?.name} comment={comment?.text} date={comment?.date} avatar={comment?.avatar} userId={comment?.userId} />
        } )
       }
        {/* Add your other comments component(s) here */}
        {/* Example: <OtherCommentList /> */}
      </div>
    </div>
   
  </div>
}
const UserComment = ({name, comment, date, avatar, userId}) => {
  const STATIC_AVATAR = 'https://via.placeholder.com/40x40';

  return <div className="w-full p-5 bg-white rounded-lg border border-neutral-200 flex-col justify-start items-start gap-[15px] inline-flex">
    <div className="justify-start items-center gap-2 inline-flex">
      <img className="w-10 h-10 rounded-full" src={avatar || STATIC_AVATAR} />
      <div className="text-black text-lg font-bold">{name}</div>
    </div>
    {/* <div className="self-stretch opacity-70 text-black text-sm font-normal leading-[21px]">I just tried this recipe and it was amazing! The instructions were clear and easy to follow, and the end result was delicious. I will definitely be making this again. Thanks for sharing!</div> */}
    <p
      className="w-full h-10 p-2 rounded-lg"
    >
      {
        comment
      }
    </p>
  </div>
}


const InputBox = ({
  label,
  placeholder,
  type,
  value,
  onChange,
  error,
  onBlur,
  name,
  touched,
  className,
}) => {
  return <div className="w-full h-full flex-col justify-start items-start gap-1 inline-flex">
    <div className="text-black text-sm font-normal">
      {label}
    </div>
    <div className={`w-full h-11 bg-white rounded-lg border border-neutral-200 flex-col justify-center items-start gap-[15px] flex ${
      error ? 'border-red-500' : ''
    }`}>
      {/* <div className="opacity-50 text-black text-sm font-normal">e.g. Kiran Singla</div> */}
      <input className="w-full h-full p-2 rounded-lg" placeholder={placeholder} type={type} value={value} onChange={onChange} onBlur={onBlur} name={name} />
    </div>
  </div>
}