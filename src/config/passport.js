const passport = require('passport');
const User = require('../models/User');
const LocalStrategy = require('passport-local').Strategy;
require('../models/User');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async(email, password, done) => {
    // Coincide el correo?
    const user = await User.findOne({ email });
    if (!user) {
        return done(null, false, { message: 'No se encontró el usuario' });
    } else {
        // Coincide la contraseña?
        const match = await user.matchPassword(password);
        if (match) {
            return done(null, user);
        } else {
            return done(null, false, { message: 'Clave incorrecta' });
        }
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    })
});