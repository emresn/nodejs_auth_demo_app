const express = require("express");
const exphbs  = require('express-handlebars');
const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require("passport");
const mongoose = require("mongoose");
const mongodbUrl = require("./controllers/mongodbUrl");
const bodyParser = require('body-parser')
const User = require("./models/User")


const app = express();
const PORT = 8080 || process.env.PORT;
const userRouter = require("./routes/users");


// Flash Middlewares
app.use(cookieParser('authdemo'));
app.use(session({cookie: {maxAge: 60000},resave: true, secret: "authdemo",saveUninitialized: true}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Global res.Locals Middleware
app.use((req,res,next)=>{
    // Our own flash
    res.locals.flashSuccess = req.flash('flashSuccess');
    res.locals.flashError = req.flash('flashError');
    // Passport flash
    res.locals.passportFailure = req.flash("error");
    res.locals.passportSuccess = req.flash("success");
    
    // Our Logged In User
    res.locals.user = req.user;
    next();
}); 


// Mongo DB connection 
mongoose.connect(mongodbUrl,{ 
    useNewUrlParser : true, useUnifiedTopology: true
});

const db = mongoose.connection;

// Template Engine MiddleWare
app.engine('handlebars', exphbs({defaultLayout:'mainLayout',handlebars: allowInsecurePrototypeAccess(Handlebars),}));
app.set('view engine', 'handlebars');
db.on("error",console.error.bind(console,"Connection Error"));
db.once("open",()=>{
    console.log("Connected to DB")
})

// BodyParser Middleware
app.use(bodyParser.urlencoded({ extended:false }));

// Router Middleware
app.use(userRouter);

app.get("/",(req,res,next)=>{
    User.find({}).then(users =>{
        res.render("pages/index",{users: users});
    }).catch(err => console.log(err));  
});



app.use((req,res,next)=>{
    res.render("static/404");
})

app.listen(PORT,()=>{
    console.log('App Started');
});
