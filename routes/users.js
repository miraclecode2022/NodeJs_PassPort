const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticated } = require('../config/auth');

//User Model
const User = require('../models/User')
//Login page
router.get('/login', (req,res) => res.render('login'));
//Register page
router.get('/register', (req,res) => res.render('register'));

//Register Handle
router.post('/register', (req, res) => {
    const {name,email,password, password2 } = req.body;
    let errors = [];

    // Check require fields
    if (!name | !email | !password | !password2 ){
        errors.push({ msg: "Please fill in all fields" });
    }

    // Check password match
    if(password !== password2) {
        errors.push({ msg : "Passwords do not match"});
    }

    // Check pass length
    if(password.legh < 6 ){
        errors.push({ msg: "Password should be at least 8 characters"});
    }

    if(errors.length > 0){
        res.render('register',{
            errors,
            name,
            email,
            password,
            password2
        });
    }else {
        User.findOne({email : email})
            .then(user => {
                if(user){
                    // User exists
                    errors.push({ msg : "Email is already registerd"})
                    res.render('register',{
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                }else{
                    const NewUser = new User({
                        name,
                        email,
                        password,
                    });
                    // Hash Password
                    bcrypt.genSalt(10, (err, salt) => bcrypt.hash(NewUser.password, salt, (err,hash) => {
                        if(err) throw err;
                        // Set password to hashed
                        NewUser.password = hash;
                        // Save user
                        NewUser.save()
                            .then(user => {
                                req.flash('success_msg', 'You are now registed can login now');
                                res.redirect('/users/login');
                            })
                            .catch(err => console.log(err));
                    }))
                }

            });
    }
});

// Login handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});
// Logout handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;