import React from "react";
import "./Posts.css";
import Button from "@mui/material/Button";
import {connect} from "react-redux";
import Modal from "./Modal";
import {Alert, TextField} from "@mui/material";
import {setFeed, setPosted} from "../../../action";

class Post extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: "",
            message: ""
        };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleInputChange(event) {
        this.setState({content: event.target.value});
    }

    handleSubmit() {
        fetch(`https://wy24-final-server.herokuapp.com/articles/${this.props.pid}`, {
            method: 'put',
            mode: 'cors',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({text: this.state.content})
        }).then(res => {
            if (res.statusText === "Bad Request") {
                this.setState({message: "Updated post cannot be empty!"});
                return;
            }
            if (res.statusText === "Forbidden") {
                this.setState({message: "You cannot modify others' posts!"});
                return;
            }
            fetch("https://wy24-final-server.herokuapp.com/feed", {
                method: 'get',
                mode: 'cors',
                credentials: 'include',
            }).then(res => res.json()).then(res => {
                this.props.setFeed(res.articles);
                this.setState({message: ""});
            });
        });
    }

    render() {
        return (
            <tr>
                <td>{this.props.author}</td>
                <td>
                    <p>{this.props.text}</p>
                    {this.props.image &&
                    <img src={this.props.image} alt={"Missing"}/>
                    }
                    <br/>
                    time posted: {this.props.date} <br/>
                    <TextField
                        label="Content"
                        id="outlined-size-small"
                        size="small"
                        onChange={this.handleInputChange}
                    />
                    <Button variant="outlined" onClick={this.handleSubmit}>Edit</Button><br/>
                    {this.state.message &&
                    <Alert variant="outlined" severity="error">
                        {this.state.message}
                    </Alert>
                    }
                    <Modal comments={this.props.comments} pid={this.props.pid} setFeed={(input) => this.props.setFeed(input)}/><br/>
                    -------------------------------------------------------------
                </td>
            </tr>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        newBodies: state.newBodies,
        filteredPosts: state.filteredPosts,
        isPosted: state.isPosted
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        setFeed: (input) => dispatch(setFeed(input)),
        setPosted: (input) => dispatch(setPosted(input))
    }
}

let PostWithConnect = connect(mapStateToProps, mapDispatchToProps)(Post);

class Posts extends React.Component {
    render() {
        return (
            <div>
                <h2>Feed</h2>
                <table>
                    <thead>
                    <tr>
                        <th>Who</th>
                        <th>What's new</th>
                    </tr>
                    </thead>
                    <tbody>
                    {/*<Post body={this.props.newBody} username={localStorage.getItem("username")} timestamp={Date.now()}/>*/}
                    {/*{this.props.newBodies.map((body, i) => <Post key={i + 100} body={body} username={localStorage.getItem("username")} timestamp={Date.now()}/>)}*/}
                    {this.props.filteredPosts.map((post, i) => <PostWithConnect key={i} text={post.text} author={post.author}
                                                                     date={post.date} comments={post.comments} image={post.image} pid={post.pid} setFeed={(input) => this.props.setFeed(input)} />)}
                    </tbody>
                </table>
            </div>
        );
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Posts);