export const FETCH_USERS = "FETCH_USERS";
export const SET_USER_AUTHENTICATION = "SET_USER_AUTHENTICATION";
export const LOG_IN = "LOG_IN";
export const FETCH_REQUIRED_POSTS = "FETCH_OTHER_POSTS";
export const UNFOLLOW_BY_NAME = "UNFOLLOW_BY_NAME";
export const GET_FILTERED_POSTS = "GET_FILTERED_POSTS";
export const SEND_NEW_POST_BODY = "SEND_NEW_POST_BODY";
export const FOLLOW_NEW_FRIEND = "FOLLOW_NEW_FRIEND";
export const CHANGE_HEADLINE = "CHANGE_HEADLINE";
export const UPDATE_REGISTRATION_MSG = "UPDATE_REGISTRATION_MSG";
export const SET_EXPIRED = "SET_EXPIRED";
export const SET_FOLLOWED_USERS = "SET_FOLLOWED_USERS";
export const SET_AVATAR = "SET_AVATAR";
export const SET_FEED = "SET_FEED";
export const SET_POSTED = "SET_POSTED";

export function setPosted(input) {
    return {type: SET_POSTED, input};
}

export function setFeed(posts) {
    return {type: SET_FEED, posts};
}

export function setAvatar(url) {
    return {type: SET_AVATAR, url};
}

export function setFollowedUsers(followedUsers) {
    return {type: SET_FOLLOWED_USERS, followedUsers};
}

export function setExpired(input) {
    return {type: SET_EXPIRED, input};
}

export function fetchUsers(users) {
    return {type: FETCH_USERS, users};
}

export function setUserAuthentication(isUserAuthenticated) {
    return {type: SET_USER_AUTHENTICATION, isUserAuthenticated};
}

export function logIn(username) {
    return {type: LOG_IN, username};
}


export function updateRegistrationMsg(msg) {
    return {type: UPDATE_REGISTRATION_MSG, msg};
}

export function fetchRequiredPosts(posts, id) {
    return {type: FETCH_REQUIRED_POSTS, posts, id};
}

export function unfollowByName(username) {
    return {type: UNFOLLOW_BY_NAME, username};
}

export function getFilteredPosts(text) {
    return {type: GET_FILTERED_POSTS, text};
}

export function sendNewPostBody(body) {
    return {type: SEND_NEW_POST_BODY, body};
}

export function followNewFriend(username) {
    return {type: FOLLOW_NEW_FRIEND, username};
}

export function changeHeadline(input) {
    return {type: CHANGE_HEADLINE, input};
}

