// this is profile.js which contains all user profile
// information except passwords which is in auth.js
const profileSchema = require('./models/profileSchema');
const mongoose = require("mongoose");
const Profile = mongoose.model('profile', profileSchema);
const connectionString = 'mongodb+srv://myron-yip:YWZ378290@531db.hinyz.mongodb.net/ricebookDB?retryWrites=true&w=majority';
const uploadImage = require('./uploadCloudinary');
const connector = mongoose.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true});

// GET /avatar/:user?
// payload: :user is a username
// response: { username: user, avatar: picture url }
// description: get the avatar for the requested user
function getAvatar(req, res) {
    connector.then(() => {
        let username = req.params.user ? req.params.user : req.username;
        Profile.findOne({username: username}).exec().then(profile => {
            if (!profile) {
                res.sendStatus(400);
            }
            else {
                res.send({username: profile.username, avatar: profile.avatar});
            }
        });
    })
}

// PUT /avatar
// payload: see api spec
// response: { username: loggedInUser, avatar: picture }
// description: Update the avatar for the logged in user.
function updateAvatar(req, res) {
    connector.then(() => {
        Profile.findOneAndUpdate({username: req.username}, {avatar: req.fileurl}, {returnDocument: 'after'}).exec().then(profile => {
            res.send({username: req.username, avatar: profile.avatar});
        });
    });
}

// PUT /headline
// payload: { headline: Happy }
// response: { username: loggedInUser, headline: Happy }
// description: Update the headline for the logged in user
function updateHeadline(req, res) {
    if (!req.body.headline) {
        res.sendStatus(400);
    } else {
        (async () => {
            await connector;
            await Profile.updateOne({username: req.username}, {headline: req.body.headline});
            res.send({
                username: req.username,
                headline: req.body.headline
            });
        })();
    }
}

// GET /headline/:user?
// payload: :user is a username
// response: { username:user, headline:Happy}
// description: Get the headline for a user
function getHeadline(req, res) {
    let username = req.params.user ? req.params.user : req.username;
    connector.then(() => {
        Profile.findOne({username: username}, function (err, profile) {
            if (err) {
                return res.send(err);
            }
            if (!profile) {
                return res.sendStatus(400);
            }
            res.send({
                username: profile.username,
                headline: profile.headline
            });
        })
    });
}

// GET /email/:user?
// payload: :user is a username
// response: { username: :user, email: emailAddress }
// description: get the email address for the requested user
function getEmail(req, res) {
    connector.then(() => {
        let username = req.params.user ? req.params.user : req.username;
        Profile.findOne({username: username}).exec().then(profile => {
            if (!profile) {
                res.sendStatus(400);
            }
            else {
                res.send({username: profile.username, email: profile.email});
            }
        });
    });
}

// PUT /email
// payload: { email: newEmailAddress }
// response: { username: loggedInUser, email: newEmailAddress }
// description: update the email address for the logged in user
function updateEmail(req, res) {
    connector.then(() => {
        Profile.findOne({username: req.username}).exec().then(profile => {
            if (profile.email === req.body.email) {
                res.sendStatus(400);
            }
            else {
                profile.email = req.body.email;
                profile.save().then(() => {
                    res.send({username: req.username, email: profile.email});
                })
            }
        })
    });
}

// GET /dob/:user?
// payload: dob: date of birth
// response: { username: :user, dob: milliseconds }
// description: get the date of birth in milliseconds for the requested user
function getDoB(req, res) {
    connector.then(() => {
        let username = req.params.user ? req.params.user : req.username;
        Profile.findOne({username: username}).exec().then(profile => {
            if (!profile) {
                res.sendStatus(400);
            }
            else {
                res.send({username: profile.username, dob: profile.dob});
            }
        });
    });
}

// GET /zipcode/:user?
// payload: :user is a username
// response: { username: :user, zipcode: zipcode }
// description: get the zipcode for the requested user
function getZipcode(req, res) {
    connector.then(() => {
        let username = req.params.user ? req.params.user : req.username;
        Profile.findOne({username: username}).exec().then(profile => {
            if (!profile) {
                res.sendStatus(400);
            }
            else {
                res.send({username: profile.username, zipcode: profile.zipcode});
            }
        });
    });
}

// PUT /zipcode
// payload: { zipcode: newZipCode }
// response: { username: loggedInUser, zipcode: newZipCode }
// description: update the zipcode for the logged in user
function updateZipcode(req, res) {
    connector.then(() => {
        Profile.findOne({username: req.username}).exec().then(profile => {
            if (profile.zipcode === req.body.zipcode) {
                res.sendStatus(400);
            }
            else {
                profile.zipcode = req.body.zipcode;
                profile.save().then(() => {
                    res.send({username: req.username, zipcode: profile.zipcode});
                })
            }
        })
    });
}

function getProfile(req, res) {
    connector.then(() => {
        Profile.findOne({username: req.username}).exec().then(profile => {
            res.send({
                username: profile.username,
                headline: profile.headline,
                email: profile.email,
                zipcode: profile.zipcode,
                dob: profile.dob,
                avatar: profile.avatar
            });
        })
    })
}

module.exports = (app) => {
    app.get("/avatar/:user?", getAvatar);
    //app.put("/avatar", updateAvatar);
    app.put('/headline', updateHeadline);
    app.get('/headline/:user?', getHeadline);
    app.get('/email/:user?', getEmail);
    app.put('/email', updateEmail);
    app.get('/dob/:user?', getDoB);
    app.get('/zipcode/:user?', getZipcode);
    app.put('/zipcode', updateZipcode);
    app.get('/profile', getProfile);
    app.put('/avatar', uploadImage('title'), updateAvatar);
}