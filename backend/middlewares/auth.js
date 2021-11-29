const jwt = require('jsonwebtoken');

const auth = async (req, res, next)=>{
    try{
        //getting token from cookies
        const accessToken = req.cookies.accessToken
        // checking if token not avaible then sending response of 401
        if(!accessToken){
            return res.status(401).json({
                message:'User is not authenticated'
            });
        }

        // checking the acceToken is valid or not 
        const isVerified = await jwt.verify(accessToken, process.env.TOKEN_SECRET);
        if(!isVerified){
            return res.status(401).json({
                message:'User is not authenticated'
            });
        }

        // adding the id of currently logged in user(from accesToken payload) to request object
        req.id = isVerified.id;
        next();

    }catch(e){
        res.status(500).json({
            message:'Some problem occurred'
        });
    }  

}


module.exports = auth;