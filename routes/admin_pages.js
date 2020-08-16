const express = require('express');
const router = express.Router();
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

const Page = require('../model/page');

router.get('/',isAdmin,async(req,res,next) =>{
    try {
        const data = await Page.find();
        res.render('admin/pages',{
            pages: data
        })
    } catch (error) {
        console.log(error);
    }
});

router.get('/add',isAdmin, async(req,res,next) =>{
    try {
        res.render('admin/add_pages')
    } catch (error) {
        console.log(error);
    }
});

router.post('/add', async(req,res,next) =>{
    try {
        const title = req.body.title;
        const slug = req.body.slug;
        const content = req.body.content;

        req.checkBody('title',"Title must an value").notEmpty();
        req.checkBody('slug',"Slug must an value").notEmpty();
        req.checkBody('content',"Content must an value").notEmpty();

        const errors =await req.validationErrors();
        if(errors){
            res.render('admin/add_pages',{
                errors: errors,
                title: title,
                slug: slug,
                content: content
            });
        }else{
            const data = await Page.findOne({slug:slug});
            if(data){
                req.flash('danger',"Slug exists!");
                res.render('admin/add_pages',{
                    title: title,
                    slug: slug,
                    content: content
                });
            }else{
                const page = new Page({
                    title: title,
                    slug: slug,
                    content: content
                })
                await page.save();

                const pages = await Page.find({});
                req.app.locals.page = pages;

                req.flash('success',"Created page!!");
                res.redirect('/admin/pages');
            }
        }
    } catch (error) {
        console.log(error);
    }
});

router.get('/edit/:id',isAdmin, async(req,res,next) =>{
    try {
        const id = req.params.id;
        const data = await Page.findById(id);
        res.render('admin/edit_pages',{
            title: data.title,
            slug: data.slug,
            content: data.content,
            id: data._id
        });
    } catch (error) {
        console.log(error);
    }
});

router.post('/edit/:id', async(req,res,next) =>{
    try {
        const title = req.body.title;
        const slug = req.body.slug;
        const content = req.body.content;
        const id = req.params.id;

        req.checkBody('title',"Title must an value").notEmpty();
        req.checkBody('slug',"Slug must an value").notEmpty();
        req.checkBody('content',"Content must an value").notEmpty();

        const errors =await req.validationErrors();
        if(errors){
            res.render('admin/edit_pages',{
                errors: errors,
                title: title,
                slug: slug,
                content: content,
                id: id
            });
        }else{
            const data = await Page.findOne({slug: slug, _id: {'$ne':id}});
            if(data){
                req.flash('danger',"Slug exists!!");
                res.render('admin/edit_pages',{
                    title: title,
                    slug: "",
                    content: content,
                    id: id
                });
            }else{
                const page = await Page.findById(id);
                page.title = title;
                page.slug = slug;
                page.content = content;

                await page.save();

                const pages = await Page.find({});
                req.app.locals.page = pages;

                req.flash('success',"Page Edited!!");
                res.redirect('/admin/pages');
            }
        }
    } catch (error) {
        console.log(error);
    }
});

router.get('/delete/:id',isAdmin,async (req,res,next) =>{
    try {
        const id = req.params.id;
        await Page.findByIdAndRemove(id);

        const pages = await Page.find({});
        req.app.locals.page = pages;

        req.flash('success',"Page Deleted!");
        res.redirect('/admin/pages');    
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;