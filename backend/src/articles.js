const articleSchema = require('./models/articleSchema');
const userSchema = require('./models/userSchema');
const profileSchema = require('./models/profileSchema');
const mongoose = require('mongoose');
const Article = mongoose.model("article", articleSchema);
const User = mongoose.model("user", userSchema);
const Profile = mongoose.model("profile", profileSchema);
const uploadImage = require('./uploadCloudinary');
const connectionString = 'mongodb+srv://myron-yip:YWZ378290@531db.hinyz.mongodb.net/ricebookDB?retryWrites=true&w=majority';
const connector = mongoose.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true});


function getUserFeed(req, res) {
    connector.then(() => {
        Profile.findOne({username: req.username}).exec().then(profile => {
            let usersToQuery = [req.username, ...profile.followedUsers];
            Article.aggregate([
                {$match: {author: {$in: usersToQuery}}},
                {$project: {author: 1, text: 1, date: 1, comments: 1, pid: 1, _v: 1, image: 1, _id: 1}},
                {$sort: {"date": -1}},
                {$limit: 10}
            ])
                .exec().then(articles => {
                res.send({articles: articles});
            })
        });
    });
}

// GET /articles/:id?
// payload: If specified, :id is a post id or username
// response: { articles: [ { _id: 1, author: loggedInUser, ... }, { ... } ] }
// description: A requested article, all requested articles by a user, or array of articles in the loggedInUser's feed
function getArticles(req, res) {
    connector.then(async () => {
        if (!req.params.id) {
            Article.find({author: req.username}, function (err, articles) {
                if (err) {
                    res.send(err);
                }
                else {
                    res.send({articles: articles});
                }
            });
        } else {
            if (isNaN(req.params.id)) {
                let doExist = true;
                let targetUser = User.findOne({username: req.params.id}).exec();
                await targetUser.then(user => {
                    if (!user) {
                        res.sendStatus(400);
                        doExist = false;
                    }
                })
                if (doExist) {
                    Article.find({author: req.params.id}, function (err, articles) {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            res.send({articles: articles});
                        }
                    });
                }
            } else {
                Article.find({pid: req.params.id}, function (err, articles) {
                    if (err) {
                        res.send(err);
                    }
                    else if (articles.length === 0) {
                        res.sendStatus(400);
                    }
                    else {
                        res.send({articles: articles});
                    }
                });
            }
        }
    });
}

// PUT /articles/:id
// payload: :id is a post id
// { text: message, commentId: optional }
// response: { articles: [{ _id: 1, author: loggedInUser, ..., comments: [ ... ] }]
// description: Update the article :id with a new text if commentId is not supplied.
// Forbidden if the user does not own the article. If commentId is supplied, then update the requested comment on the article, if owned.
// If commentId is -1, then a new comment is posted with the text message.

// commentId, pid start from 1;
function updateArticle(req, res) {
    if (!req.body.text) {
        res.sendStatus(400);
    } else {
        (async () => {
            let oldArticle;
            await connector.then(async () => {
                await Article.findOne({pid: req.params.id}).exec().then((article) => {
                    oldArticle = article;
                });
                if (!oldArticle) {
                    return res.sendStatus(400);
                }
                if (req.body.commentId === undefined) {
                    if (oldArticle.author !== req.username) {
                        res.sendStatus(403);
                    } else {
                        await Article.updateOne({pid: req.params.id}, {text: req.body.text});
                        Article.find({author: req.username}, function (err, articles) {
                            if (err) {
                                res.send(err);
                            } else {
                                res.send({articles: articles});
                            }
                        });
                    }
                } else {
                    let newComments;
                    let doSucceed = true;
                    if (req.body.commentId === -1) {
                        newComments = Array.from(oldArticle.comments);
                        newComments.push({text: req.body.text, author: req.username});
                    } else {
                        newComments = Array.from(oldArticle.comments);
                        if (req.body.commentId - 1 >= newComments.length || req.body.commentId - 1 < 0) {
                            res.sendStatus(400);
                            doSucceed = false;
                        } else if (newComments[req.body.commentId - 1].author !== req.username) {
                            res.sendStatus(403);
                            doSucceed = false;
                        } else {
                            newComments[req.body.commentId - 1].text = req.body.text;
                        }
                    }
                    if (doSucceed) {
                        await Article.updateOne({pid: req.params.id}, {comments: newComments});
                        Article.find({}, function (err, articles) {
                            if (err) {
                                res.send(err);
                            } else {
                                res.send({articles: articles});
                            }
                        });
                    }
                }
            })
        })();
    }

}


// POST /article
// payload: { text: message } image is optional
// response: { articles: [{ _id: 1, author: loggedInUser, ..., comments: [] } ]}
// description: Add a new article for the logged in user, date and id are determined by server.
function addArticle(req, res) {
    if (!req.body.text) {
        res.sendStatus(400);
    } else {
        (async () => {
            let newArticle;
            await connector.then(() => {
                if (!req.fileurl) {
                    newArticle = new Article({
                        text: req.body["text"],
                        author: req.username,
                        date: new Date()
                    })
                }
                else {
                    newArticle = new Article({
                        text: req.body["text"],
                        author: req.username,
                        image: req.fileurl,
                        date: new Date()
                    });
                }
                newArticle.save().then(() => {
                    Article.find({author: req.username}, (err, articles) => {
                        if (err) {
                            res.send(err);
                        } else {
                            res.send({articles: articles});
                        }
                    })
                });
            });
        })();
    }
}

module.exports = (app) => {
    app.get('/articles/:id?', getArticles);
    app.put('/articles/:id', updateArticle);
    //app.post('/article', addArticle);
    app.get('/feed', getUserFeed);
    app.post('/article', uploadImage('title'), addArticle);
}