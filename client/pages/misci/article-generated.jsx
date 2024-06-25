import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable';
import { toast } from "react-toastify";
import { RESEARCH_API } from "../../constants";
import { FaTrash } from "react-icons/fa/index";

const defaultArticleObj = {
    error: false,
    data: {
        "entities": {
            "How": [],
            "What": [
                "600 sixes in international cricket",
                "4000-run mark in T20Is",
                "1000 T20 World Cup runs",
                "4000 runs across all three formats",
                "8 wickets victory"
            ],
            "When": [],
            "Where": [
                "Nassau Stadium in New York"
            ],
            "Who": [
                "Rohit Sharma",
                "Virat Kohli",
                "Babar Azam",
                "Mahela Jayawardene"
            ],
            "Whom": [],
            "Why": []
        },
        "image_source": "https://example.com/image.jpg",
        "img_url": "https://static.toiimg.com/thumb/msid-110745092,width-1280,height-720,resizemode-4/110745092.jpg",
        "questions": [
            "What record did Rohit Sharma break in this match?",
            "How many sixes did Rohit Sharma hit in international cricket?",
            "Who are the other two batters to score 4000 runs in T20Is?",
            "Where was the match between India and Ireland played?"
        ],
        "subtopics": [
            {
                "points": [
                    "Rohit Sharma becomes the first batter to hit 600 sixes in international cricket",
                    "He crosses the 4000-run mark in T20Is",
                    "Rohit achieves 1000 T20 World Cup runs",
                    "He joins the list of players to score 4000 runs across all three formats"
                ],
                "subtopic": "Rohit Sharma's Milestones"
            },
            {
                "points": [
                    "Rohit hits three sixes against Ireland bowlers",
                    "He scores a superb 52 runs",
                    "Rohit retires hurt in the 11th over"
                ],
                "subtopic": "Rohit Sharma's Performance against Ireland"
            },
            {
                "points": [
                    "India wins the match against Ireland by 8 wickets",
                    "The match was played at Nassau Stadium in New York",
                    "India's next match is against archrivals Pakistan on June 9"
                ],
                "subtopic": "India's Victory in the Tournament Opener"
            }
        ],
        "title": "Rohit Sharma's Record-breaking Performance"
    }
};

