const express = require('express');
const router = express.Router();

const Page = require('../model/page');

router.get('/', async(req,res,next) =>{
    try {
        const data = await Page.findOne({slug: "home"});
        res.render('home/index',{
            title: data.title,
            content: data.content
        })
    } catch (error) {
        console.log(error);
    }
});

router.get('/:slug',async(req,res,next) =>{
    try {
        const data = await Page.findOne({slug: req.params.slug});
        if(!data){
            res.redirect('/');
        }else{
            res.render('home/index',{
                title: data.title,
                content: data.content
            })
        }
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;