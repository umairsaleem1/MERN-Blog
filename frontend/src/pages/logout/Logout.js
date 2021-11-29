import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import Context from '../../context/Context';

const Logout = ()=>{
    // method from global state
    const [setIsLoggedIn] = useContext(Context);

    const history = useHistory();

    
    // seding request to backend to logout the user
    const logoutUser = async ()=>{
        try{
            const res = await fetch('/logout', {
                method:'GET',
                credentials:'include'
            });

            if(!res.ok){
                throw new Error(res.statusText);
            }

            history.push('/signin');
            setIsLoggedIn(false);
        }catch(e){
            console.log(e);
        }
    }

    logoutUser();
  

    return(
        <>
        </>
    );
}

export default Logout;