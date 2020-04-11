const bcrypt = require('bcrypt');
const knex = require('../../../../database/knex');
const { validationResult } = require('express-validator');
const slugify = require('slugify');
// Render
const loginRender = (req, res) => {
    return res.render('admin/pages/Login', {
        title: 'Login',
    });
};
const registerRender = (req, res) => {
    return res.render('admin/pages/register', {
        title: 'Register',
        errors: '',
    });
};
const homepageRender = (req, res) => {
    const usernow = req.session.user;
    return res.render('admin/pages/index', {
        title: 'Home',
        usernow: usernow,
    });
};
const dashboardRender = (req, res) => {
    const usernow = req.session.user;
    return res.render('admin/pages/dashboard', {
        title: 'Dashboard',
        usernow: usernow,
    });
};
//Method
const loginMethod = async (req, res) => {
    const errors = validationResult(req);
    console.log(errors.array());
    const { email, password } = req.body;
    const user = await knex('users')
        .where({
            email: email,
        })
        .select('*')
        .first();
    if (user) {
        var result = bcrypt.compare(password, user.password);
        if (!result) {
            req.flash('error', 'Wrong password');
            return res.render('admin/pages/login', {
                title: ' Log in',
                errors: errors.array(),
                messages: '',
            });
        } else {
            req.session.user = user;
            console.log(user);
            return res.redirect('/admin/users');
        }
    } else {
        req.flash('error', 'Email is not exist');
        console.log(errors.array());
        return res.render('admin/pages/login', {
            title: 'login',
            errors: errors.array(),
            messages: '',
        });
    }
};

const registerMethod = async (req, res, next) => {
    const { email, password, fullname, username } = req.body;
    console.log(validationResult(req));
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     console.log(errors.array());
    //     console.log('dki lỗi')
    //     return res.render('admin/pages/register', {
    //         title: 'register',
    //         errors: errors.array(),
    //     });
    // } else {
    console.log('dki oke');
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await knex('users').insert({
        fullname: fullname,
        username: username,
        email: email,
        password: hashedPassword,
        user_slug: slugify(email),
    });
    //Success Message
    req.flash('success', 'Log in now');
    return res.redirect('/admin/login');
    //     }
};
const logoutMethod = async (req, res) => {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/admin/login');
        }
    });
};

module.exports = {
    loginRender,
    registerRender,
    homepageRender,
    dashboardRender,
    loginMethod,
    registerMethod,
    logoutMethod,
};
