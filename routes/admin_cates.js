const express = require('express');
const router = express.Router();
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

const Category = require('../model/category');

router.get('/',isAdmin, async(req,res,next) =>{
    try {
        const data = await Category.find();
        res.render('admin/categories', {
            categories: data
        })
    } catch (error) {
        console.log(error)
    }
});

router.get('/add',isAdmin,async(req,res,next) =>{
    try {
        res.render('admin/add_cates')
    } catch (error) {
        console.log(error);
    }
});

router.post('/add',async(req,res,next) =>{
    try {
        const title = req.body.title;
        const slug = title;

        req.checkBody('title',"Title must an value").notEmpty();

        const errors =await req.validationErrors();
        if(errors){
            res.render('admin/add_cates',{
                errors: errors,
                title: ""
            });
        }else{
            const data = await Category.findOne({slug:slug});
            if(data){
                req.flash('danger',"Slug exists!!");
                res.render('admin/add_cates',{
                    title: ""
                });
            }else{
                const cate = new Category({
                    title: title,
                    slug: slug
                });
                await cate.save();

                const cates = await Category.find();
                req.app.locals.categories = cates;

                req.flash('success',"Category Created!");
                res.redirect('/admin/cates');
            };
        }
    } catch (error) {
        console.log(error);
    }
});

router.get('/edit/:id',isAdmin,async(req,res,next) =>{
    try {
        const id = req.params.id;
        const data = await Category.findById(id);
        res.render('admin/edit_cates', {
            title: data.title,
            id: data._id
        });
    } catch (error) {
        console.log(error);
    }
});

router.post('/edit/:id',async(req,res,next) =>{
    try {
        const id = req.params.id;
        const title = req.body.title;
        const slug = title;

        req.checkBody('title',"Title must an value").notEmpty();

        const errors = req.validationErrors();
        if(errors){
            res.render('admin/edit_cates',{
                id: id,
                title: title
            });
        }else{
            const data = await Category.findOne({slug: slug, _id: {'$ne': id}});
            if(data){
                req.flash('danger',"Slug exists!!");
                res.render('admin/edit_cates',{
                    id:id,
                    title: title
                });
            }else{
                const cate = await Category.findById(id);
                cate.title = title;
                cate.slug = slug;

                await cate.save();

                const cates = await Category.find();
                req.app.locals.categories = cates;

                req.flash('success',"Category updated!!");
                res.redirect('/admin/cates');
            }
        }
    } catch (error) {
        console.log(error);
    }
});

router.get('/delete/:id',isAdmin,async(req,res,next) =>{
    try {
        await Category.findByIdAndRemove(req.params.id);

        const cates = await Category.find();
        req.app.locals.categories = cates;

        req.flash('success',"Category deleted!!");
        res.redirect('back')
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;