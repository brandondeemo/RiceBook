import {
    FETCH_USERS,
    LOG_IN,
    SET_USER_AUTHENTICATION,
    GET_FILTERED_POSTS,
    FETCH_REQUIRED_POSTS,
    SEND_NEW_POST_BODY,
    FOLLOW_NEW_FRIEND,
    UNFOLLOW_BY_NAME,
    CHANGE_HEADLINE,
    UPDATE_REGISTRATION_MSG, SET_EXPIRED, SET_FOLLOWED_USERS, SET_AVATAR, SET_FEED, SET_POSTED
} from "./action";

const initialState = {
    users: [],
    isUserAuthenticated: false,
    username: localStorage.getItem("username"),
    email: localStorage.getItem("email"),
    phone: localStorage.getItem("phone"),
    zipcode: localStorage.getItem("zipcode"),
    password: localStorage.getItem("password"),
    id: localStorage.getItem("id"),
    headline: localStorage.getItem(localStorage.getItem("username")),
    posts: [],
    filteredPosts: [],
    idsYouFollow: [],
    namesYouFollow: [],
    followingHeadlines: [],
    headlines: [],
    usernames: [],
    newBodies: [],
    usersYouFollow: [],
    redirectToMain: false,
    followAreaMsg: "",
    allPosts: [],
    error: false,
    registrationMsg: "",
    isExpired: false,
    followedUsers: [],
    avatar: "",
    isPosted: false
};

