const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { jwtAuthMiddleware, generateToken } = require('../jwt');


router.post('/signup', async(req, res) => {
    if(req.body.role==='admin'){
        const admin = await User.find({role:'admin'});
        if(admin){
            return res.status(403).json({error: 'admin already exist'})
        }
    }
    try {
        const data = req.body;
        const newUser = new User(data);
        const response = await newUser.save();
        console.log('data saved');

        const payload = {
            id: response.id,
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log('Token is :', token);
        res.status(200).json({respone: response, token: token});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Internal server error from signup'})
    }
})


router.post('/login', async(req, res) => {
    try {
        const {aadhaarCardNumber, password} = req.body;
        const user = await User.findOne({aadhaarCardNumber: aadhaarCardNumber});
        // console.log(user);
        if(!user || (await !user.comparePassword(password))){
            return res.status(401).json({error: 'Invalid Aadhar or Password'});
        }

        const payload = {
            id: user.id
        }
        const token = generateToken(payload);
        res.json(token);
    } catch (error) {
        
    }
})


router.get('/profile', jwtAuthMiddleware, async(req, res) => {
    try {
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(200).json({user});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Internal server error from get profile'});
    }
})


router.put('/profile/password', jwtAuthMiddleware, async(req, res) => {
    try {
        const userId = req.user.id;
        const {currentPassword, newPassword} = req.body;
        const user = await User.findOne({userId});

        if(await user.comparePassword(currentPassword)){
            return res.status(401).json({error: 'Invalid username or password (put)'})
        }

        user.password = newPassword;
        await user.save()

        console.log('new password updated');
        res.status(200).json()

    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Invalid username or password (put)' })
        
    }
})


module.exports = router;