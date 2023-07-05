import React, { useEffect, useLayoutEffect, useState } from 'react'
import Router from "next/router";
import * as styles from './test.module.scss'
import axios from 'axios'
import {API_BASE_PATH} from '../../client/constants/apiEndpoints'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const Test = () => {
    const [prompt, setPrompt] = useState()
    const [result, setResult] = useState(null)
    const [unmodifiedResult, setUnmodifiedResult] = useState(null)
    const [loader, setLoader] = useState(null)
    useLayoutEffect(() => {
        const host = window.location.host
        console.log(host)
        if (host !== 'localhost:3000' && host !== 'maverick.lille.ai') {
            Router.push('/');
        }
    }, [])
    const handleSubmit = async () => {
        try {
            if(!prompt) {
                return toast.error("Provide prompt!")
            }
            setLoader(true)
            const response = await axios.post(`${API_BASE_PATH}/auth/prompt-test`, {
                prompt
            })
            if(response?.data) {
                setLoader(false)
                setUnmodifiedResult(response?.data?.data)
                const modifiedRes = response?.data?.data?.replace(/\n/gi, "<br/>")
                setResult(modifiedRes)
            }
        }catch(e){
            setLoader(false)
            toast.error(e.message)
            throw e
        }
    }
    return (
        <>
            <div className={styles.container}>
                {
                    loader && <div className={styles.loader}></div>
                }
                <h1 style={{color: "#6540D9", fontWeight: 700}}>Chat GPT Prompt Page</h1>

                <div className={styles.inputContainer}>
                    <textarea id="user-input" placeholder="Type your prompt..." rows="15" cols="90" value={prompt} onChange={(e) => setPrompt(e.target.value)} ></textarea>
                </div>
                <div className={styles.buttonContainer}>
                    <div className={styles.buttons}>
                        <button onClick={handleSubmit}>Submit</button>
                        <button onClick={() => {
                            setPrompt("")
                            setResult(null)
                        }}>Reset</button>
                    </div>
                </div>
                <br/>
                <br/>
                <hr></hr>
                <br/>
                <br/>
                <div id="chat-container">
                    <div style={{color: "#6540D9", fontWeight: 700}}>
                        Response From Chatgpt
                    </div>
                    <br/>
                    {true && <div className={styles.result} dangerouslySetInnerHTML={{__html: result}} />}
                </div>
                <div className={styles.buttonContainer}>
                    {
                        unmodifiedResult && result && 
                        <div className={styles.buttons}>
                            <button onClick={() => {
                                const textToCopy = unmodifiedResult;
                                const el = document.createElement("textarea")
                                document.body.appendChild(el)
                                el.value = textToCopy
                                el.select()
                                document.execCommand("copy")
                                document.body.removeChild(el)
                                toast.success("Copied Successfully")
                            }}>Copy</button>
                        </div>
                    }
                </div>
            </div>
        </>
    )
}

export default Test