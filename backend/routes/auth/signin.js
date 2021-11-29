const router = require('express').Router();
const User = require('../../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// signin
router.post('/signin', async (req, res)=>{
    try{
        const {email, password} = req.body;

        // basic validation(checking if any field is empty)
        if(!email || !password){
            return res.status(400).json({
                message:'All fields are required'
            });
        }

        // checking user exists or not with the provided email
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                message:'Invalid credentials'
            })
        }
        
        // matching passwords
        const isMatched = await bcrypt.compare(password, user.password);
        if(!isMatched){
            return res.status(401).json({
                message:'Invalid credentials'
            });
        }

        // generating jwt
        const accessToken = await jwt.sign({id:user._id}, process.env.TOKEN_SECRET);
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            expires: new Date(Date.now() + 86400000)
        });
        
        res.status(200).json({
            message:'Logged in'
        });
    }catch(e){
        res.status(500).json({
            message:e
        })
    }
});


module.exports = router;