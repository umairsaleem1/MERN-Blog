import React, { useState, useEffect } from 'react';
import './profile.css';
import { motion } from 'framer-motion';
import { useHistory } from 'react-router-dom';
import AuthHeader from '../../components/authHeader/AuthHeader';
import Navbar from '../../components/navbar/Navbar';
import Header from '../../components/header/Header';
import { FaRegUserCircle } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../../components/loader/Loader';




// Variants for parent container
const profileVariants = {
    hidden:{
        y:100,
        opacity:0
    },
    visible:{
        y:0,
        opacity:1,
        transition:{
            delay:0.3,
            duration:0.5
        }
    }
}


const Profile = ()=>{
    const [values, setValues] = useState({username:'', email:'', password:'', file:''});
    const [blured, setBlured] = useState({username:'false', email:'false', password:'false'});
    
    // selectedFile will contain the file that is selected
    const [selectedFile, setSelectedFile] = useState();
    // preview will contain the url of selected file
    const [preview, setPreview] = useState();
    
    const history = useHistory();

    // fetching currently logged in user(if any) data from backend when the page loads
    useEffect(()=>{
        const fetchProfileData = async ()=>{
            try{
                const res = await fetch('/profile', {
                    method:'GET',
                    credentials:'include'
                });
                if(!res.ok){
                    throw new Error(res.statusText);
                }

                const data = await res.json();
                setValues({username:data.username, email:data.email, password:'', file:data.file});
            }catch(e){
                history.push('/signin');
                console.log(e);
            }
            
        }
        fetchProfileData();

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





    const handleChange = (e)=>{
        setValues({...values, [e.target.name]:e.target.value});
    }

    const handleBlur = (e)=>{
        setBlured({...blured, [e.target.name]:'true'});
    }


     // handler that will set file in state when ever the user clicks on select button
     const onSelectingFile = (e)=>{
        if(!e.target.files || e.target.files.length===0){
            setSelectedFile(undefined);
            return;
        }
        setSelectedFile(e.target.files[0]);
        setValues({...values, file:e.target.files[0]});
    }


    const handleSubmit = async (e)=>{
        e.preventDefault();
        try{
            // creating formData because multer only accepts form-data
            const formData = new FormData();
            formData.append('username',values.username);
            formData.append('email', values.email);
            formData.append('password', values.password);
            formData.append('file', values.file);

            // sending data to backend to update user data
            const res = await fetch('/profile', {
                method:'PUT',
                credentials:'include',
                body:formData
            });

            if(!res.ok){
                throw new Error(res.statusText);
            }

            const data = await res.json();
            
            setValues({...values, password:''});
            setBlured({username:'false', email:'false', password:'false'});

            toast.success(data.message, {
                position:"top-center",
                autoClose:2000
            });
        }catch(e){
            toast.error('Profile could not be updated!', {
                position:"top-center",
                autoClose:3000
            });
        }
    }



    // seding api request to backend for deleting the currently logged in user(if any) account
    const deleteAccount = async ()=>{
        try{
            const res = await fetch('/profile', {
                method:'DELETE',
                credentials:'include'
            });

            if(!res.ok){
                throw new Error(res.statusText);
            }

            const data = await res.json();
            toast.success(data.message, {
                position:"top-center",
                autoClose:2000
            });
            
            setTimeout(()=>{
                history.push('/signup');
            },2100);
        }catch(e){
            toast.error('Account could not be deleted!', {
                position:"top-center",
                autoClose:3000
            });
        }
    }


    return(
        <>
        {
            values.username
            ?
            <>
                <Navbar/>
                <Header/>
                <motion.div className='profile-page'
                    variants={profileVariants}
                    initial='hidden'
                    animate='visible'
                >
                    <AuthHeader text='Update Your Account'/>
                    <div className='profile-info'>
                        <div className='del-ac-btn-container'>
                            <motion.div className='del-ac-btn' onClick={deleteAccount}
                                initial={{scale:1}}
                                whileTap={{scale:0.9}}
                                whileHover={{scale:1.05}}
                            >Delete Account</motion.div>
                        </div>
                        <div className='update-form'>
                            <form onSubmit={handleSubmit} encType='multipart/form-data'>
                                <div className='profile-photo-container'>
                                    <input type='file' className='update-image' required name='file' onChange={onSelectingFile} accept='image/*'/>
                                    <p>Profile Picture</p>
                                    <div className='profile-photo'>
                                        <img src={preview ? preview : values.file} alt='profile'/>
                                        <div className='profile-image-update' title='Update Picture'>
                                            <FaRegUserCircle className='profile-image-update-btn'/>
                                        </div>
                                    </div>
                                </div>
                                <div className='update-input-container'>
                                    <label>Username</label>
                                    <input type='text' required pattern='^[A-Za-z0-9]{3,16}$' name='username' value={values.username} onChange={handleChange} onBlur={handleBlur} focused={blured.username}/>
                                    <span>Username should be 3-16 character and shouldn't include any special character!</span>
                                </div>
                                <div className='update-input-container'>
                                    <label>Email</label>
                                    <input type='email' required name='email' value={values.email} onChange={handleChange} onBlur={handleBlur} focused={blured.email}/>
                                    <span>It should be a valid email address!</span>
                                </div>
                                <div className='update-input-container'>
                                    <label>Password</label>
                                    <input type='password' required pattern='^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$' name='password' value={values.password} onChange={handleChange} onBlur={handleBlur} focused={blured.password} onFocus={()=>setBlured({...blured, password:'true'})}/>
                                    <span>Password should be 8-20 characters and include at least 1 letter, 1 number and 1 special character!</span>
                                </div>

                                <div className='update-btn'>
                                    <motion.button type='submit'
                                        initial={{scale:1}}
                                        whileHover={{scale:1.05, opacity:0.8}}
                                        whileTap={{scale:0.9}}
                                    >Update</motion.button>
                                </div>
                            </form>
                        </div>
                    </div>
                </motion.div>
                <ToastContainer />
            </>
            :
            <Loader/>
        }
        </>
    );
}

export default Profile;