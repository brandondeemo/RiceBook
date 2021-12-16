const mongoose = require("mongoose");
const connectionString = 'mongodb+srv://myron-yip:YWZ378290@531db.hinyz.mongodb.net/ricebookDB?retryWrites=true&w=majority';
const profileSchema = require('./models/profileSchema');
const userSchema = require('./models/userSchema');
const Profile = mongoose.model('profile', profileSchema);
const User = mongoose.model('user', userSchema);

const user = {
    username: 'myron',
    following: ['mack', 'austin']
}
const connector = mongoose.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true});

// GET /following/:user?
// payload: :user is a username.
// response: { username: :user, following: [ usernames ]}
// description: get the list of users being followed by the requested user
function getFollowed(req, res) {
    connector.then(() => {
        let query;
        if (!req.params.user) {
            query = {username: req.username};
        }
        else {
            query = {username: req.params.user};
        }
        Profile.findOne(query, function (err, profile) {
            if (err) {
                res.send(err);
            }
            else if (!profile) {
                res.sendStatus(400);
            }
            else {
                res.send({username: query.username, following: profile.followedUsers});
            }
        });
    });
}

// PUT /following/:user
// payload: :user is a username.
// response: { username: loggedInUser, following: [ usernames ]}
// description: add :user to the following list for the logged in user
function followNewUser(req, res) {
    connector.then(async () => {
        let doContinue = true;
        let myProfile;
        await Profile.findOne({username: req.username}).exec().then((profile) => {
            if (!profile) {
                res.sendStatus(400);
                doContinue = false;
            }
            else {
                myProfile = profile;
            }
        });
        if (doContinue) {
            User.findOne({username: req.params.user}, function (err, user) {
                if (err) {
                    res.send(err);
                }
                else if (!user || user.username === req.username || myProfile.followedUsers.find(name => name === req.params.user)) {
                    res.sendStatus(400);
                }
                else {
                    myProfile.followedUsers.push(req.params.user);
                    myProfile.save().then(() => {
                        res.send({username: req.username, following: myProfile.followedUsers});
                    });
                }
            });
        }
    });
}

// DEL /following/:user
// payload: :user is a username.
// response: { username: loggedInUser, following: [ usernames ]}
// description: remove :user to the following list for the logged in user
function removeFollowed(req, res) {
    connector.then(async () => {
        let myProfile;
        let doContinue = true;
        await User.findOne({username: req.params.user}).exec().then((user) => {
            if (!user || user.username === req.username) {
                res.sendStatus(400);
                doContinue = false;
            }
        });
        if (!doContinue)
            return;
        await Profile.findOne({username: req.username}).exec().then((profile) => {
            myProfile = profile;
        });
        let idx = myProfile.followedUsers.indexOf(req.params.user);
        if (idx === -1) {
            return res.sendStatus(400);
        }
        myProfile.followedUsers.splice(idx, 1);
        myProfile.save().then(() => {
            res.send({username: req.username, following: myProfile.followedUsers});
        });
    });
}

module.exports = (app) => {
    app.get('/following/:user?', getFollowed);
    app.put('/following/:user', followNewUser);
    app.delete('/following/:user', removeFollowed);
}