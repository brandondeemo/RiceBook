import React from "react";
import {Avatar, Button} from "@mui/material";
import {connect} from "react-redux";
import {setExpired, setUserAuthentication} from "../../action";
import {withRouter} from "react-router-dom";
//import md5 from "md5";

class UpdateArea extends React.Component {

    componentDidMount() {
        fetch("https://wy24-final-server.herokuapp.com/profile", {
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
            if (!res) {
                return;
            }
            this.props.setUserAuthentication(true);
            this.setState({
                oldAvatar: res.avatar,
                oldEmail: res.email,
                oldZipcode: res.zipcode,
                oldUsername: res.username
            });
        })
    }

    constructor(props) {
        super(props);
        this.state = {
            email: "",
            zipcode: "",
            password: "",
            pswConfirm: "",
            message: "",
            oldUsername: "",
            oldAvatar: "",
            oldEmail: "",
            oldZipcode: "",
            file: ""
        }
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.uploadAvatar = this.uploadAvatar.bind(this);
        this.handleImageChange = this.handleImageChange.bind(this);
    }

    handleImageChange(event) {
        this.setState({file: event.target.files[0]});
    }


    uploadAvatar() {
        const fd = new FormData();
        fd.append("title", localStorage.getItem("username"));
        fd.append("image", this.state.file);
        fetch("https://wy24-final-server.herokuapp.com/avatar", {
            method: 'put',
            mode: 'cors',
            credentials: 'include',
           // headers: {'Content-Type': 'application/json'},
            body: fd
        }).then(res => res.json()).then(res => {
            this.setState({oldAvatar: res.avatar});
        });
    }

    encryptPsw(input) {
        let encrypted_pwd = "";
        for (let i = 0; i < input.length; ++i) {
            encrypted_pwd += "*";
        }
        return encrypted_pwd;
    }

    handleInputChange(event) {
        let value = event.target.value;
        let name = event.target.name;
        this.setState({[name]: value});
    }

    async handleSubmit(event) {
        let message = "";
        if (this.state.email) {
            const regex = /^[^@]+@[^@]+$/;
            if (this.state.oldEmail === this.state.email) {
                message += "> Your entry for email address is the same as the old value! \n";
            } else if (!regex.test(this.state.email)) {
                message += "> Your input for email address should be like this: dummy@rice.edu \n";
            } else {
                let old = this.state.oldEmail;
                await fetch("https://wy24-final-server.herokuapp.com/email", {
                    method: "put",
                    mode: 'cors',
                    credentials: "include",
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({email: this.state.email})
                }).then(res => res.json()).then(res => {
                    this.setState({oldEmail: res.email});
                    message += "> Email address updated successfully from " + old + " to " + this.state.email + "! \n";
                })
            }
        }
        if (this.state.zipcode) {
            const regex = /^\d{5}$/;
            if (this.state.oldZipcode === this.state.zipcode) {
                message += "> Your entry for zipcode is the same as the old value! \n";
            } else if (!regex.test(this.state.zipcode)) {
                message += "> Your input for zipcode should be like this: 77005 \n";
            } else {
                let old = this.state.oldZipcode;
                await fetch("https://wy24-final-server.herokuapp.com/zipcode", {
                    method: "put",
                    mode: 'cors',
                    credentials: "include",
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({zipcode: this.state.zipcode})
                }).then(res => res.json()).then(res => {
                    this.setState({oldZipcode: res.zipcode});
                    message += "> Zipcode updated successfully from " + old + " to " + this.state.zipcode + "! \n";
                })
            }
        }
        if (this.state.password || this.state.pswConfirm) {
            //const regex = /^.{8}.*$/;
            if (this.state.password !== this.state.pswConfirm) {
                message += "> Two entries for password update should be the same! \n";
            }
                // else if (!regex.test(this.state.password)) {
                //     message += "> Your password input should be no less than 8 characters! \n";
                // }
                // else if (this.state.password === this.state.oldPassword) {
                //     message += "> Your entry for password is the same as the old value! \n";
            // }
            else {
                await fetch("https://wy24-final-server.herokuapp.com/password", {
                    method: "put",
                    mode: 'cors',
                    credentials: "include",
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({password: this.state.password})
                }).then(res => res.json()).then(res => {
                    if (!res) {
                        return;
                    }
                    if (res.result === "success") {
                        message += message += "> Password updated successfully to " + this.encryptPsw(this.state.password) + "! \n";
                    } else {
                        message += "> Your entry for password is the same as the old value! \n";
                    }
                })
            }
        }
        this.setState({
            message: message ? message : "> Nothing to update! \n",
            email: "",
            zipcode: "",
            password: "",
            pswConfirm: ""
        });
    }

    render() {
        return (
            <div>
                <h2>
                    Update your profile
                </h2>
                <Avatar alt="Remy Sharp" src={this.state.oldAvatar}/>
                <input type="file" accept={"image/*"} name={"image"} onChange={e => this.handleImageChange(e)}/><br/>
                <Button variant={"outlined"} onClick={this.uploadAvatar}>UPDATE AVATAR</Button><br/>

                <span>Account Name: </span><span id={"username"}>{localStorage.getItem("username")}</span><br/>
                <span>DoB: </span><span>01-01-2000</span><br/>

                <span>Email Address: </span><span>{this.state.oldEmail}</span><br/>

                <span>New email address:</span>
                <input value={this.state.email} onChange={this.handleInputChange} name="email" type="email"
                       placeholder="Make it blank if you do not intend to make a change"/><br/>


                <span>Zipcode: </span><span>{this.state.oldZipcode}</span><br/>

                <span>New zipcode:</span>
                <input value={this.state.zipcode} onChange={this.handleInputChange} name="zipcode" type="text"
                       placeholder="Make it blank if you do not intend to make a change"/><br/>

                <span>Password: </span><span>********</span><br/>

                <span>New password:</span>
                <input value={this.state.password} onChange={this.handleInputChange} name="password" type="password"
                       placeholder="Make it blank if you do not intend to make a change"/><br/>

                <span>Enter again:</span>
                <input value={this.state.pswConfirm} onChange={this.handleInputChange} name="pswConfirm" type="password"
                       placeholder="Make it blank if you do not intend to make a change"/><br/>

                <Button variant={"outlined"} onClick={this.handleSubmit}>UPDATE ALL</Button>
                <AlertArea message={this.state.message}/>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        isUserAuthenticated: state.isUserAuthenticated,
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        setUserAuthentication: input => dispatch(setUserAuthentication(input)),
        setExpired: input => dispatch(setExpired(input))
    };
}

let UpdateWithConnect = withRouter(connect(mapStateToProps, mapDispatchToProps)(UpdateArea));

function AlertArea(props) {
    return (
        <div>
            {props.message.split("\n").map((line, i) => <p key={i}>{line}</p>)}
        </div>
    );
}

class Profile extends React.Component {
    render() {
        return (
            <div>
                <UpdateWithConnect/>
            </div>
        );
    }
}

export default Profile;