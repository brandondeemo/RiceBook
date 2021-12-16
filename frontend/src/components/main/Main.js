import React from "react";
import Posts from "./posts/Posts";
import {Alert, Avatar, Chip, TextField} from "@mui/material";
import Button from "@mui/material/Button";
//import img from "../../assets/images/avatar.jpg";
import {
    changeHeadline,
    fetchRequiredPosts,
    fetchUsers,
    followNewFriend,
    getFilteredPosts,
    sendNewPostBody, setAvatar, setExpired, setFeed, setFollowedUsers, setPosted, setUserAuthentication
} from "../../action";
import {connect} from "react-redux";
import FollowingList from "./FollowingList";
import {withRouter} from "react-router-dom";

class FollowArea extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            message: ""
        }
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    handleInputChange(event) {
        this.setState({username: event.target.value});
    }

    handleClick() {
        this.props.followNewFriend(this.state.username);
        fetch(`https://wy24-final-server.herokuapp.com/following/${this.state.username}`, {
            method: 'put',
            mode: 'cors',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'}
        }).then(res => {
            if (res.statusText === "Bad Request") {
                this.setState({message: "Username entered is either yourself or has been followed or doesn't exist!"});
                return;
            }
            return res.json();
        }).then(res => {
            if (res) {
                this.props.setFollowedUsers(res.following);
                this.setState({message: ""});
                fetch("https://wy24-final-server.herokuapp.com/feed", {
                    method: 'get',
                    mode: 'cors',
                    credentials: 'include',
                }).then(res => res.json()).then(res => {
                    this.props.setFeed(res.articles);
                });
            }
        });
    }

    render() {
        return (
            <div>
                <h2>Follow New Friends</h2>
                <TextField
                    label="Username"
                    id="outlined-size-small"
                    size="small"
                    onChange={this.handleInputChange}
                />
                <Button onClick={this.handleClick} variant={"outlined"}>Follow</Button>
                {this.state.message &&
                <Alert variant="outlined" severity="error">
                    {this.state.message}
                </Alert>
                }
            </div>
        );
    }
}


class NewPost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: "",
            file: "",
            message: ""
        }
        this.handleClick = this.handleClick.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleImageChange = this.handleImageChange.bind(this);
    }

    handleImageChange(event) {
        this.setState({file: event.target.files[0]});
    }

    handleClick() {
        const fd = new FormData();
        //fd.append("title", localStorage.getItem("username"));
        fd.append("image", this.state.file);
        fd.append("text", this.state.text);
        fetch("https://wy24-final-server.herokuapp.com/article", {
            method: 'post',
            mode: 'cors',
            credentials: 'include',
           // headers: {'Content-Type': 'application/json'},
            body: fd
        }).then(res => {
            if (res.statusText === "Bad Request") {
                this.setState({message: "Content cannot be empty!"});
                return;
            }
            fetch("https://wy24-final-server.herokuapp.com/feed", {
                method: 'get',
                mode: 'cors',
                credentials: 'include',
            }).then(res => res.json()).then(res => {
                this.props.setFeed(res.articles);
            });
        });

       // this.props.sendNewPostBody(this.state.text);
    }

    handleInputChange(event) {
        this.setState({text: event.target.value});
    }

    render() {
        return (
            <div>
                <h2>Post What You Like</h2>
                <TextField
                    value={this.state.text}
                    id="outlined-multiline-static"
                    label=""
                    multiline
                    rows={4}
                    onChange={this.handleInputChange}
                /><br/>
                {this.state.message &&
                <Alert variant="outlined" severity="error">
                    {this.state.message}
                </Alert>
                }
                <Button onClick={this.handleClick} variant="outlined">Post</Button><Button
                onClick={() => this.setState({text: ""})} variant="outlined">Cancel</Button>
                <input type="file" accept={"image/*"} name={"image"} onChange={e => this.handleImageChange(e)}/><br/>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        //postBodies: state.postBodies,
        usernames: state.usernames,
        //yourPosts: state.yourPosts,
        timestamps: state.timestamps,
        posts: state.posts,
        filteredPosts: state.filteredPosts,
        usersYouFollow: state.usersYouFollow,
        headlines: state.headlines,
        headline: state.headline,
        followAreaMsg: state.followAreaMsg,
        isUserAuthenticated: state.isUserAuthenticated,
        followedUsers: state.followedUsers,
        avatar: state.avatar,
        isPosted: state.isPosted
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        fetchRequiredPosts: (posts, id) => dispatch(fetchRequiredPosts(posts, id)),
        getFilteredPosts: (text) => dispatch(getFilteredPosts(text)),
        sendNewPostBody: (body) => dispatch(sendNewPostBody(body)),
        followNewFriend: (username) => dispatch(followNewFriend(username)),
        fetchUsers: (users) => dispatch(fetchUsers(users)),
        changeHeadline: (input) => dispatch(changeHeadline(input)),
        setUserAuthentication: (input) => dispatch(setUserAuthentication(input)),
        setExpired: (input) => dispatch(setExpired(input)),
        setFollowedUsers: (input) => dispatch(setFollowedUsers(input)),
        setAvatar: (url) => dispatch(setAvatar(url)),
        setFeed: (posts) => dispatch(setFeed(posts)),
        setPosted: (input) => dispatch(setPosted(input))
    }
}