function ArticleGenerated() {
   const [articleObj, setArticleObj] = useState(defaultArticleObj);
   const [selectedOptions, setSelectedOptions] = useState({});
   const [selectedEntities, setSelectedEntities] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
   const [relationships, setrelationships] = useState(null);
   const [options, setOptions] = useState({
    "How": [],
    "What": [],
    "When": [],
    "Where": [],
    "Who": [],
    "Whom": [],
    "Why": [],
    "purpose": null,
    "domain": null,
    "relationship": null,
   });
   const router = useRouter();
   
   useEffect(() => {
    setIsLoading(true);
    const apiResponseData = JSON.parse(localStorage.getItem('apiResponseData'));
    if(apiResponseData) {
        setArticleObj(apiResponseData);
        apiResponseData?.entities && 
        Object.keys(apiResponseData?.entities).forEach((key) => {
            const array = apiResponseData?.entities[key]?.length && apiResponseData?.entities[key]?.map((data) => ({
                value: data,
                label: data,
            }))
            setOptions((prevOptions) => ({
                ...prevOptions,
                [key] : array || array.length ? array : []
            }))
        })
    } else {
        setArticleObj(defaultArticleObj?.data);
        apiResponseData()
    }
    setIsLoading(false);
   }, []);

   useLayoutEffect(() => {
    const fetchRelationships = async () => {
        console.log(RESEARCH_API, "RESEARCH_API")
        try {
            const response = await axios.get(`${RESEARCH_API}relations/list`); // Wait for api response
            const { data } = response?.data; // Destructure response data
            if(data?.length) {
                const value = data.map((d) => ({
                    value: d._id,
                    label: d.name
                }))
                setrelationships(value)
            }
        }catch(e){

        }
    }
    fetchRelationships()
   }, [])


    const customStyles = {
        option: provided => ({
          ...provided,
          color: 'black'
        }),
        control: provided => ({
          ...provided,
          color: 'black'
        }),
        singleValue: provided => ({
          ...provided,
          color: 'black'
        })
    }

    const handleSelect = (data, type) => {
        const entitiesSelectedCount = Object.keys(selectedOptions)
        if(!Object.keys(data)?.length) {
            const selected = selectedOptions
            const filtered = Object.keys(selected).findIndex((key) => key === type)
        }else{
            if(entitiesSelectedCount?.length >= 2 && Object.keys(data)?.length && !Object.keys(selectedOptions).includes(type)) {
                return toast.error('Only Two entiites can be selected')
            }
            setSelectedOptions((prevOptions) => ({
                ...prevOptions,
                [type]: data 
            }))
        }
    }
    const handleSelectionEntities = () => {        
        let updatedArr = [...selectedEntities]
        updatedArr.push(selectedOptions)
        setSelectedEntities(updatedArr)
        setSelectedOptions({})
    }

    const handleInputs = (d, index, type) => {
        const array = selectedEntities?.length && selectedEntities?.map((data, i) => {
            if(i === index) {
                return {
                    ...data,
                    [type]: d
                }
            }else {
                return {
                    ...data
                }
            }
        })
        setSelectedEntities(array)
    }

    const handleSave = async () => {
        try {
            let finalPayload = []
            let missingEntities = []
            let wrongDomains = []
            selectedEntities.forEach((entity) => {
                const entitiesPayload = Object.assign({}, entity);
                const purpose = entitiesPayload.purpose
                const domain = entitiesPayload.domain
                const relationship = entitiesPayload.relationship
                if(Object.keys(entity)?.length < 2) {
                    missingEntities.push(entity)
                }
                // const regex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/
                // if(!entity.domain  ||  (entity.domain && !regex.test(entity.domain))) {
                //     wrongDomains.push("Wrong Domain Provided!")
                // }
                const filteredObj = Object.keys(entity).filter((key) => !['purpose', 'domain', 'relationship'].includes(key))
                let filteredEntities = {}
                filteredObj.forEach((key) => {
                    let arr = []
                    entity[key]?.forEach((value) => arr.push(value.value))
                    filteredEntities = {
                        ...filteredEntities,
                        [key]: arr
                    }
                })
                finalPayload.push({
                    entities: filteredEntities,
                    "relation": relationship,
                    "purpose": purpose,
                    "domain": domain,
                })
            })
            if(missingEntities && missingEntities.length) {
                return toast.error('Please select atleast 2 entities!')
            }else if(wrongDomains?.length) {
                return toast.error('Please provide correct domain!')
            }else{
                const response = await axios.post(`${RESEARCH_API}relations/entities-relations`, {
                    entities: finalPayload
                }); // Wait for api response
                const data = response?.data; // Destructure response data
                if(data) {
                    toast.success("Relationships added!");
                    setSelectedEntities([])
                    setOptions({
                        "How": [],
                        "What": [],
                        "When": [],
                        "Where": [],
                        "Who": [],
                        "Whom": [],
                        "Why": [],
                        "purpose": null,
                        "domain": null,
                        "relationship": null,
                    })
                }
            }
        }catch(e){

        }
    }

    const handleCreateOption = async (d) => {
        try {
            const response = await axios.post(`${RESEARCH_API}relations/add`, {
                relation: d
            }); // Wait for api response
            const { data } = response?.data; // Destructure response data
            if(data) {
                const response = await axios.get(`${RESEARCH_API}relations/list`); // Wait for api response
                const { data } = response?.data; // Destructure response data
                if(data?.length) {
                    const value = data.map((d) => ({
                        value: d._id,
                        label: d.name
                    }))
                    setrelationships(value)
                }
            }
        }catch(e){

        }
    }

    const handleDelete = (index) => {
        const arr = selectedEntities.filter((d,i) => i !== index)
        setSelectedEntities(arr)
    }

    const handleCreateWs = (e, type) => {
        const optionsArr = options
        optionsArr[type].push({
            value: e,
            label: e
        })
        setOptions(optionsArr)
    }
    console.log(selectedEntities, "selectedEntities akash")
  return (
    <div className='h-screen overflow-y-auto bg-yellow-50'>
        {isLoading ?
            <p className='text-center mt-10'>Loading...</p>
        :
        <div>
            {/* head */}
            <div className="items-center mt-5">
                {/* heading text */}
                <div className="w-screen text-center">
                    <h1 className="text-2xl md:text-4xl italic uppercase font-bold mb-4">
                        {articleObj?.title}
                    </h1>
                </div>
            </div>
            
            {/* body */}
            {articleObj?.img_url ?
                // body with image
                <div className='md:grid md:grid-cols-5 flex flex-col md:gap-8 lg:gap-12 gap-6 px-7 mb-[6rem] md:mb-[3rem]'>
                    {/* food image */}
                    <div className='md:col-start-1 md:col-end-2 pl-[3rem] pr-[3rem] md:pl-0 md:pr-0'>
                        <img
                            src={articleObj?.img_url}
                            alt='article-image'
                            className='h-[10rem] xl:h-[35rem] lg:h-[27rem] md:h-[18rem] md:w-[30rem]'
                        />
                    </div>
            
                    {/* food notes */}
                    <div className='md:col-start-2 md:col-end-6 text-justify'>

                        {/* extracted entities */}
                        <p className='text-xl font-bold mb-2'>Extracted Entities :</p>

                        {/* <p className='mb-2'>{JSON.stringify(articleObj?.entities)}</p> */}

                        <div className='entities-relationship-container'>
                            <div className='entities-relationship-div'>
                                <label>
                                    How
                                    <CreatableSelect options={options.How} className='entities-dropdown' 
                                    onCreateOption={e => handleCreateWs(e, "How")}
                                    autosize={true} 
                                    styles={customStyles}
                                    isMulti={true}
                                    isClearable={true}
                                    onChange={(e) => handleSelect(e, "How")}
                                    />
                                </label>
                                <label>
                                    What
                                    <CreatableSelect 
                                    onCreateOption={e => handleCreateWs(e, "What")}
                                    options={options.What} className='entities-dropdown' autosize={true} 
                                    styles={customStyles}
                                    isMulti={true}
                                    isClearable={true}
                                    onChange={(e) => handleSelect(e, "What")}
                                    />
                                </label>
                                <label>
                                    Where
                                    <CreatableSelect 
                                    onCreateOption={e => handleCreateWs(e, "Where")}
                                    options={options.Where} isClearable={true} isMulti={true} className='entities-dropdown' autosize={true} styles={customStyles} onChange={(e) => handleSelect(e, "Where")} />
                                </label>
                            </div>
                            <div className='entities-relationship-div'>
                                <label>
                                    Who
                                    <CreatableSelect 
                                    onCreateOption={e => handleCreateWs(e, "Who")}
                                    options={options.Who} isMulti={true} className='entities-dropdown' autosize={true} styles={customStyles} onChange={(e) => handleSelect(e, "Who")} />
                                </label>
                                <label>
                                    Whom
                                    <CreatableSelect 
                                    onCreateOption={e => handleCreateWs(e)}
                                    options={options.Whom} isMulti={true} className='entities-dropdown' autosize={true} styles={customStyles} onChange={(e) => handleSelect(e, "Whom")} />
                                </label>
                                <label>
                                    Why
                                    <CreatableSelect 
                                    onCreateOption={e => handleCreateWs(e, "Why")}
                                    options={options.Why} isMulti={true} className='entities-dropdown' autosize={true} styles={customStyles} onChange={(e) => handleSelect(e, "Why")} />
                                </label>
                            </div>
                        </div>

                        <div className='entities-relationship-div'>
                            <a href='#' className="button" onClick={() => handleSelectionEntities()}>
                                Select Entities
                            </a>
                        </div>

                        {
                            Object.keys(selectedEntities)?.length ? 
                            <div className='entities-relationship-container table-container'>
                                <table>
                                    <tr>
                                        <th>How</th>
                                        <th>What</th>
                                        <th>When</th>
                                        <th>Where</th>
                                        <th>Who</th>
                                        <th>Whom</th>
                                        <th>Why</th>
                                        <th>Purpose</th>
                                        <th>Domain</th>
                                        <th>Relationship</th>
                                    </tr>
                                    {
                                        selectedEntities?.length && selectedEntities.map((elem, index) => {
                                            return (
                                                <tr key={index}>
                                                    {
                                                        Object.keys(options)?.map((optionKey, i) => {
                                                            if(['purpose', 'domain', 'relationship'].includes(optionKey)) {
                                                                if(optionKey === 'relationship') {
                                                                    return (
                                                                        <td style={{width: "40%"}} key={i}>
                                                                            <CreatableSelect 
                                                                                // options={colourOptions} 
                                                                                options={relationships}
                                                                                styles={customStyles}
                                                                                onCreateOption={e => handleCreateOption(e)}
                                                                                onChange={e => handleInputs(e.value, index, 'relationship')}
                                                                            />
                                                                        </td>
                                                                    )
                                                                }else if(optionKey === 'domain'){
                                                                    return (
                                                                        <td style={{width: "40%"}} key={i}>
                                                                            <input type="text" value={selectedEntities[index][optionKey]} onChange={(e) => handleInputs(e.target.value, index, "domain")}/>
                                                                        </td>
                                                                    )
                                                                }else{
                                                                    return (
                                                                        <td style={{width: "40%"}} key={i}>
                                                                            <input type="text" value={selectedEntities[index][optionKey]} onChange={(e) => handleInputs(e.target.value, index, "purpose")}/>
                                                                        </td>
                                                                    )
                                                                }
                                                            }else{
                                                                let values = []
                                                                selectedEntities[index][optionKey]?.length && selectedEntities[index][optionKey]?.map((d) => values.push(d.value))
                                                                return (
                                                                    <td style={{
                                                                        width: "40%"
                                                                    }} key={i}>
                                                                        {values.join(", ")}
                                                                    </td>
                                                                )
                                                            }
                                                        })
                                                    }
                                                    <td>
                                                        <a href='#' onClick={() => handleDelete(index)}> 
                                                            <FaTrash />
                                                        </a>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                </table>
                                <br/>
                                <div className='save-button-container'>
                                    <a href='#' className="button" onClick={() => handleSave()}> Save </a>
                                </div>
                            </div>
                        :
                        <></>
                        }

                        {/* rest of the notes */}
                        <div className='md:col-start-2 md:col-end-6 text-justify'>
                            {articleObj?.subtopics?.map((item, index) => (
                                <div key={index}>
                                    <p className='text-xl font-bold mb-2'>{item?.subtopic + ' :'}</p>
                                    <ul className='mb-3'>
                                        {item?.points?.map((ele, index) => (
                                            <li key={index}>
                                                <p>{ele}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}

                            {/* related questions */}
                            <div>
                                <p className='text-xl font-bold mb-2 mt-2'>Related Questions :</p>
                                <ul className='list-decimal'>
                                    {articleObj?.questions?.map((item, index) => (
                                        <li key={index}>
                                            <p>{item}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            :
                // body without image
                <div className='px-10 mb-[6rem] md:mb-[3rem]'>
                    {/* food notes */}
                    <div className='md:col-start-2 md:col-end-6 text-justify'>

                        {/* extracted entities */}
                        <p className='text-xl font-bold mb-2'>Extracted Entities :</p>
                        <p className='mb-2'>{JSON.stringify(articleObj?.entities)}</p>

                        <div className='entities-relationship-container'>
                            <div className='entities-relationship-div'>
                                <label>
                                    How
                                    <CreatableSelect options={options.How} className='entities-dropdown' 
                                    onCreateOption={e => handleCreateWs(e, "How")}
                                    autosize={true} 
                                    styles={customStyles}
                                    isMulti={true}
                                    isClearable={true}
                                    onChange={(e) => handleSelect(e, "How")}
                                    />
                                </label>
                                <label>
                                    What
                                    <CreatableSelect 
                                    onCreateOption={e => handleCreateWs(e, "What")}
                                    options={options.What} className='entities-dropdown' autosize={true} 
                                    styles={customStyles}
                                    isMulti={true}
                                    isClearable={true}
                                    onChange={(e) => handleSelect(e, "What")}
                                    />
                                </label>
                                <label>
                                    Where
                                    <CreatableSelect 
                                    onCreateOption={e => handleCreateWs(e, "Where")}
                                    options={options.Where} isClearable={true} isMulti={true} className='entities-dropdown' autosize={true} styles={customStyles} onChange={(e) => handleSelect(e, "Where")} />
                                </label>
                            </div>
                            <div className='entities-relationship-div'>
                                <label>
                                    Who
                                    <CreatableSelect 
                                    onCreateOption={e => handleCreateWs(e, "Who")}
                                    options={options.Who} isMulti={true} className='entities-dropdown' autosize={true} styles={customStyles} onChange={(e) => handleSelect(e, "Who")} />
                                </label>
                                <label>
                                    Whom
                                    <CreatableSelect 
                                    onCreateOption={e => handleCreateWs(e)}
                                    options={options.Whom} isMulti={true} className='entities-dropdown' autosize={true} styles={customStyles} onChange={(e) => handleSelect(e, "Whom")} />
                                </label>
                                <label>
                                    Why
                                    <CreatableSelect 
                                    onCreateOption={e => handleCreateWs(e, "Why")}
                                    options={options.Why} isMulti={true} className='entities-dropdown' autosize={true} styles={customStyles} onChange={(e) => handleSelect(e, "Why")} />
                                </label>
                            </div>
                        </div>

                        <div className='entities-relationship-div'>
                            <a href='#' className="button" onClick={() => handleSelectionEntities()}>
                                Select Entities
                            </a>
                        </div>

                        {
                            Object.keys(selectedEntities)?.length ? 
                            <div className='entities-relationship-container table-container'>
                                <table>
                                    <tr>
                                        <th>How</th>
                                        <th>What</th>
                                        <th>When</th>
                                        <th>Where</th>
                                        <th>Who</th>
                                        <th>Whom</th>
                                        <th>Why</th>
                                        <th>Purpose</th>
                                        <th>Domain</th>
                                        <th>Relationship</th>
                                    </tr>
                                    {
                                        selectedEntities?.length && selectedEntities.map((elem, index) => {
                                            return (
                                                <tr key={index}>
                                                    {
                                                        Object.keys(options)?.map((optionKey, i) => {
                                                            if(['purpose', 'domain', 'relationship'].includes(optionKey)) {
                                                                if(optionKey === 'relationship') {
                                                                    return (
                                                                        <td style={{width: "40%"}} key={i}>
                                                                            <CreatableSelect 
                                                                                // options={colourOptions} 
                                                                                options={relationships}
                                                                                styles={customStyles}
                                                                                onCreateOption={e => handleCreateOption(e)}
                                                                                onChange={e => handleInputs(e.value, index, 'relationship')}
                                                                            />
                                                                        </td>
                                                                    )
                                                                }else if(optionKey === 'domain'){
                                                                    return (
                                                                        <td style={{width: "40%"}} key={i}>
                                                                            <input type="text" value={selectedEntities[index][optionKey]} onChange={(e) => handleInputs(e.target.value, index, "domain")}/>
                                                                        </td>
                                                                    )
                                                                }else{
                                                                    return (
                                                                        <td style={{width: "40%"}} key={i}>
                                                                            <input type="text" value={selectedEntities[index][optionKey]} onChange={(e) => handleInputs(e.target.value, index, "purpose")}/>
                                                                        </td>
                                                                    )
                                                                }
                                                            }else{
                                                                let values = []
                                                                selectedEntities[index][optionKey]?.length && selectedEntities[index][optionKey]?.map((d) => values.push(d.value))
                                                                return (
                                                                    <td style={{
                                                                        width: "40%"
                                                                    }} key={i}>
                                                                        {values.join(", ")}
                                                                    </td>
                                                                )
                                                            }
                                                        })
                                                    }
                                                    <td>
                                                        <a href='#' onClick={() => handleDelete(index)}> 
                                                            <FaTrash />
                                                        </a>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                </table>
                                <br/>
                                <div className='save-button-container'>
                                    <a href='#' className="button" onClick={() => handleSave()}> Save </a>
                                </div>
                            </div>
                        :
                        <></>
                        }

                        {/* rest of the notes */}
                        <div className='md:col-start-2 md:col-end-6 text-justify'>
                            {articleObj?.subtopics?.map((item, index) => (
                                <div key={index}>
                                    <p className='text-xl font-bold mb-2'>{item?.subtopic + ' :'}</p>
                                    <ul className='mb-3'>
                                        {item?.points?.map((ele, index) => (
                                            <li key={index}>
                                                <p>{ele}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}

                            {/* related questions */}
                            <div>
                                <p className='text-xl font-bold mb-2 mt-2'>Related Questions :</p>
                                <ul className='list-decimal'>
                                    {articleObj?.questions?.map((item, index) => (
                                        <li key={index}>
                                            <p>{item}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            }

            {/* chat image */}
            <img
                className='h-12 absolute bottom-10 right-7 cursor-pointer bg-gray-400 rounded-md p-1.5'
                src="/chat.png"
                style={{objectFit: 'cover'}}
                onClick={() => router.replace('/misci')}
            />
        </div>
        }

    </div>
  )
}

export default ArticleGenerated;