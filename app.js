const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
const ejsMate = require("ejs-mate"); 
const User = require('./models/user.js');
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("connect-flash");

const sessionOption = {
    secret: "supersecretcode",
    resave: false,
    saveUninitialized: true
}

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));
app.use(session(sessionOption));
app.use(flash());

app.use("/", (req, res, next) => {
    res.locals.successMsg = req.flash("success");
    res.locals.failureMsg = req.flash("failure");
    if(req.session.user){
        res.locals.user = req.session.user;
    }else{
        res.locals.user = null;
    }
    next();
});

app.get("/home", (req, res) => {
    res.render("index.ejs");
});

app.get("/signup", (req, res) => {
    res.render("signup.ejs");
});

app.post('/signup', async (req, res) => {
    let {username, email, password} = req.body;
    let saltRounds = 10;
    let salt = await bcrypt.genSalt(saltRounds);
    let hashedPass = await bcrypt.hash(password, salt);
    let user = new User({
        email: email,
        username: username,
        password: hashedPass
    }); 
    await user.save();
    let loggedUser = await User.findOne({username: username});
    let result = await bcrypt.compare(password, user.password);
    req.session.user = user;
    req.flash("success", "Logged in successfully");
    return res.redirect("/home");
});

app.get("/logout", (req, res) => {
    req.session.user = null;
    req.flash("success", "Logged out successfully");
    return res.redirect('/home');
});


app.get('/login', (req, res) => {
    res.render("login.ejs")
});

app.post("/login", async (req, res) => {
    let {username, password} = req.body;
    let user = await User.findOne({username: username});
    let result = await bcrypt.compare(password, user.password);
    if(result) {
        req.session.user = user;
        req.flash("success", "Logged in successfully");
        return res.redirect("/home");
    }else{
        req.flash("failure", "Wrong credentials please login again");
        res.redirect("/login");
    }
});

app.all("*", (req, res, next) => {
    next(new Error(404, "Page not found"));
});

app.use((err, req, res, next) => {
    let {message = "Something went wroong", status = 500} = err;
    res.status(status).send(message);
});

app.listen(8080, () => {
    console.log("App is listening on port 8080");
});