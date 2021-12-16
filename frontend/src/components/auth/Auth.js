import React from "react";
import Registration from "./registration/Registration";
import {connect} from "react-redux";
import SignIn from "./registration/SignIn";
import Button from "@mui/material/Button";
import {Alert} from "@mui/material";

class Auth extends React.Component {
    render() {
        return (
            <div>
                <Registration/>
                <SignIn />
                {this.props.isExpired &&
                    <Alert severity="error">Cookie Expired!</Alert>
                }
                <Button color={"inherit"} variant={"outlined"} onClick={() => window.location.href = "https://wy24-final-server.herokuapp.com/auth/google"}>Log in via Google</Button>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        isExpired: state.isExpired
    };
}

const mapDispatchToProps = (dispatch) => {
    return {};
}


export default connect(mapStateToProps, mapDispatchToProps)(Auth);


