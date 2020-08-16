const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

const User = require('../model/user');

router.get('/register',async(req,res,next) =>{
    try {
        res.render('home/register',{title: "Register"});
    } catch (error) {
        console.log(error);
    }
});

router.post('/register', async(req,res,next) =>{
    try {
        const name = req.body.name;
        const email = req.body.email;
        const username = req.body.username;
        const password = req.body.password;
        const password2 = req.body.password2;
        var admin;

        req.checkBody('name',"Name must an value").notEmpty();
        req.checkBody('email',"Email must an value").isEmail();
        req.checkBody('username',"Username must an value").notEmpty();
        req.checkBody('password',"Password must an value").notEmpty();
        req.checkBody('password2',"Password don't match").equals(password);

        const errors = req.validationErrors();
        if(errors){
            res.render('home/register',{
                errors: errors,
                user: null,
                title: "Register"
            })
        }else{
            const data = await User.findOne({username: username});
            if(data){
                req.flash('danger',"Username exists!!");
                res.render('home/register',{
                    user:null,
                    title: "Register"
                })
            }else{
                const user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    admin: admin
                });
                if(user.name && user.username == "admin"){
                    admin = 1;
                    user.admin = admin;
                }else{
                    admin = 0;
                    user.admin = admin;
                };
                const hash = await bcrypt.hash(password,10);
                user.password = hash;
                await user.save();
                req.flash('success',"User created!!");
                res.redirect('/users/login');
            }
        }
    } catch (error) {
        console.log(error);
    }
});

router.get('/login',async(req,res,next) =>{
    try {
        if(res.locals.user) res.redirect('/');
        res.render('home/login',{
            title: "Login"
        })
    } catch (error) {
        console.log(error);
    }
});

router.post('/login',async(req,res,next) =>{
    try {
        await passport.authenticate('local',{
            successRedirect: "/",
            failureRedirect: "/users/login",
            failureFlash: true
        })(req,res,next);
    } catch (error) {
        console.log(error);
    }
});

router.get('/logout',async(req,res,next) =>{
    try {
        req.logout();
        req.flash('success',"You are log out");
        res.redirect('/');
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;