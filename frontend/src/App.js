import './App.css';
import AppBar from "./components/AppBar";
import Auth from "./components/auth/Auth";
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import React from "react";
import Main from "./components/main/Main";
import Profile from "./components/profile/Profile";
import {fetchUsers, setExpired, setUserAuthentication} from "./action";
import {connect} from "react-redux";
// let data = {
//     username: "myron",
//     email: "yewuzhen5736@gmail.com",
//     dob: '10000000000',
//     zipcode: 10000,
//     password: '12345'
// }

class App extends React.Component {
    componentDidMount() {
        fetch("https://wy24-final-server.herokuapp.com/headline", {
            method: 'get',
            mode: 'cors',
            credentials: "include"
        }).then(async (res) => {
            if (res.statusText === "Unauthorized" || res.statusText === "Bad Request") {
                 this.props.setUserAuthentication(false);
           //      this.props.setExpired(true);
             //   this.props.history.push('/auth');
            } else {
                this.props.setUserAuthentication(true);
            }
        })
    }

    render() {
        return (
            <Router>
                <div className="container">
                    <AppBar/>
                    <Switch>
                        <Route exact path="/" render={
                            () => {
                                return (
                                    this.props.isUserAuthenticated ? <Redirect to="/main"/> : <Redirect to="/auth"/>
                                );
                            }
                        }/>
                        <Route exact path="/auth">
                            <Auth/>
                        </Route>
                        <Route exact path="/main">
                            <Main/>
                        </Route>
                        <Route exact path="/profile">
                            <Profile/>
                        </Route>
                    </Switch>
                </div>
            </Router>
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
        fetchUsers: (users) => dispatch(fetchUsers(users)),
        setUserAuthentication: (input) => dispatch(setUserAuthentication(input)),
        setExpired: (input) => dispatch(setExpired(input))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
