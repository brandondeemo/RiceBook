const auth = require('./src/auth');
const profile = require('./src/profile');
const articles = require('./src/articles');
const following = require('./src/following');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const userSchema = require('./src/models/userSchema');
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = mongoose.model('user', userSchema);
const connectionString = 'mongodb+srv://myron-yip:YWZ378290@531db.hinyz.mongodb.net/ricebookDB?retryWrites=true&w=majority';
const corsOptions = {
    origin: 'https://wy24-final-frontend.surge.sh',
    credentials: true,
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
};

const hello = (req, res) => res.send({hello: 'world'});

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.enable('trust proxy');
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "http://localhost:8080");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
//     res.header("Access-Control-Allow-Credentials", true);
//     if (req.method === 'OPTIONS') {
//         res.sendStatus(200);
//         return;
//     }
//     else {
//         next();
//     }
// });
app.use(session({
    secret: 'doNotGuessTheSecret',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(new GoogleStrategy({
            clientID: '1094991518449-a3ec79qvcj6currdqosfk36b19mcf2nc.apps.googleusercontent.com',
            clientSecret: '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',
            callbackURL: "/auth/google/callback"
        },
        function(accessToken, refreshToken, profile, done) {
            let user = {
                /*'email': profile.emails[0].value,
                'name' : profile.name.givenName + ' ' + profile.name.familyName,
                'id'   : profile.id,*/
                'token': accessToken
            };
            // You can perform any necessary actions with your user at this point,
            // e.g. internal verification against a users table,
            // creating new user entries, etc.

            return done(null, user);
            // User.findOrCreate(..., function(err, user) {
            //     if (err) { return done(err); }
            //     done(null, user);
            // });
        })
);
// Redirect the user to Google for authentication.  When complete,
// Google will redirect the user back to the application at
//     /auth/google/callback
app.get('/auth/google', passport.authenticate('google',{ scope: ['https://www.googleapis.com/auth/plus.login'] })); // could have a passport auth second arg {scope: 'email'}

// Google will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/google/callback',
    passport.authenticate('google', { successRedirect: 'https://wy24-final-frontend.surge.sh',
        failureRedirect: '/' }));

app.get('/', hello);
auth(app);
profile(app);
articles(app);
following(app);
// app.get('/articles', getArticles);
// app.get('/articles/:id', getArticle);
// app.post('/article', addArticle);

// Get the port from the environment, i.e., Heroku sets it
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    const addr = server.address();
    console.log(`Server listening at http://${addr.address}:${addr.port}`)
});