class UserInfo extends React.Component {
    // componentDidMount() {
    //     this.setState({headline: localStorage.getItem("id") === "-1" ? "I'm learning JavaScript!" : this.props.headlines[parseInt(localStorage.getItem("id")) - 1]});
    // }

    constructor(props) {
        super(props);
        this.state = {
            input: "",
            updateMsg: ""
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({input: event.target.value});
    }

    handleSubmit() {
        // this.props.changeHeadline(this.state.input);
        // localStorage.setItem(localStorage.getItem("username"), this.state.input);
        if (this.state.input) {
            fetch("https://wy24-final-server.herokuapp.com/headline", {
                method: 'put',
                mode: 'cors',
                credentials: 'include',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({headline: this.state.input})
            }).then(res => res.json()).then(res => {
                this.props.changeHeadline(res.headline);
                this.setState({updateMsg: ""});
            });
        } else {
            this.setState({updateMsg: "Headline cannot be empty!"});
        }

    }

    render() {

        return (
            <div>
                <Avatar alt="Remy Sharp" src={this.props.avatar}/>
                {localStorage.getItem("username")}<br/>
                Status: <Chip label={this.props.headline} variant="outlined"/><br/>
                <TextField
                    label="New Status"
                    id="outlined-size-small"
                    size="small"
                    onChange={this.handleChange}
                />
                <Button onClick={this.handleSubmit} variant={"outlined"}>Update</Button>
                {this.state.updateMsg &&
                <Alert variant="outlined" severity="error">
                    {this.state.updateMsg}
                </Alert>
                }
            </div>
        );
    }
}

let NewPostWithConnect = connect(mapStateToProps, mapDispatchToProps)(NewPost);
let FollowAreaWithConnect = connect(mapStateToProps, mapDispatchToProps)(FollowArea);

class Main extends React.Component {
    componentDidMount() {
        fetch("https://wy24-final-server.herokuapp.com/headline", {
            method: 'get',
            mode: 'cors',
            credentials: "include"
        }).then(async (res) => {
            if (res.statusText === "Unauthorized") {
                await this.props.setUserAuthentication(false);
                await this.props.setExpired(true);
                this.props.history.push('/auth');
                return;
            }
            return res.json();
        }).then((res) => {
            if (res) {
                this.props.setUserAuthentication(true);
                this.props.changeHeadline(res.headline);
                fetch("https://wy24-final-server.herokuapp.com/following", {
                    method: 'get',
                    mode: 'cors',
                    credentials: 'include',
                }).then(res => res.json()).then(res => {
                    this.props.setFollowedUsers(res.following);
                });
                fetch("https://wy24-final-server.herokuapp.com/avatar", {
                    method: 'get',
                    mode: 'cors',
                    credentials: 'include',
                }).then(res => res.json()).then(res => {
                    this.props.setAvatar(res.avatar);
                });
                fetch("https://wy24-final-server.herokuapp.com/feed", {
                    method: 'get',
                    mode: 'cors',
                    credentials: 'include',
                }).then(res => res.json()).then(async (res) => {
                    await this.props.setFeed(res.articles);
                    this.setState({isFeedLoaded: true});
                });

            }
        });
    }

