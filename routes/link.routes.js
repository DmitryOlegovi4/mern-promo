const {Router} = require('express');
const router = Router();
const config = require('config');
const shortid = require('shortid');
const auth = require('../middleware/auth.middleware');
const Link = require('../models/Link');
const {Types} = require("mongoose");


// /api/link/
router.get('/', auth,async (req, res) => {
    try{
        const links = await Link.find({owner: req.user.userId});
        res.json(links);
    } catch (e) {
        res.status(500).json({message: "Что-то пошло не так, попробуйте снова!"});
    }
})
// /api/link/:id
router.get('/:id', auth,async (req, res) => {
    try{
        const link = await Link.findById(req.params.id);
        res.json(link);
    } catch (e) {
        res.status(500).json({message: "Что-то пошло не так, попробуйте снова!"});
    }
})

// /api/link/generate
router.post('/generate', auth,async (req, res) => {
    try{
        const baseURL = config.get('baseURL');
        const {from} = req.body;
        const existing = await Link.findOne({from});
        if(existing){
            return res.json({link: existing});
        }
        const code = shortid.generate();
        const to = baseURL + '/t/' + code;
        const link = new Link({ from, to, code, owner: req.user.userId });
        await link.save();

        res.status(201).json(link);

    } catch (e) {
        res.status(500).json({message: "Что-то пошло не так, попробуйте снова!"});
    }
})



module.exports = router;