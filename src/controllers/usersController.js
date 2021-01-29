const usersController = {};
const passport = require('passport');
const User = require('../models/User');

usersController.renderSignUpForm = (req, res) => {
    res.render('users/signup'); // views/users/signup
};

usersController.signup = async(req, res) => {
    const errors = [];
    const { name, email, password, confirm_password } = req.body;
    if (password != confirm_password) {
        errors.push({ text: 'Las contraseñas no coinciden' });
    }
    if (password.length < 6) {
        errors.push({ text: "La contraseña debe contener al menos 6 caracteres" });
    }
    if (errors.length > 0) {
        res.render('users/signup', {
            errors
        });
    } else {
        const emailUser = await User.findOne({ email: email });
        if (emailUser) {
            req.flash('error_msg', 'El email ya está registrado');
            res.redirect('/signup');
        } else {
            const newUser = new User({ name, email, password });
            newUser.password = await newUser.encryptPassword(password);
            await newUser.save();
            req.flash('success_msg', 'Hurra! Ya estás registrado :)');
            res.redirect('/signin');
        }
    }
};

usersController.renderSignInForm = (req, res) => {
    res.render('users/signin');
};

usersController.signin = passport.authenticate('local', {
    failureRedirect: '/signin',
    successRedirect: '/songs',
    failureFlash: true
});

usersController.logout = (req, res) => {
    req.logout();
    req.flash('success_msg', 'Se ha cerrado la sesión');
    res.redirect('/signin');
}

module.exports = usersController;