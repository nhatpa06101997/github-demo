const express = require('express');
const router = express.Router();

const Product = require('../model/product');

router.get('/add/:slug',async(req,res,next) =>{
    try {
        const slug = req.params.slug;
        const p = await Product.findOne({slug: slug});
        if(typeof req.session.cart == "undefined"){
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                price: parseFloat(p.price).toFixed(2),
                qty: 1,
                image: '/product_images/' + p._id + '/' + p.image
            });
        }else{
            var bool = true;
            var cart = req.session.cart;

            for(var i = 0 ; i < cart.length; i++){
                if(cart[i].title == slug){
                    cart[i].qty++;
                    bool = false;
                    break;
                }
            }if(bool){
                cart.push({
                    title: slug,
                    price: parseFloat(p.price).toFixed(2),
                    qty: 1,
                    image: '/product_images/' + p._id +'/' +p.image
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