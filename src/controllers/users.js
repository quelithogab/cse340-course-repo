import bcrypt from 'bcrypt';

import { createUser, authenticateUser } from '../models/users.js';

const showUserRegistrationForm = (req, res) => {
    res.render('register', { title: 'Register', flash: req.flash() });
};

const processUserRegistrationForm = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await createUser(name, email, passwordHash);

        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/');
    } catch (error) {
        console.error('Error registering user:', error);
        req.flash('error', 'An error occurred during registration. Please try again.');
        res.redirect('/register');
    }
};

const showLoginForm = (req, res) => {
    res.render('login', { title: 'Login', flash: req.flash() });
};

const processLoginForm = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await authenticateUser(email, password);

        if (user) {
            req.session.user = user;
            req.flash('success', 'Login successful!');
            console.log('User logged in:', user);
            res.redirect('/dashboard');
        } else {
            req.flash('error', 'Invalid email or password.');
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Error during login:', error);
        req.flash('error', 'An error occurred during login. Please try again.');
        res.redirect('/login');
    }
};

const processLogout = async (req, res, next) => {
    if (!req.session) {
        return res.redirect('/login');
    }

    req.session.regenerate((regenerateError) => {
        if (regenerateError) {
            return next(regenerateError);
        }

        req.flash('success', 'Logout successful!');
        res.redirect('/login');
    });
};

const requireLogin = (req, res, next) => {
    if (!req.session || !req.session.user) {
        req.flash('error', 'You must be logged in to access that page.');
        return res.redirect('/login');
    }

    next();
};

const requireRole = (roleName) => {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            req.flash('error', 'You must be logged in to access that page.');
            return res.redirect('/login');
        }

        if (req.session.user.role_name !== roleName) {
            req.flash('error', 'You do not have permission to access that page.');
            return res.redirect('/');
        }

        next();
    };
};

const showDashboard = (req, res) => {
    const user = req.session.user;
    res.render('dashboard', {
        title: 'Dashboard',
        name: user.name,
        email: user.email
    });
};

const showAdminDashboard = (req, res) => {
    const user = req.session.user;
    res.render('admin', {
        title: 'Admin Dashboard',
        name: user.name,
        email: user.email
    });
};

export {
    showUserRegistrationForm,
    processUserRegistrationForm,
    showLoginForm,
    processLoginForm,
    processLogout,
    requireLogin,
    requireRole,
    showDashboard,
    showAdminDashboard
};
