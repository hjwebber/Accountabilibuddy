const path = require('path')
const express = require('express')
//!Change: Mongoose is not longer required
//const mongoose= require('mongoose)
const dotenv = require('dotenv')
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override')
const passport = require('passport');
const session = require('express-session')
//!Change: MongoStore does not require (session) 
const MongoStore = require('connect-mongo')//(session)
const connectDB = require('./config/db')
const guestRoute = require('./routes/guest');
const User = require('./models/User');

const username = 'Guest_' + Math.floor(Math.random() * 1000000); // Generate a random username for the guest user
const newGuestUser = new User({ username }); // Create a new guest user with the generated username
newGuestUser.save(); // Save the new guest user to the database


//Load config
dotenv.config({ path: './config/config.env' })

//Passport config
require('./config/passport')(passport)

connectDB()

const app = express()

//Body Parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

//Method Override for PUT
app.use(
    methodOverride(function (req, res) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
            // look in urlencoded POST bodies and delete it
            let method = req.body._method
            delete req.body._method
            return method
        }
    })
)

//logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

//HELPERS
const { formatDate, stripTags, truncate, editIcon, select } = require('./helpers/hbs')

//Handlebars
app.engine(
    '.hbs',
    //!Change: add '.engine' after exphbs
    exphbs.engine({
        helpers: {
            formatDate,
            stripTags,
            truncate,
            editIcon,
            select
        },
        defaultLayout: 'main',
        extname: '.hbs'
    })
);
app.set('view engine', '.hbs');

//Sessions
app.use(
    session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        //!Change: MongoStore syntax has changed
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI
        })
    })
)

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//set global variable
app.use(function (req, res, next) {
    res.locals.user = req.user || null
    next()
})

//Static folder
app.use(express.static(path.join(__dirname, 'public')))

//Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))
app.use('/guest', guestRoute);



// Create new guest user if user is not authenticated
guestRoute.use(async (req, res, next) => {
    if (!req.user) {
        try {
            const username = 'Guest_' + Math.floor(Math.random() * 1000000);
            const newGuestUser = new User({ username });
            await newGuestUser.save()
            req.user = newGuestUser;
            next();
        } catch (err) {
            next(err);
        }
    } else {
        next();
    }
});

app.use('/guest', guestRoute);

const PORT = process.env.PORT || 3000

app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} node on port ${PORT}`)
)
