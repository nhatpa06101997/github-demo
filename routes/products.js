const express = require('express');
const router = express.Router();
const fs = require('fs-extra');

const Product = require('../model/product');
const Category = require('../model/category');

router.get('/all',async(req,res,next)=>{
    try {
        const data = await Product.find();
        res.render('home/all_products', {
            title: "All Products",
            products: data
        })
    } catch (error) {
        console.log(error);
    }
});

//slug của category ko phải slug của product
router.get('/:slug', async(req,res,next) =>{
    try {
        const c = await Category.findOne({slug: req.params.slug});
        const data = await Product.find({category: req.params.slug});
        if(!c){
            res.redirect('/products/all')
        }
        res.render('home/cate_products',{
            title: c.title,
            products: data
        });
    } catch (error) {
        console.log(error);
    }
});

router.get('/:category/:slug', async(req,res,next) =>{
    try {
        var galleryImages = null;
        var log = (req.isAuthenticated()) ? true : false;
        
        const c = await Category.findOne({slug: req.params.category});
        if(!c){
            res.redirect('/products/all');
        }else{
            const p = await Product.findOne({slug: req.params.slug,category: req.params.category});
            if(!p){
                res.redirect('/products/all');
            }else{
                var galleryDir = 'public/product_images/' + p._id +'/gallery';

                const imageFile = await fs.readdir(galleryDir);
                galleryImages = imageFile;
                res.render('home/product_details', {
                    title: p.title,
                    p: p,
                    log: log,
                    galleryImages: galleryImages
                })
            }
        }
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;