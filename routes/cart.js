const express = require('express');
const router = express.Router();

const Product = require('../model/product');
const Order = require('../model/orders');
const User = require('../model/user');

router.get('/add/:slug',async(req,res,next) =>{
    try {
        const slug  = req.params.slug;
        const data = await Product.findOne({slug:req.params.slug});
        var path;
        if(data.image == ""){
            path = ""
        }else{
            path = '/product_images/' + data._id + '/' + data.image;
        }
        if(typeof req.session.cart == "undefined"){
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                price: parseFloat(data.price).toFixed(2),
                qty: 1,
                image: path
            });
        }else{
            var bool = true;
            var cart = req.session.cart;
            for(var i =0 ;i<cart.length; i++){
                if(cart[i].title == slug){
                    cart[i].qty++;
                    bool=false;
                    break;
                }
            }if(bool){
                cart.push({
                    title: slug,
                    price: parseFloat(data.price).toFixed(2),
                    qty: 1,
                    image: '/product_images/' + data._id + '/' + data.image
                });
            }
        }
        req.flash('success',"Product added!!");
        res.redirect('back');
    } catch (error) {
        console.log(error);
    }
});

router.get('/checkout', async(req,res,next) =>{
    try {
        var cart = req.session.cart;
        
        res.render('home/checkout',{
            carts: cart,
            title: "Check out"
        });
    } catch (error) {
        console.log(error);
    }
});

router.get('/update/:slug',async(req,res,next) =>{
    try {
        const slug = req.params.slug;
        const cart = req.session.cart;
        const action = req.query.action;

        for(var i = 0 ; i < cart.length; i++){
            if(cart[i].title == slug){
                switch(action){
                    case "add":
                        cart[i].qty++;
                        break;
                    case "remove":
                        cart[i].qty--;
                        if(cart[i].qty < 1){
                            cart.splice(i,1)
                        }
                        break;
                    case "clear":
                        cart.splice(i,1);
                        if(cart.length == 0){
                            delete cart;
                        }
                        break;
                    default:
                        break;
                }
                break;
            }
        }
        req.flash('success',"Cart Updated!")
        res.redirect('back')
    } catch (error) {
        console.log(error);
    }
});

router.get('/buynow',async(req,res,next) =>{
    try {
        const userId = req.user._id;
        const cart = req.session.cart
        
        const user = await User.findById(userId);
        if(!user){  
            req.flash('danger',"User not found!!");
            res.redirect('/')
        }else{
            const order = new Order({
                userId: userId,
                time: new Date()
            });
            for(var i=0 ; i<cart.length; i++){
                const p = await Product.findOne({title: cart[i].title});
                if(!p){
                    req.flash('danger',"Product not found!!");
                    res.redirect('/')
                }else{
                    order.orders.push({
                        productId: p._id,
                        carts: {
                            title: cart[i].title,
                            price: cart[i].price,
                            qty: cart[i].qty,
                            image: cart[i].image
                        }
                    })
                }
            }

            await order.save();
            req.flash('success',"Success!!");
            res.redirect('/')
            
        }
    } catch (error) {
        console.log(error)
    }
})

router.get('/clear', async(req,res,next) =>{
    try {
        delete req.session.cart;

        req.flash('success',"Cart deleted!!");
        res.redirect('back')
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;