import React, { useState } from 'react';
import Context from './Context';


const Provider = ({children})=>{

    // state variable that will hold the posts to show on home page
    const [posts, setPosts] = useState([]);
    
    // state variable that will contain boolean true if the category or author name clicked to show only posts related to that category or author
    // and prevents the home page to send request to backend for all posts
    // otherwise false
    const [isFromSingle, setIsFromSingle] = useState(false);

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    

    // handler that will be called when the user clicks on author name or category name on blog post
    const filterClicked = async (e, filter, history)=>{
        setIsFromSingle(true);
        
        const val = e.target.textContent.trim();
        
        
        // changing the url according to the filter
        history.push({
            pathname:'/',
            search:`?${filter}=${val}`
        });
        // making call to backed to fetch posts of the author or category on which the user clicked
        try{
            const res = await fetch(`/posts/filter/?${filter}=${val}`);
            if(!res.ok){
                throw new Error(res.statusText);
            }

            const data = await res.json(); 
            // setting the retured posts by backend to global state variable posts
            setPosts(data.posts);

        }catch(e){
            console.log(e);
        }
    }

    
    return(
        <Context.Provider value={[posts, setPosts, isFromSingle, setIsFromSingle, filterClicked, isLoggedIn, setIsLoggedIn]}>
            {children}
        </Context.Provider>
    );
}

export default Provider;