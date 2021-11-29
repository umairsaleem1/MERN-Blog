import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useHistory } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import Header from '../../components/header/Header';
import './write.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



const WriteBlog = ()=>{
    const [values, setValues] = useState({title:'', category:'', desc:''});
    // selectedFile will contain the file that is selected
    const [selectedFile, setSelectedFile] = useState();
    // preview will contain the url of selected file
    const [preview, setPreview] = useState();

    const history = useHistory();

    // It will contain reference to the title input box
    const titleRef = useRef();

    
    
    
    useEffect(()=>{
        // making request to backend whether the user is authenticated or not when the components is rendered
        const isLoggedIn = async ()=>{
            const res = await fetch('/authenticate', {
                method:'GET',
                credentials:'include'
            });

            if(res.status===401){
                history.push('/signin');
            }
        }
        isLoggedIn();

        
        // it will set the title input box to focus first time the component is rendered
        titleRef.current.focus();
    }, [history]);



    // create a preview(set url of selected file) , whenever selected file is changed
    useEffect(()=>{
        if(!selectedFile){
            setPreview(undefined);
            return;
        }

        // generating the url of the selected file
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);

        // free memory when ever this component is unmounted
        return ()=>{
            URL.revokeObjectURL(objectUrl);
        }

    }, [selectedFile])

    // handler that will set file in state when ever the user clicks on select button
    const onSelectingFile = (e)=>{
        if(!e.target.files || e.target.files.length===0){
            setSelectedFile(undefined);
            return;
        }
        setSelectedFile(e.target.files[0]);
    }


    const handleChange = (e)=>{
        setValues({...values, [e.target.name]:e.target.value});
    }


    const handleSubmit= async (e)=>{
        e.preventDefault();
        try{
            // creating formData because multer only accepts form-data
            let formData = new FormData();
            formData.append('title', values.title);
            formData.append('category', values.category);
            formData.append('desc', values.desc);
            formData.append('blogImage',selectedFile);

            //sending data to backend
            const res = await fetch('/posts', {
                method:'POST',
                credentials:'include',
                body:formData
            });


            if(!res.ok){
                throw new Error(res.statusText);
            }

            const data = await res.json();
            
            setValues({title:'', category:'', desc:''});
            setSelectedFile(undefined);

            toast.success(data.message, {
                position:"top-center",
                autoClose:2000
            });
            setTimeout(()=>{
                history.push('/');
            }, 2100);
        }catch(e){
            toast.error('Sorry, some problem occurred!', {
                position:"top-center",
                autoClose:3000
            });
        }
    }
    return(
        <>
            <Navbar/>
            <Header/> 
            <div className='blog-data'>
                {
                    preview
                    ?
                    <div className='blog-image'>
                        <motion.img src={preview} alt='Blog' 
                            initial={{opacity:0}}
                            animate={{opacity:1}}
                            transition={{delay:0.5}}
                        />
                    </div>
                    :
                    null
                }
                <form onSubmit={handleSubmit} encType='multipart/form-data'>
                    <motion.div className='blog-title'
                        initial={{y:'-100vh'}}
                        animate={{y:0}}
                        transition={{delay:0.5, type:'spring', stiffness:120}}
                    >
                        <div className='upload-blog-image'>
                            <div>+</div>
                            <input type='file' name='blogImage' accept='image/*' onChange={onSelectingFile} required/>
                        </div>
                        <div className='title'>
                            <input type='text' placeholder='Title' focused='true' ref={titleRef} name='title' value={values.title} onChange={handleChange} required/>
                        </div>
                        <div className='publish-btn'>
                            <motion.button type='submit'
                                initial={{scale:1}}
                                whileHover={{scale:1.05, opacity:0.8}}
                                whileTap={{scale:0.9}}
                            >Publish</motion.button>
                        </div>
                    </motion.div>
                    <motion.div className='blog-category'
                        initial={{opacity:0}}
                        animate={{opacity:1}}
                        transition={{delay:2}}
                    >
                        <label>Cat:</label>
                        <input type='text' placeholder='Enter Category Here...' name='category' value={values.category} onChange={handleChange} required/>
                    </motion.div>
                    <motion.div className='blog-description'
                        initial={{y:'100vh', opacity:0}}
                        animate={{y:0, opacity:1}}
                        transition={{delay:1, type:'tween', duration:1}}
                    >
                        <textarea placeholder='Tell your story...' name='desc' value={values.desc} onChange={handleChange} required></textarea>
                    </motion.div>
                </form>
            </div>
            <ToastContainer />
        </>
    );
}

export default WriteBlog;