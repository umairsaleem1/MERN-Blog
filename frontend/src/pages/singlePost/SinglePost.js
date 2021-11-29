import React, {useState, useEffect, useContext} from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../../components/navbar/Navbar';
import Header from '../../components/header/Header';
import Article from '../../components/article/Article';
import './single.css';
import { BiCategory, BiTimeFive } from "react-icons/bi";
import { FiPaperclip } from "react-icons/fi";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import Context from '../../context/Context';
import Loader from '../../components/loader/Loader';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



const SinglePost = ()=>{
    // method from global state
    const [, , , , filterClicked] = useContext(Context);

    // It will contain the data of single post according to the id in url
    const [post, setPost] = useState(null);

    // It will contain the comments of single post according to the id in url
    const [comments, setComments] = useState([]);

    const [relatedPosts, setRelatedPosts] = useState([]);

    // state varable that will contain the currently loggedIn username from backend(if any)
    const [loggedUsername, setLoggedUsername] = useState('');

    // state variable that will contain the currently loggedIn userImage from backend(if any)
    const [loggedUserImage, setLoggedUserImage] = useState('');

    // getting id of the post from url-parameter
    const { id } = useParams();

    const history = useHistory();

    // It is required in image src bcz by default it is using the react app port
    // I will change it to the backend port that will be provided by the host when deploying it on heroku
    const PF = "http://localhost:8000/";

    // state that will contain the updated values of title and description
    const [editedValues, setEditedValues] = useState({title:'', desc:''});

    // state that will check weahther the user clicks on edit button or not
    const [isEditMode, setIsEditMode] = useState(false);

    // state that will contain the commnet that the user can make
    const [commentVal, setCommentVal] = useState('');

    
    
    useEffect(()=>{
        // making request to backend to fetch post of particular id when the component is rendered
        const fetchPost = async ()=>{
            try{
                const res = await fetch('/posts/'+id);
                if(!res.ok){
                    throw new Error(res.statusText);
                }

                const data = await res.json();
                setPost(data.post);
            }catch(e){
                console.log(e);
            }
        }

         // making request to backend to fetch comments of particular id when the component is rendered
        const fetchComments = async ()=>{
            try{
                const res = await fetch('/comments/'+id);

                if(!res.ok){
                    throw new Error(res.statusText);
                }

                const data = await res.json();

                setComments(data.comments.reverse());
            }catch(e){
                console.log(e);
            }
        }
        
        fetchPost();
        fetchComments();

        window.scrollTo(0, 0)
    }, [id]);


    // making request to backend to fetch username of currently logged in user(if any)
    useEffect(()=>{
        const fetchLoggedInUsername = async ()=>{
            try{
                const res = await fetch('/authenticate');
                if(!res.ok){
                    throw new Error(res.statusText);
                }

                const data = await res.json();
                setLoggedUsername(data.username);
                setLoggedUserImage(data.pic);
            }catch(e){
                console.log(e);
            }
        }
        fetchLoggedInUsername();
    }, [])


    // making request to backend to fetch blog posts related to this post category excluding this post
    useEffect(()=>{
        const fetchRelatedBlogs = async ()=>{
            try{
                const res = await fetch('/posts/'+post.category+'/'+post.title);
                if(!res.ok){
                    throw new Error(res.statusText);
                }

                const data = await res.json();
                if(data.relatedPosts.length>3){
                    let arr = [data.relatedPosts[0], data.relatedPosts[1], data.relatedPosts[2]];
                    setRelatedPosts(arr);
                }
                else{
                    setRelatedPosts(data.relatedPosts);
                }
                
            }catch(e){
                console.log(e);
            }
        }
        if(post){
            fetchRelatedBlogs();
        }
    }, [post]);


     



    const handleEditPost = ()=>{
        setIsEditMode(true);
        setEditedValues({title:post.title, desc:post.desc});
    }

    const handleEditingChange = (e)=>{
        setEditedValues({...editedValues, [e.target.name]:e.target.value});
    }


    // making request to backend to update the post
    const handlePostUpdate = async ()=>{
        try{
            const res = await fetch('/posts/'+id, {
                method:'PUT',
                credentials:'include',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify(editedValues)
            });

            window.scrollTo(0, 0);

            if(!res.ok){
                throw new Error(res.statusText);
            }

            const data = await res.json();
            
            setPost(data.updatedPost);
            setEditedValues({title:'', desc:''});
            setIsEditMode(false);

            toast.success('Post Updated Successfully', {
                position:"top-center",
                autoClose:2000
            });

            
        }catch(e){
            console.log(e);
            toast.error('Sorry!! Post could not be updated', {
                position:"top-center",
                autoClose:3000
            });
        }
    }

    // making request to backend to delete the post
    const handleDeletePost = async ()=>{
        try{
            const res = await fetch('/posts/'+id, {
                method:'DELETE',
                credentials:'include'
            });

            window.scrollTo(0, 0);
            
            if(!res.ok){
                throw new Error(res.statusText);
            }

            toast.success('Post Deleted Successfully', {
                position:"top-center",
                autoClose:2000
            });
            setTimeout(()=>{
                history.push('/');
            }, 2100)
            
        }catch(e){
            console.log(e);
            toast.error('Sorry!! Post could not be deleted', {
                position:"top-center",
                autoClose:3000
            });
        }
    }


    const handleCommentChange = (e)=>{
        setCommentVal(e.target.value);
    }

    const handlePostComment = async ()=>{
        if(!loggedUsername){
            toast.error('Please signin first to make this comment', {
                position:"top-center",
                autoClose:2000
            });
            return;
        }
        if(commentVal.length<10){
            toast.error('Comment must be of minumum 10 characters', {
                position:"top-center",
                autoClose:2000
            });
            return;
        }

        let date = new Date().toLocaleTimeString('en-US');
        let modifiedDate = date.slice(0,date.length-6)+''+date.slice(date.length-3);

        // sending comment to backend
        try{
            const res = await fetch('/comments', {
                method:'POST',
                credentials:'include',
                headers:{
                    'Content-Type':'application/json',
                    'Accept':'application/json'
                },
                body:JSON.stringify({
                    postId:id,
                    userImage:loggedUserImage,
                    username:loggedUsername,
                    comment:commentVal,
                    time:modifiedDate
                })
            });

            if(!res.ok){
                throw new Error(res.statusText);
            }

            const data = await res.json();
            
            setCommentVal('');

            toast.success(data.message, {
                position:"top-center",
                autoClose:2000
            });

            // fetching comments from bechend to reflect in frontend
            const fetchComments = async ()=>{
                try{
                    const res = await fetch('/comments/'+id);
    
                    if(!res.ok){
                        throw new Error(res.statusText);
                    }
    
                    const data = await res.json();
    
                    setComments(data.comments.reverse());
                }catch(e){
                    console.log(e);
                }
            }
            fetchComments();
        }catch(e){
            toast.error('Sorry!! your comment could not be saved', {
                position:"top-center",
                autoClose:2000
            });
        }
    }
    
    return(
        <>
        {
            post
            ?
            <>
            <Navbar/>
            <Header PF={PF}/>
            {
                post
                ?
                <div className='post-content'>
                    <div className='single-post-image'>
                        <img src={PF + post.postImage} alt='Single-Post' />
                    </div>

                    {
                        isEditMode
                        ?
                        <input type='text' className='editing-title' value={editedValues.title} onChange={handleEditingChange} name='title' required/>
                        :
                        <h1 className='single-post-title'> {post.title} </h1>
                    }
                    
                    <div className='single-post-author'>
                        <div className='single-post-author-left'>
                            <div className='single-post-author-image'> 
                                <img src={PF + post.authorImage} alt='author' />
                            </div>
                            <p onClick={(e)=> filterClicked(e, 'author', history)}><b> {post.author} </b></p>
                        </div>
                        {
                            loggedUsername===post.author
                            ?
                            <div className='single-post-author-right' style={isEditMode ? {display:'none'} : {display:'flex'}}>
                                <FaRegEdit className='post-edit-btn' title='Edit Post' onClick={handleEditPost}/>
                                <RiDeleteBin6Line className='post-delete-btn' title='Delete Post' onClick={handleDeletePost}/>
                            </div>
                            :
                            null
                        }
                    </div>
                    <div className='single-post-category'>
                        <BiCategory/>
                        <p onClick={(e)=> filterClicked(e, 'category', history)}> {post.category} </p>
                        <BiTimeFive/>
                        <p> {post.createdAt.slice(0,10)} </p>
                    </div>

                    {
                        isEditMode
                        ?
                        <>
                            <textarea className='editing-desc' value={editedValues.desc} onChange={handleEditingChange} name='desc' required></textarea>
                            <div className='update-btn'>
                                <button onClick={handlePostUpdate}>Update</button>
                            </div>
                        </>
                        :
                        <p className='single-post-desc'> {post.desc} </p>
                    }
                    
                    <hr className='single-post-divider'/>
                    {
                        relatedPosts.length
                        ?
                        <div className='related-blogs'>
                            <p className='related-blogs-heading'><FiPaperclip/> Related Blogs</p>
                            <div className='related-blogs-container'>
                                {
                                    relatedPosts.map((post)=>{
                                        return <Article post={post} PF="http://localhost:8000/" key={post._id}/>
                                    })
                                }
                            </div>
                        </div>
                        :
                        null
                    }
                    
                    <div className='comment-system'>
                        <h1 className='comment-main-heading'>{comments.length} Comments</h1>
                        <p className='write-comment-heading'>Write a comment</p>
                        <div className='comment-writing-area'>
                            <div>
                                <img src={loggedUserImage ? PF+loggedUserImage : '/images/placeholderCircle.png'} alt='user' />
                            </div>
                            <textarea value={commentVal} onChange={handleCommentChange} placeholder='Leave a comment...'></textarea>
                        </div>
                        <div className='comment-btn-wrapper'>
                            <motion.button className='comment-btn' onClick={handlePostComment}
                                initial={{scale:1}}
                                whileTap={{scale:0.9}}
                                whileHover={{scale:1.05, opacity:0.8}}
                            >Post comment</motion.button>
                        </div>
                        <div className='all-comments'>
                            {
                                comments
                                ?
                                comments.map((comment)=>{
                                    return(
                                        <div className='comment' key={comment._id}>
                                            <div className='comment-author'>
                                                <div className='comment-author-image'>
                                                    <img src={PF+comment.userImage} alt='author' />
                                                </div>
                                                <h4> { comment.username } </h4>
                                            </div>
                                            <p> { comment.comment } </p>
                                            <p className='comment-time'><BiTimeFive/>&nbsp; {comment.time} </p>
                                        </div>
                                    )
                                })
                                :
                                null
                            }
                            
                        </div>
                    </div>
                </div>
                :
                null

            }
            </>
            :
            <Loader/>
        }   
        <ToastContainer />   
        </>
    );
}

export default SinglePost;