export function webApp(state = initialState, action) {
    let id;
    let ret = [];
    switch (action.type) {
        case SET_POSTED:
            return {...state, isPosted: action.input};
        case SET_FEED:
            return {...state, posts: action.posts, filteredPosts: action.posts};
        case SET_AVATAR:
            return {...state, avatar: action.url};
        case SET_FOLLOWED_USERS:
            return {...state, followedUsers: action.followedUsers};
        case SET_EXPIRED:
            return {...state, isExpired: action.input};
        case FETCH_USERS:
            return {
                ...state,
                users: action.users,
                usernames: action.users.map(user => user.username),
                headlines: action.users.map(user => user.company.catchPhrase)
            };
        case SET_USER_AUTHENTICATION:
            return {...state, isUserAuthenticated: action.isUserAuthenticated};
        case UPDATE_REGISTRATION_MSG:
            return {...state, registrationMsg: action.msg};
        case LOG_IN:
            localStorage.setItem("isUserAuthenticated", "true");
            localStorage.setItem("username", action.username);
            return {...state, isUserAuthenticated: true, username: action.username};
        case FETCH_REQUIRED_POSTS:
            let requiredIds = new Set();
            let ids = [];
            id = parseInt(action.id) === -1 ? 0 : parseInt(action.id);
            if (id === 0) {
                requiredIds.add(1);
                ids.push(1);
            } else {
                requiredIds.add((id % 10) + 1);
                ids.push((id % 10) + 1);
                requiredIds.add(((id + 1) % 10) + 1);
                ids.push(((id + 1) % 10) + 1);
                requiredIds.add(((id + 2) % 10) + 1);
                ids.push(((id + 2) % 10) + 1);
            }
            // username, post body, timestamp
            action.posts.forEach(post => {
                if (requiredIds.has(post.userId) || post.userId === id) {
                    ret.push({
                        username: state.usernames[post.userId - 1],
                        body: post.body,
                        timestamp: (new Date(Math.random() * 1635117946027)).toString()
                    });
                }
            })
            ret.sort((p1, p2) => {
                let date1 = new Date(p1.timestamp)
                let date2 = new Date(p2.timestamp)
                return date2 - date1;
            });
            let usersYouFollow = ids.map((id, i) => {
                let headline = localStorage.getItem(state.usernames[id - 1]) ? localStorage.getItem(state.usernames[id - 1]) : state.headlines[id - 1];
                return {username: state.usernames[id - 1], headline: headline};
            })
            let headline = action.id === "-1" ? "I'm learning JavaScript!" : state.headlines[action.id - 1];
            if (state.headline) {
                return {
                    ...state,
                    posts: ret,
                    filteredPosts: ret,
                    usersYouFollow: usersYouFollow,
                    allPosts: action.posts
                };
            }
            localStorage.setItem(localStorage.getItem("username"), headline);
            return {
                ...state,
                posts: ret,
                filteredPosts: ret,
                usersYouFollow: usersYouFollow,
                headline: headline,
                allPosts: action.posts
            };
        case UNFOLLOW_BY_NAME:
            ret = state.usersYouFollow.filter((user, i) => user.username !== action.username);
            // id = state.usernames.findIndex(username => username === action.username);
            let postsBeforeFilter = state.posts.filter(post => post.username !== action.username);
            let postsAfterFilter = state.filteredPosts.filter(post => post.username !== action.username);
            return {...state, usersYouFollow: ret, posts: postsBeforeFilter, filteredPosts: postsAfterFilter};
        case GET_FILTERED_POSTS:
            ret = state.posts.filter((post, i) => {
                return post.author.includes(action.text) || post.text.includes(action.text);
            });
            // ret.sort((p1, p2) => {
            //     let date1 = new Date(p1.timestamp)
            //     let date2 = new Date(p2.timestamp)
            //     return date2 - date1;
            // });
            return {...state, filteredPosts: ret};
        case SEND_NEW_POST_BODY:
            let beforeFilter = [];
            ret = [...state.filteredPosts];
            ret.push({
                username: localStorage.getItem("username"),
                body: action.body,
                timestamp: (new Date()).toString(),
                isNew: true
            });
            ret.sort((p1, p2) => {
                let date1 = new Date(p1.timestamp)
                let date2 = new Date(p2.timestamp)
                return date2 - date1;
            });
            beforeFilter = Array.from(state.posts);
            beforeFilter.push({
                username: localStorage.getItem("username"),
                body: action.body,
                timestamp: new Date(Date.now()).toString(),
                isNew: true
            });
            return {...state, filteredPosts: ret, posts: beforeFilter};
        case FOLLOW_NEW_FRIEND:
            ret = Array.from(state.usersYouFollow);
            // username, headline
            if (action.username === localStorage.getItem("username")) {
                return {...state, followAreaMsg: "You cannot follow yourself!"};
            }
            if (state.followedUsers.find(name => name === action.username)) {
                return {...state, followAreaMsg: "You have followed the user!"};
            }
            let placeholderUserIdx = state.usernames.findIndex(username => username === action.username);
            if (placeholderUserIdx !== -1) {
                let headline = localStorage.getItem(action.username) ? localStorage.getItem(action.username) : state.headlines[placeholderUserIdx];
                ret.push({username: action.username, headline: headline});
                // username, body, timestamp
                let postsBeforeFilter = [...state.posts];
                let postsAfterFilter = [...state.filteredPosts];
                state.allPosts.forEach((post, i) => {
                    if (post.userId === placeholderUserIdx + 1) {
                        postsBeforeFilter.push({
                            username: state.usernames[post.userId - 1],
                            body: post.body,
                            timestamp: (new Date(Math.random() * 1635117946027)).toString()
                        });
                        postsAfterFilter.push({
                            username: state.usernames[post.userId - 1],
                            body: post.body,
                            timestamp: (new Date(Math.random() * 1635117946027)).toString()
                        });
                    }
                });
                postsAfterFilter.sort((p1, p2) => {
                    let date1 = new Date(p1.timestamp)
                    let date2 = new Date(p2.timestamp)
                    return date2 - date1;
                });
                return {
                    ...state,
                    posts: postsBeforeFilter,
                    filteredPosts: postsAfterFilter,
                    usersYouFollow: ret,
                    followAreaMsg: ""
                };
            }
            //ret.push({username: action.username, headline: "I'm learning JavaScript!"});
            return {...state, followAreaMsg: "The username doesn't exist!"};
        case CHANGE_HEADLINE:
            return {...state, headline: action.input};
        default:
            return state;
    }
}

