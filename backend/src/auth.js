const md5 = require('md5');
const mongoose = require("mongoose");
const userSchema = require("./models/userSchema");
const profileSchema = require("./models/profileSchema");
const sessionSchema = require('./models/sessionSchema');
const redis = require('redis').createClient('redis://:p557f73ee0f62d8dd83bc8c2a6d7227fea55c17a248f4cbd11efbab3e705d2267@ec2-54-243-122-140.compute-1.amazonaws.com:24279');
const connectionString = 'mongodb+srv://myron-yip:YWZ378290@531db.hinyz.mongodb.net/ricebookDB?retryWrites=true&w=majority';
const User = mongoose.model('user', userSchema);
const Profile = mongoose.model('profile', profileSchema);
const Session = mongoose.model('session', sessionSchema);
const cookieKey = 'sid';
const connector = mongoose.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true});

// let sessionUser = {};
// let nextId = 0;
// let userObjs = {};

function isLoggedIn(req, res, next) {
    // likely didn't install cookie parser
    if (!req.cookies) {
        return res.sendStatus(401);
    }
    let sid = req.cookies[cookieKey];
    // no sid for cookie key
    if (!sid) {
        return res.sendStatus(401);
    }
    connector.then(async () => {
        redis.hmget("sessions", sid, function (err, val) {
            if (err) {
                return res.send(err);
            }
            if (val.length === 0) {
                Session.findOne({sessionKey: sid}, function (err, session) {
                    if (err) {
                        return res.send(err);
                    }
                    if (session && session.username) {
                        redis.hmset("sessions", sid, session.username);
                        req.username = session.username;
                        next();
                    } else {
                        return res.sendStatus(401);
                    }
                });
            }
            else {
                req.username = val[0];
                next();
            }
        })
    });

    // let username = sessionUser[sid];
    //
    // // no username mapped to sid
    // if (username) {
    //     req.username = username;
    //     next();
    // }
    // else {
    //     return res.sendStatus(401);
    // }
}


// POST /login
// payload: {username: user, password: password }
// response: { username: user, result: "success"}
// description: log in to server, sets session id and hash cookies
function login(req, res) {
    let username = req.body.username;
    let password = req.body.password;
    // supply username and password
    if (!username || !password) {
        res.sendStatus(400);
    } else {
        let newSession;
        let sessionKey;
        let msg;
        connector.then(() => {
            User.findOne({username: username}, function (err, user) {
                if (err) {
                    msg = err;
                } else if (!user) {
                    msg = {username: username, result: "Username doesn't exist!"};
                } else {
                    let hash = md5(user.salt + password);
                    if (user.hash === hash) {
                        sessionKey = md5("ricebook" + new Date().getTime() + user.username);
                        newSession = new Session({
                            sessionKey: sessionKey,
                            username: username
                        });
                        newSession.save();
                        redis.hmset('sessions', sessionKey, username);
                        msg = {username: username, result: 'success'};
                        res.cookie(cookieKey, sessionKey, {maxAge: 3600 * 1000, httpOnly: true, sameSite: 'None', secure: true});
                    } else {
                        msg = {username: username, result: "Password isn't correct!"};
                    }
                }
                res.send(msg);
            })
        });
    }
    // let user = userObjs[username];

    // if (!user) {
    //     return res.sendStatus(401)
    // }
    //
    // // create hash using md5, user salt and request password, check if hash matches user hash
    // let hash = md5(user.salt + password);
    //
    // if (hash === user.hash) {
    //     // create session id, use sessionUser to map sid to user username
    //     let sid = nextId;
    //     ++nextId;
    //     sessionUser[sid] = user.username;
    //     redis.hmset('sessions', sid, JSON.stringify(user));
    // // Adding cookie for session id
    //     res.cookie(cookieKey, sid, { maxAge: 3600 * 1000, httpOnly: true });
    //     let msg = {username: username, result: 'success'};
    //     res.send(msg);
    // }
    // else {
    //     res.sendStatus(401);
    // }
}

// POST /register
// payload: { username, email, dob, zipcode, password}
// response: { result: 'success', username: username}
// description: register a new user with the system
function register(req, res) {
    if (!req.body.username || !req.body.email || !req.body.dob || !req.body.zipcode || !req.body.password) {
        res.sendStatus(400);
    } else {
        (async () => {
            let newUser;
            let newProfile;
            let doSucceed = true;
            await (connector.then(async () => {
                await User.findOne({username: req.body.username}).exec().then((user) => {
                    if (user) {
                        res.send({result: "Username has been used!", username: req.body.username});
                        doSucceed = false;
                    }
                });
                if (doSucceed) {
                    let salt = req.body.username + new Date().getTime();
                    newUser = new User({
                        username: req.body.username,
                        salt: salt,
                        hash: User.getHash(req.body.password, salt)
                    });
                    newProfile = new Profile({
                        username: req.body.username,
                        email: req.body.email,
                        zipcode: req.body.zipcode,
                        dob: req.body.dob,
                    });
                    newUser.save();
                    newProfile.save();
                }
            }));
            if (doSucceed) {
                let msg = {result: 'success', username: req.body.username};
                res.send(msg);
            }
        })();
    }
    // let salt = username + new Date().getTime();
    // let hash = md5(salt + password);

    // userObjs[username] =  {
    //     username: username,
    //     salt: salt,
    //     hash: hash
    // } // Change this to store object with username, salt, hash
    //
    // let msg = {username: username, result: 'success'};
    // res.send(msg);
}

// PUT /logout
// payload: none
// response: OK
// description: log out of server, clears session id
function logout(req, res) {
    (async () => {
        await connector;
        await Session.deleteMany({username: req.username});
        await redis.hdel('sessions', req.cookies[cookieKey]);
        res.clearCookie(cookieKey);
        res.sendStatus(200);
    })();
}

// PUT /password
// payload: { password: newPassword }
// response: { username: loggedInUser, result: 'success' }
// description: Changes the password for the logged in user.
function updatePassword(req, res) {
    connector.then(async () => {
        let userInfo;
        await User.findOne({username: req.username}).exec().then(user => userInfo = user);
        let newHash = User.getHash(req.body.password, userInfo.salt);
        if (newHash === userInfo.hash) {
            res.send({username: req.username, result: 'New password is the same as the old one!'});
        }
        else {
            userInfo.hash = newHash;
            userInfo.save().then(() => {
                res.send({username: req.username, result: 'success'});
            })
        }
    });
}

module.exports = (app) => {
    app.post('/login', login);
    app.post('/register', register);
    app.use(isLoggedIn);
    app.put('/logout', logout);
    app.put('/password', updatePassword);
}

