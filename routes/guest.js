const express = require('express');
const router = express.Router();
const { ensureAuth, ensureGuest } = require('../middleware/auth');
const User = require('../models/User');
const Story = require('../models/Story');

// @desc    Guest login option
// @route   GET /guest
router.get('/', ensureGuest, (req, res) => {
    const username = 'Guest_' + Math.floor(Math.random() * 1000000); // Generate a random username for the guest user
    const newGuestUser = new User({ username }); // Create a new guest user with the generated username
    req.logIn(newGuestUser, function (err) {
        if (err) {
            console.error(err);
            return res.render('error/500');
        }
        return res.redirect('/guest/dashboard'); // Redirect the guest user to the guest dashboard
    });
});

// @desc    Guest dashboard
// @route   GET /guest/dashboard
router.get('/dashboard', ensureGuest, async (req, res) => {
    try {
        const stories = await Story.find({ status: 'public' })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean();
        res.render('guest/dashboard', {
            username: req.user.username,
            stories,
        });
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});

module.exports = router;


