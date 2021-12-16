import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import {withRouter} from "react-router-dom";
import {changeHeadline, setUserAuthentication} from "../action";
import {connect} from "react-redux";

class ButtonAppBar extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        //localStorage.removeItem("isUserAuthenticated");
        fetch("https://wy24-final-server.herokuapp.com/logout", {
            method: "put",
            mode: 'cors',
            credentials: "include",
            headers: {'Content-Type': 'application/json'}
        }).then(res => {
            if (res.statusText === "OK") {
                this.props.setUserAuthenticated(false);
                this.props.history.push("/auth");
            }
        })
    }

    render() {
        //const isLoggedIn = localStorage.getItem("isUserAuthenticated") === "true";
        let button;
        if (!this.props.isUserAuthenticated) {
            button = <Button color="inherit" onClick={() => this.props.history.push("/auth")}>Login</Button>;
        } else {
            button = <Button color="inherit" onClick={this.handleClick}>Logout</Button>
        }

        return (
            <Box sx={{flexGrow: 1}}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{mr: 2}}
                        >
                            <MenuIcon/>
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                            RiceBook
                        </Typography>
                        {this.props.isUserAuthenticated &&
                            <Typography variant="h7" component="div" >
                                Welcome, {localStorage.getItem("username")}
                            </Typography>
                        }
                        {this.props.isUserAuthenticated &&
                            // <Link to={"/main"}>Main Page</Link>
                            <Button color={"inherit"} onClick={() => this.props.history.push("/main")}>Main Page</Button>
                        }
                        {this.props.isUserAuthenticated &&
                            // <Link to={"/profile"}>Profile</Link>
                            <Button color={"inherit"} onClick={() => this.props.history.push("/profile")}>Profile</Button>
                        }
                        {button}
                    </Toolbar>
                </AppBar>
            </Box>
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
        setUserAuthenticated: (isUserAuthenticated) => dispatch(setUserAuthentication(isUserAuthenticated)),
        changeHeadline: (input) => dispatch(changeHeadline(input)),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ButtonAppBar));
