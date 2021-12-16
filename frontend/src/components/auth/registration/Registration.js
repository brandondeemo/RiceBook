import React from "react";
import Typography from "@mui/material/Typography";
import {setUserAuthentication, updateRegistrationMsg} from "../../../action";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";

class MessageBox extends React.Component {
    render() {
        return (
            <div id="msg_box">
                <p id="msg">{this.props.registrationMsg}</p>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        usernames: state.usernames,
        registrationMsg: state.registrationMsg
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        setUserAuthenticated: (isUserAuthenticated) => dispatch(setUserAuthentication(isUserAuthenticated)),
        updateRegistrationMsg: (msg) => dispatch(updateRegistrationMsg(msg))
    };
}

let MessageBoxWithConnect = connect(mapStateToProps, mapDispatchToProps)(MessageBox);

class Registration extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            accountName: "",
            email: "",
            dob: "",
            zipcode: "",
            password: "",
            pswConfirm: "",
            timestamp: Date.now(),
            pswMatch: false,
            underage: false
        }
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleInputChange(event) {
        let value = event.target.value;
        let name = event.target.name;
        this.setState({[name]: value});
        if (name === "pswConfirm" || name === "password") {
            let msg = "";
            let value1 = document.getElementById("psw").value;
            let value2 = document.getElementById("pswConfirm").value;
            if (value1 === value2) {
                msg = "> The two passwords match!"
            } else {
                msg = "> Sorry - The two passwords you typed don't match."
            }
            this.props.updateRegistrationMsg(msg);
            this.setState({pswMatch: value1 === value2});
        }
        if (name === "dob") {
            let millisec = Date.now() - Date.parse(value);
            this.setState({underage: Math.floor(millisec / 31556952000) < 18});
        }
    }

    handleSubmit(event) {
        event.preventDefault();
        let msg;
        let userInfo = {
            username: this.state.accountName,
            email: this.state.email,
            dob: this.state.dob,
            zipcode: this.state.zipcode,
            password: this.state.password
        };
        if (!this.state.pswMatch) {
            msg = "> Sorry - The two passwords you typed don't match! \n";
            this.props.updateRegistrationMsg(msg);
        } else if (this.state.underage) {
            msg = "> You are under age of 18 so you are not allowed to register! \n";
            this.props.updateRegistrationMsg(msg);
        } else {
            fetch("https://wy24-final-server.herokuapp.com/register", {
                method: 'post',
                mode: 'cors',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(userInfo)
            }).then((res) => res.json()).then((res) => {
                msg = res.result;
                this.props.updateRegistrationMsg(msg);
            });
        }
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <Typography component="h5" variant="h5">Sign Up</Typography>
                    <label>Account Name:
                        <input name="accountName" type="text" placeholder="your account name"
                               pattern="^[a-zA-Z]+\d*$"
                               title="Please only include upper or lower case letters and numbers; Numbers only and starting with numbers are not allowed"
                               required onChange={this.handleInputChange}/>
                    </label><br/>
                    <label>Email Address:
                        <input name="email" type="email" placeholder="email address"
                               required onChange={this.handleInputChange}/>
                    </label><br/>
                    <label>Date of Birth:
                        <input name="dob" type="date" required onChange={this.handleInputChange}/>
                    </label><br/>
                    <label>Zipcode:
                        <input name="zipcode" type="text" placeholder="should be 5 digits"
                               pattern="\d{5}" title="Please enter a number with 5 digits" required
                               onChange={this.handleInputChange}/>
                    </label><br/>
                    <label>Password:
                        <input id="psw" name="password" type="password" placeholder="enter your password"
                               pattern=".+" title="Password cannot be empty!"
                               required onChange={this.handleInputChange}/>
                    </label><br/>
                    <label>Password Confirmation:
                        <input id="pswConfirm" name="pswConfirm" type="password"
                               placeholder="confirm your password" onChange={this.handleInputChange}/>
                    </label><br/>
                    <MessageBoxWithConnect/>
                    <input type="submit" value="Submit"/><input type="reset"
                                                                value="Clear"/>
                </form>
            </div>
        );
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Registration));