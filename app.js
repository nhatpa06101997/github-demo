const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const expressValidator = require('express-validator');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const path = require('path');
const passport = require('passport');

const app = express();
const server = require('http').Server(app);
const io =require('socket.io')(server);
const port = process.env.PORT || 3000;

mongoose.connect('mongodb+srv://nhatpa0610:nhatpa06101997@cluster0-lfiza.mongodb.net/test7?retryWrites=true&w=majority',
{useNewUrlParser: true, useUnifiedTopology: true});

app.set('view engine','ejs');
app.use('/public',express.static('public'));
app.use(fileUpload());

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(morgan('dev'));

const Page = require('./model/page');
Page.find(function(err,pages) {
    if(err) console.log(err);
    app.locals.pages = pages;
});

const Category = require('./model/category');
Category.find(function(err,cate) {
    if(err) console.log(err);
    app.locals.categories = cate;
});

//vui ve ko quao
//vui chu
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
    // cookie: { secure: true }
}));
//này xài cho validator
app.locals.errors = null;
app.use(expressValidator({
    errorFormatter: (param, msg, value) =>{
        const namespace = param.split('.')
        ,root = namespace.shift()
        ,formParam = root;
        
        while(namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }
        return{
            param: formParam,
            msg: msg,
            value: value
        }
    },
    customValidators: {
        isImage: function(value, filename) {
            const extension = (path.extname(filename)).toLowerCase();
            switch(extension) {
                case '.jpg':
                    return ' .jpg';
                case '.jpeg':
                    return ' .jpeg';
                case '.png':
                    return ' .png';
                case '':
                    return ' .jpg';
                default:
                    return false;
            }
        }
    }
}));
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

require('./config/passport')(passport);
//middleware passport
app.use(passport.initialize());
app.use(passport.session());

app.get('*',function(req,res,next) {
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    next();
})

const pages = require('./routes/admin_pages');
const cates = require('./routes/admin_cates');
const products = require('./routes/admin_products');
const page = require('./routes/pages');
const product = require('./routes/products');
const cart = require('./routes/cart');
const user = require('./routes/user');

app.use('/',page);
app.use('/products',product);
app.use('/cart',cart);
app.use('/users',user);
app.use('/admin/pages',pages);
app.use('/admin/cates',cates);
app.use('/admin/products',products);

const users = {};

server.listen(port,()=>{
    console.log("Listening in port: ",port)
});

io.on('connection', socket =>{
    socket.on('new-user', name =>{
        users[socket.id] = name;
        socket.broadcast.emit('user-connected', name);
    });
    socket.on('send-chat-message', message =>{
        socket.broadcast.emit('chat-message', {name: users[socket.id], message: message});
    })
})
