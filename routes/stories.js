const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')

const Story = require('../models/Story')


// @desc    Show add page
// @route   GET /stories/add
router.get('/add', ensureAuth, (req, res) => {
    res.render('stories/add');
});

// @desc    Process add form
// @route   POST /stories
router.post('/', ensureAuth, async (req, res) => {
    try {
        const { title, body, status, guestName } = req.body;

        let story = new Story({
            title,
            body,
            status,
            guestName: guestName || 'Guest', // Use 'Guest' as default if no guest name is provided
            user: req.user.id,
        });

        story = await story.save();
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});

//@desc Showw all public stories
//@Route GET /stories
router.get('/', ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({ status: 'public' })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean()
        res.render('stories/index', {
            stories
        })
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

//@desc Show single story
//@Route GET /stories/:id
router.get('/:id', ensureAuth, async (req, res) => {
    try {
        let story = await Story.findById(req.params.id)
            .populate('user')
            .lean()

        if (!story) {
            return res.render('error/404')
        }

        res.render('stories/show', {
            story
        })
    } catch (err) {
        console.error(err)
        res.render('error/404')
    }
})


//@desc Show edit page
//@Route GET /stories/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
    try {
        const story = await Story.findOne({
            _id: req.params.id,
        }).lean()

        if (!story) {
            return res.render('error/404')
        }

        if (story.user != req.user.id) {
            res.redirect('/stories')
        } else {
            res.render('stories/edit', {
                story,
            })
        }
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
})

//@desc Update Story
//@Route PUT /stories/:id
router.put('/:id', ensureAuth, async (req, res) => {
    try {
        let story = await Story.findById(req.params.id).lean()

        if (!story) {
            return res.render('error/404')
        }

        if (story.user != req.user.id) {
            res.redirect('/stories')
        } else {
            story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
                new: true,
                runValidators: true,
            })

            res.redirect('/dashboard')
        }
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
})

//@desc Delete story
//@route DELETE /stories/:id
//!Change: .remove is depricated and needs to be replaced with .deleteOne
router.delete('/:id', ensureAuth, async (req, res) => {
    try {
        await Story.deleteOne({ _id: req.params.id });
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});


// @desc    User stories
// @route   GET /stories/user/:userId
// Cannot get this to work- fix later. cannot click on user name to see specific user's posts
router.get('/user/:userId', ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({
            user: req.params.userId,
            status: 'public',
        })
            .populate('user')
            .lean()

        res.render('stories/index', {
            stories,
        })
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})


module.exports = router;