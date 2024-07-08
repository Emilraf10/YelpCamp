if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}



const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./Utilitys/ExpressError');
const mongoose = require('mongoose');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const campgroundRoute = require('./routes/campgrounds'); 
const reviewRoute = require('./routes/reviews');
const userRoutes = require('./routes/users');
const MongoStore = require('connect-mongo');
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';

// 

mongoose.connect(dbUrl) //Aqui conectamos a nuestra base de datos y definimos el nombre que tendra.
    .then(() => {
        console.log("Mongo Connection Open"); //codigo para confirmar que todo funciona
    })
    .catch((err) => {
        console.log("Oh no, Mongo connection error :("); //codigo en caso de algun error
        console.log(err);
    })

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})    

app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views')); //Colocamos el directorio donde buscar nuestros archivos EJS
app.set('view engine', 'ejs'); //Definimos que queremos trabajar con formato .ejs

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method')); //Nos permite enviar forms con otros verbos hhtp que no sean get y post.
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

const secret = process.env.SECRET || 'secret'

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600,
    crypto: {
        secret
    }
});

store.on("error", function(e) {
    console.log("Session Store Error", e);
});

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [

    "https://api.maptiler.com/", // add this
];

const fontSrcUrls = [];
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        objectSrc: [],
        imgSrc: [
            "'self'",
            "blob:",
            "data:",
            `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
            "https://images.unsplash.com/",
            "https://api.maptiler.com/"
        ],
        fontSrc: ["'self'", ...fontSrcUrls],
    }
}))

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {

    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoute);
app.use('/campgrounds/:id/reviews', reviewRoute); //En este caso, tenemos el id prefijado en nuestra ruta del router, pero entonces eso 
//significa que no tenemos el id definido, es decir, que debemos hacer lo que dice la nota en el archivo reviews.js de las routes.


app.get('/', (req, res) => {
    res.render("home");
})

app.all('*', (req, res, next) => {
    next(new ExpressError('PAGE NOT FOUND', 404));
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error', {err});
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
})