import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/navbar/Navbar';
import Header from '../../components/header/Header';
import CommonHeading from '../../components/commonHeading/CommonHeading';
import Article from '../../components/article/Article';
import './search.css';
import { FaSearch } from "react-icons/fa";



const Search = ()=>{
    const [val, setVal] = useState('');

    // boolean that will show the progress bar in search if true 
    const [show, setShow] = useState(false);

    // it will contain the posts that are fetched from backend as a result of user search
    const [searchPosts, setSearchPosts] = useState([]);

    const searchInputRef = useRef();

    // setting the search input box in search when the component is rendered
    useEffect(()=>{
        searchInputRef.current.focus();
    }, [])




    const handleChange = (e)=>{
        setVal(e.target.value);
    }

    // making request to backend to find posts that matches the user search
    const handleSearch = async ()=>{
        setShow(true);
        try{
            const res = await fetch(`/posts/filter/?search=${val}`);

            if(!res.ok){
                throw new Error(res.statusText);
            }

            const data = await res.json();

            setSearchPosts(data.posts);
            setShow(false);
            setVal('');
            searchInputRef.current.placeholder = data.posts.length+' results found'

            
        }catch(e){
            console.log(e);
        }
    }


    return(
        <>
            <Navbar/>
            <Header/>
            <CommonHeading title='Search' src='/images/searchBlog.svg' alt='search'/>
            <motion.div className='search-input-container'
                initial={{y:50, opacity:0}}
                animate={{y:0, opacity:1}}
                transition={{duration:0.7}}
            >
                {
                    show && <div className='shadow'></div>
                }
                <input type='text' placeholder='hi, search here...' value={val} onChange={handleChange} required ref={searchInputRef}/>
                <motion.button onClick={handleSearch}
                    initial={{scale:1}}
                    whileHover={{scale:1.05, opacity:0.8}}
                    whileTap={{scale:0.9}}
                > 
                    {
                        show
                        ?
                        <div></div>
                        :
                        <FaSearch/> 
                    }    
                </motion.button> 
            </motion.div>

            {
                searchPosts.length
                ?
                <div className='search-posts-container'>
                    {
                        searchPosts.map((post)=>{
                            return <Article key={post._id} post={post}/>
                        })
                    }
                </div>
                :
                null
            }
            
        </>
    );
}

export default Search;