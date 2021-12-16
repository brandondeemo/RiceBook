import React from "react";
import {Typography} from "@mui/material";
import {connect} from "react-redux";
import {Redirect, withRouter} from "react-router-dom";
import {logIn, setExpired} from "../../../action";

function MessageBox(props) {
    return (
        <div id="msg_box">
            <p id="msg">{props.message}</p>
        </div>
    );
}

class SignIn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {username: "", password: "", message: ""};
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleInputChange(event) {
        let value = event.target.value;
        let name = event.target.name;
        this.setState({[name]: value});
    }

    handleSubmit(event) {
        event.preventDefault();
        fetch("https://wy24-final-server.herokuapp.com/login", {
            method: 'post',
            mode: 'cors',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username: this.state.username, password: this.state.password})
        }).then(res => res.json()).then(res => {
            this.setState({message: res.result});
            if (res.result === "success") {
                this.props.setExpired(false);
                this.props.logIn(this.state.username);
            }
        })
        // this.props.logIn(this.state.username, this.state.password);
        // this.setState({message: "> Invalid username or password!"});
    }

    render() {
        if (this.props.isUserAuthenticated) {
           return <Redirect to={"/main"}/>;
        }
        else {
            return (
                <div>
                    <form onSubmit={this.handleSubmit}>
                        <Typography component="h5" variant="h5">Sign In</Typography>
                        <label>Username:
                            <input name="username" type="text" placeholder="username" value={this.state.username}
                                   required onChange={this.handleInputChange}/>
                        </label><br/>
                        <label>Password:
                            <input name="password" type="password" placeholder="enter your password"
                                   value={this.state.password}
                                   required onChange={this.handleInputChange}/><br/>
                        </label>
                        <input type="submit" value="Submit"/>
                    </form>
                    <MessageBox message={this.state.message}/>
                </div>
            );
        }
    }
}

const mapStateToProps = (state) => {
    return {
        isUserAuthenticated: state.isUserAuthenticated,
        isExpired: state.isExpired
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        logIn: (username) => dispatch(logIn(username)),
        setExpired: (input) => dispatch(setExpired(input))
    };
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SignIn));