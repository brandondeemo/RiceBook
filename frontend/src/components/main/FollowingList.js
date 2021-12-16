import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import {Box, Button} from "@mui/material";
import {connect} from "react-redux";
import {setFeed, setFollowedUsers, unfollowByName} from "../../action";


const mapStateToProps = (state) => {
    return {};
}

const mapDispatchToProps = (dispatch) => {
    return {
        unfollowByName: (username) => dispatch(unfollowByName(username)),
        setFollowedUsers: (input) => dispatch(setFollowedUsers(input)),
        setFeed: (input) => dispatch(setFeed(input))
    }
}

class Item extends React.Component {
    componentDidMount() {
        fetch(`https://wy24-final-server.herokuapp.com/headline/${this.props.username}`, {
            method: 'get',
            mode: 'cors',
            credentials: "include"
        }).then(res => res.json()).then(res => {
            this.setState({headline: res.headline});
        });
        fetch(`https://wy24-final-server.herokuapp.com/avatar/${this.props.username}`, {
            method: 'get',
            mode: 'cors',
            credentials: "include"
        }).then(res => res.json()).then(res => {
            this.setState({avatar: res.avatar});
        });
    }

    constructor(props) {
        super(props);
        this.state = {
            headline: "",
            avatar: ""
        }
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        fetch(`https://wy24-final-server.herokuapp.com/following/${this.props.username}`, {
            method: 'delete',
            mode: 'cors',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'}
        }).then(res => res.json()).then(res => {
            this.props.setFollowedUsers(res.following);
            fetch("https://wy24-final-server.herokuapp.com/feed", {
                method: 'get',
                mode: 'cors',
                credentials: 'include',
            }).then(res => res.json()).then(res => {
                this.props.setFeed(res.articles);
            });
            if (res.following.length !== 0) {
                fetch(`https://wy24-final-server.herokuapp.com/headline/${this.props.username}`, {
                    method: 'get',
                    mode: 'cors',
                    credentials: "include"
                }).then(res => res.json()).then(res => {
                    this.setState({headline: res.headline});
                });
                fetch(`https://wy24-final-server.herokuapp.com/avatar/${this.props.username}`, {
                    method: 'get',
                    mode: 'cors',
                    credentials: "include"
                }).then(res => res.json()).then(res => {
                    this.setState({avatar: res.avatar});
                });
            }
        });
    }

    render() {
        return (
            <ListItem>
                <ListItemAvatar>
                    <Avatar alt="Remy Sharp" src={this.state.avatar}/>
                </ListItemAvatar>
                <ListItemText primary={this.props.username} secondary={this.state.headline}/>
                <Button onClick={this.handleClick} sx={{fontSize: 10, marginLeft: 7}} variant="outlined">Unfollow</Button>
            </ListItem>
        );
    }
}

let ItemWithConnect = connect(mapStateToProps, mapDispatchToProps)(Item);

class FollowingList extends React.Component {

    render() {
        return (
            <Box sx={{float: "right"}}>
                <h2>People Followed by Me</h2>
                <List sx={{width: '100%', maxWidth: 200, bgcolor: "lightgray"}}>
                    {this.props.followedUsers.map((username, i) => {
                        return <ItemWithConnect key={i} username={username} />
                    })}
                </List>
            </Box>
        );
    }
}

export default FollowingList;