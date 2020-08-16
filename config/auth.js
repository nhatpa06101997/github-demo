exports.isAdmin = (req,res,next) =>{
    if(req.isAuthenticated() && res.locals.user.admin == 1){
        next();
    }else{
        req.flash('danger',"Please login as admin");
        res.redirect('/users/login')
    }
}