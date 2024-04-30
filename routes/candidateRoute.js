const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { jwtAuthMiddleware, generateToken } = require('../jwt');
const Candidate = require('../models/candidate');


const checkAdminRole = async (userId) => {
    try {
        const user = await User.findById(userId);
        return user.role === 'admin';
    } catch (error) {
        return false;
    }
}


router.get('/', async (req, res) => {
    try {
        const candidates = await Candidate.find();
        res.status(200).json(candidates);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'candidates data not fetched'});
    }
    
});


router.get('/vote/count', async(req, res) => {
    try {
        const candidates = await Candidate.find().sort({voteCount: 'desc'});
        const voteRecord = candidates.map((data) => {
            return {
                party: data.party,
                count: data.voteCount
            }
        })
        res.status(200).json(voteRecord);
    } catch (error) {
        
    }
    
})


router.post('/', jwtAuthMiddleware, async(req, res) => {
    console.log(req.user);
    console.log(req.body);
    try {
        if(! (await checkAdminRole(req.user.id))){
            return res.status(404).json({message:' User is not admin'});
        }
        const data = req.body;
        const newCandidate = new Candidate(data);
        const response = await newCandidate.save();
        console.log('Candidate data saved');
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Internal server error from /candidate/'})
    }
})


router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if(! await checkAdminRole(req.user.id)){
            return res.status(403).json({error: 'User does not have admin role'});
        }
        const candidateID = req.params.candidateID;
        const updatedCandidate = req.body;
        const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidate, {
            new: true,
            runValidators: true
        });
    
        console.log('candidate data updated');
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'not updatedserver error'})
    }
})


router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if(!checkAdminRole(req.user.id)){
            return res.status(403).json({error: 'User does not have admin role'});
        }
        console.log('object')
        const candidateID = req.params.candidateID;
        const updatedCandidate = req.body;
        const response = await Candidate.findByIdAndDelete(candidateID);
        if(!response){
            return res.status(403).json({error: 'candidate does not exist'})
        }
        console.log('candidate data deleted');
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'data not deleted server error'})
    }
})


router.post('/vote/:candidateID',jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({error: 'User not found'});
        }
        if(user.role === 'admin'){
            return res.status(401).json({error: 'Admin can not vote'});
        };
        if(user.isVoted){
            return res.status(401).json({error: 'Already voted'});
        }

        const candidateID = req.params.candidateID;
        console.log(candidateID);
        const candidate = await Candidate.findById(candidateID);
        if(!candidate){
            return res.status(404).json({error: 'Candidate not found'});
        }

        candidate.votes.push({user: userId});
        candidate.voteCount++;
        await candidate.save();
        user.isVoted = true;
        await user.save();

        res.status(200).json({message: 'vote recorded successfully'});


    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'vote unable to record'});
    }
})


module.exports = router;