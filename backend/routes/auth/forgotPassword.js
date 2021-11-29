const router = require('express').Router();
const User = require('../../models/user');
const PasswordReset = require('../../models/passwordReset');
const sendEmail = require('../../utils/sendEmail');
const { v4 } = require('uuid');


router.post('/forgotpassword', async (req, res)=>{
    try{
        const {email} = req.body;

        // checking whether user send the email or not
        if(!email){
            return res.status(403).json({
                message:'Email is required to get reset password link'
            });
        }

        // checking is there any user in our databse with the email that user sent
        const user = await User.findOne({email:email});
        if(!user){
            return res.status(401).json({
                message:'User does not exist with the provided email'
            });
        }


        // Create password reset token and save in collection along with user
        // If there already is a record with current user, replace it
        const token = v4().toString().replace(/-/g, '');
        PasswordReset.updateOne({user: user._id}, {user: user._id, token: token}, {upsert: true})
        .then( (updateResponse) => {
            // send email to user containing password reset link
            const resetLink = `http://localhost:3000/resetpassword/${token}`;
            sendEmail(user.username, email, resetLink);
            return res.status(200).json({
                message:'Check your email address for the password reset link!'
            })
        })
        .catch( (err) => {
            return res.status(500).json({
                message:'Failed to generate reset link, please try again!'
            });
        })



        // res.status(200).send('ok');
    }catch(e){
        res.status(500).json({
            message:'Server error'
        });
    }
    
});

module.exports = router;