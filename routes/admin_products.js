const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const resize = require('resize-img');
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

const Product = require('../model/product');
const Category = require('../model/category');

router.get('/',isAdmin,async(req,res,next) =>{
    try {
        const count = await Product.countDocuments();
        const data = await Product.find();
        res.render('admin/products',{
            products: data,
            count: count
        })
    } catch (error) {
        console.log(error);
    }
});

router.get('/add',isAdmin, async(req,res,next) =>{
    try {
        const cate = await Category.find();
        res.render('admin/add_products',{
            categories: cate
        });
    } catch (error) {
        console.log(error);
    }
});

router.post('/add',async(req,res,next) =>{
    try {
        const title = req.body.title;
        const slug = title;
        const price = req.body.price;
        const desc = req.body.desc;
        const category = req.body.category;

        var imageFile;
        if(!req.files){
            imageFile = ""
        }else{
            imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : ""
        }

        req.checkBody('title',"Title must an value").notEmpty();
        req.checkBody('price',"Price must an value").isDecimal();
        req.checkBody('image',"You must upload an image").isImage(imageFile);

        const errors =await req.validationErrors();
        if(errors){
            const c = await Category.find();
            res.render('admin/add_products',{
                errors: errors,
                categories: c
            })
        }else{
            const data = await Product.findOne({slug:slug});
            const cate = await Category.find();
            if(data){
                req.flash('danger',"Product exists!!");
                res.render('admin/add_products',{
                    categories: cate
                })
            }else{
                const price2 = parseFloat(price).toFixed(2);
                const product = new Product({
                    title: title,
                    price: price2,
                    slug: slug,
                    desc: desc,
                    category: category,
                    image: imageFile
                });
                await product.save();

                await fs.mkdirSync('public/product_images/' + product._id,{recursive:true});
                await fs.mkdirSync('public/product_images/' + product._id + '/gallery',{recursive:true});
                await fs.mkdirSync('public/product_images/' + product._id + '/gallery/thumbs',{recursive:true});

                if(imageFile != ""){
                    var productImage = req.files.image;
                    var path = 'public/product_images/' + product._id + '/' + imageFile;

                    await productImage.mv(path);
                };
                
                req.flash('success',"Product created!!");
                res.redirect('/admin/products')

            }
        }
    } catch (error) {
        console.log(error);
    }
});

router.get('/edit/:id',isAdmin,async(req,res,next) =>{
    try {
        var errors;

        if(req.session.errors) errors = req.session.errors;
        req.session.errors = null;

        const c = await Category.find();
        const p = await Product.findById(req.params.id);

        var galleryDir = 'public/product_images/' + p._id + '/gallery';
        var galleryImages = null;
        const file = await fs.readdir(galleryDir);
        galleryImages = file;

        res.render('admin/edit_products',{
            errors: errors,
            title: p.title,
            price: parseFloat(p.price).toFixed(2),
            desc: p.desc,
            categories: c,
            galleryImages: galleryImages,
            category: p.category,
            image: p.image,
            id: p._id
        })
    } catch (error) {
        console.log(error);
    }
});

router.post('/edit/:id',async(req,res,next) =>{
    try {
        var imageFile;
        if(!req.files){
            imageFile = "";
        }else{
            imageFile = typeof req.files.image !=="undefined" ? req.files.image.name : "";
        }

        const title = req.body.title;
        const slug = title;
        const desc = req.body.desc;
        const category = req.body.category;
        const price = req.body.price;
        const id = req.params.id;
        const pimage = req.body.pimage;

        req.checkBody('title',"Title must an value").notEmpty();
        req.checkBody('price',"Price must an value").isDecimal();
        req.checkBody('image',"You must upload an image").isImage(imageFile);

        const errors = await req.validationErrors();
        if(errors){
            req.session.errors = errors;
            res.redirect('/admin/products/edit/' + id);
        }else{
            const p = await Product.findOne({slug:slug, _id: {'$ne': id}});
            if(p){
                req.flash('danger',"Productt exists!!");
                res.redirect('/admin/products/edit/' + id);
            }else{
                const data = await Product.findById(id);
                data.title = title;
                data.slug = slug;
                data.price = parseFloat(price).toFixed(2);
                data.desc = desc;
                data.category = category;
                if(imageFile != ""){
                    data.image = imageFile
                }
                await data.save();

                if(imageFile != ""){
                    if(pimage != ""){
                        await fs.remove('public/product_images/' + id + '/' + pimage);
                    }

                    var productImage = req.files.image;
                    var path = 'public/product_images/' + id + '/' + imageFile;
                    await productImage.mv(path);
                }

                req.flash('success',"Product updated!!");
                res.redirect('/admin/products');
            }
        }
    } catch (error) {
        console.log(error);
    }
});

router.post('/product-gallery/:id', async(req,res,next) =>{
    try {
        const id = req.params.id;
        var productImage = req.files.file;
        var gallerypath = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
        var thumbspath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

        await productImage.mv(gallerypath);

        const readFile = await resize(fs.readFileSync(gallerypath),{width: 100, height: 100});
        await fs.writeFileSync(thumbspath,readFile);

        res.sendStatus(200);
    } catch (error) {
        console.log(error);
    }
});

router.get('/delete-img/:image',isAdmin,async(req,res,next) =>{
    try {
        const id = req.query.id;

        const path = 'public/product_images/' + id + '/gallery/' + req.params.image;
        const thumbspath = 'public/product_images/' + id + '/gallery/thumbs/' + req.params.image;

        await fs.remove(path);
        await fs.remove(thumbspath);

        req.flash('success',"Image deleted!!");
        res.redirect('/admin/products/edit/' + id);
    } catch (error) {
        console.log(error);
    }
});

router.get('/delete/:id',isAdmin,async(req,res,next) =>{
    try {
        const id = req.params.id;
        const path = 'public/product_images/' + id;
        
        await fs.remove(path);
        await Product.findByIdAndRemove(id);

        req.flash('success',"Product deleted!!");
        res.redirect('back');
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;