    constructor(props) {
        super(props);
        this.state = {
            isFeedLoaded: false
        }
        this.handleChange = this.handleChange.bind(this);
    }

    // constructor(props) {
    //     super(props);
    //
    //     let posts = [];
    //     let namesYouFollow = [];
    //     let followingHeadlines = [];
    //     this.props.idsYouFollow.forEach((id, i) => {
    //         namesYouFollow.push(this.props.usernames[id - 1]);
    //         followingHeadlines.push(this.props.headlines[id - 1]);
    //     })
    //     this.props.yourPosts.forEach((post, i) => {
    //         posts.push({username: localStorage.getItem("username"), body: post, timestamp: this.props.timestamps[i]});
    //     })
    //     this.props.postBodies.forEach((post, i) => {
    //         let nameIdx = Math.floor(i / 10);
    //         posts.push({username: namesYouFollow[nameIdx], body: post, timestamp: this.props.timestamps[10 + i]});
    //     })
    //
    //     this.state = {
    //         posts: posts,
    //         filteredPosts: posts,
    //         followingHeadlines,
    //         namesYouFollow
    //     }
    //     this.handleChange = this.handleChange.bind(this);
    // }

    handleChange(event) {
        this.props.getFilteredPosts(event.target.value);
        // let filteredPosts;
        // filteredPosts = this.props.filteredPosts.filter((post, i) => {
        //     return post.username.includes(event.target.value) || post.body.includes(event.target.value);
        // });
        // this.props.getFilteredPosts(filteredPosts);
    }

    render() {
        // let posts = [];
        // let namesYouFollow = [];
        // let followingHeadlines = [];
        // this.props.idsYouFollow.forEach((id, i) => {
        //     namesYouFollow.push(this.props.usernames[id - 1]);
        //     followingHeadlines.push(this.props.headlines[id - 1]);
        // })
        // this.props.yourPosts.forEach((post, i) => {
        //     posts.push({username: localStorage.getItem("username"), body: post, timestamp: this.props.timestamps[i]});
        // })
        // this.props.postBodies.forEach((post, i) => {
        //     let nameIdx = Math.floor(i / 10);
        //     posts.push({username: namesYouFollow[nameIdx], body: post, timestamp: this.props.timestamps[10 + i]});
        // })


        // let filteredPosts = posts;
        // let handleChange = function (event) {
        //     filteredPosts = posts.filter((post, i) => {
        //         return post.username.includes(event.target.value) || post.body.includes(event.target.value);
        //     });
        // }
        return (
            <div>
                <FollowingList followedUsers={this.props.followedUsers}/>
                <UserInfo headline={this.props.headline} changeHeadline={(input) => this.props.changeHeadline(input)} avatar={this.props.avatar} />
                <FollowAreaWithConnect/>
                <NewPostWithConnect/>
                {this.state.isFeedLoaded
                    ? <TextField
                        label="Search"
                        id="outlined-size-small"
                        defaultValue=""
                        size="small"
                        onChange={this.handleChange}
                    />
                    : <div>loading...</div>
                }
                <Posts/>
            </div>
        );
    };
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Main));