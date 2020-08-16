const LocalStrategy = require('passport-local').Strategy;
const User = require('../model/user');
const bcrypt = require('bcryptjs');

module.exports = function(passport){
    passport.use(new LocalStrategy(function(username,password,done){
        User.findOne({username: username},(err,data) =>{
            if(err) console.log(err);

            if(!data){
                return done(null, false, {message: "No User Found!!"});
            }else{
                bcrypt.compare(password, data.password, (err,isMatch) =>{
                    if(err) console.log(err);

                    if(isMatch){
                        return done(null,data);
                    }else{
                        return done(null,false, {message: "Wrong Password!!"});
                    }
                });
            }
        });
    }));
    passport.serializeUser((user,done) =>{
        done(null, user._id);
    });

    passport.deserializeUser((id,done) =>{
        User.findById(id, (err,user) =>{
            done(err, user);
        });
    });
}