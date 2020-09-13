const express = require('express');
const router = express.Router();

const Page = require('../model/page');
const Product = require('../model/product');
const Category = require('../model/category');

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

router.get('/autocomplete/search',(req,res,next) =>{
    var regex = new RegExp(req.query["term"],'i');

    var pFilter = Product.find({title: regex},{'title':1}).sort({"updated_at": -1}).sort({"created_at": -1}).limit(10);
    pFilter.exec(function(err,data){
        var result = [];
        if(!err){
            if(data && data.length && data.length>0){
                data.forEach(u =>{
                    let obj = {
                        id: u._id,
                        label: u.title
                    };
                    result.push(obj)
                });
            }
            if(result.length>0){
                res.jsonp(result);
            }else{
                result = ["Không tìm thấy!!"];
                res.jsonp(result);
            }
            
        }
    })
});
router.post('/autocomplete/search',async(req,res,next) =>{
    try {
        const title = req.body.filter;
        const data = await Product.findOne({title: title});
        if(!data){
            res.redirect('/')
        }else{
            res.redirect('/products/' + data.category + '/' + data.title)
        }
    } catch (error) {
        console.log(error)
    }
})

module.exports = router;