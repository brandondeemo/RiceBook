import {webApp} from "./reducer";
import {
    fetchRequiredPosts,
    fetchUsers,
    followNewFriend,
    getFilteredPosts,
    logIn, sendNewPostBody,
    setUserAuthentication, unfollowByName
} from "./action";
import {shallow} from "enzyme";
import Profile from "./components/profile/Profile";
const posts = require("./posts.json");
const users = require("./users.json");


// validate authentication
test("should log in a previously registered user ", () => {
    let newState;
    newState = webApp(undefined, fetchUsers(users));
    newState = webApp(newState, logIn("Bret", "Kulas Light"));
    expect(newState).toEqual({
        ...newState,
        isUserAuthenticated: true,
        username: "Bret",
        email: "Sincere@april.biz",
        phone: "1-770-736-8031 x56442",
        zipcode: "92998-3874",
        password: "Kulas Light",
        id: 1,
    });
});

test("should not log in an invalid user", () => {
    let newState;
    newState = webApp(undefined, fetchUsers(users));
    newState = webApp(newState, logIn("Myron", "123456789"));
    expect(newState).toEqual({
        ...newState,
        isUserAuthenticated: false,
        username: null,
        email: null,
        phone: null,
        zipcode: null,
        password: null,
        id: null,
        error: true,
    });
});

test("should log out a user", () => {
    let newState;
    newState = webApp(undefined, fetchUsers(users));
    newState = webApp(newState, logIn("Bret", "Kulas Light"));
    newState = webApp(newState, fetchRequiredPosts(posts, localStorage.getItem("id")));
    newState = webApp(newState, setUserAuthentication(false));
    expect(newState).toEqual({
        ...newState,
        isUserAuthenticated: false,
    })
});

// validate article actions

test("should add a new post to the feed", () => {
    let newState;
    newState = webApp(undefined, fetchUsers(users));
    newState = webApp(newState, logIn("Bret", "Kulas Light"));
    newState = webApp(newState, fetchRequiredPosts(posts, localStorage.getItem("id")));
    newState = webApp(newState, sendNewPostBody("my new post"));
    let numPost = newState.posts.map(post => post.username).filter(username => username === "Bret").length;
    expect(numPost).toEqual(11);
});


test("should fetch all articles for current logged in user", () => {
    let newState;
    newState = webApp(undefined, fetchUsers(users));
    newState = webApp(newState, logIn("Bret", "Kulas Light"));
    newState = webApp(newState, fetchRequiredPosts(posts, localStorage.getItem("id")));
    let numPost = newState.posts.map(post => post.username).filter(username => username === "Bret" || username === "Antonette" || username === "Samantha" || username === "Karianne").length;
    expect(numPost).toEqual(40);
});

test("should fetch subset of articles for current logged in user given search keyword", () => {
    let newState;
    newState = webApp(undefined, fetchUsers(users));
    newState = webApp(newState, logIn("Bret", "Kulas Light"));
    newState = webApp(newState, fetchRequiredPosts(posts, localStorage.getItem("id")));
    newState = webApp(newState, getFilteredPosts("Bret"));
    let numPost = newState.filteredPosts.filter(post => post.username === "Antonette").length;
    expect(numPost).toEqual(0);
});

test("should add articles when adding a follower", () => {
    let newState;
    newState = webApp(undefined, fetchUsers(users));
    newState = webApp(newState, logIn("Bret", "Kulas Light"));
    newState = webApp(newState, fetchRequiredPosts(posts, localStorage.getItem("id")));
    newState = webApp(newState, followNewFriend("Leopoldo_Corkery"));
    let numPost = newState.filteredPosts.length;
    expect(numPost).toEqual(50);
});

test("should remove articles when removing a follower", () => {
    let newState;
    newState = webApp(undefined, fetchUsers(users));
    newState = webApp(newState, logIn("Bret", "Kulas Light"));
    newState = webApp(newState, fetchRequiredPosts(posts, localStorage.getItem("id")));
    newState = webApp(newState, unfollowByName("Antonette"));
    let numPost = newState.filteredPosts.length;
    expect(numPost).toEqual(30);
});

// validate profile actions

test("should fetch the logged in user's profile username", () => {
    let newState;
    newState = webApp(undefined, fetchUsers(users))
    webApp(newState, logIn("Bret", "Kulas Light"));
    const wrapper = shallow(<Profile.UpdateArea />);
    expect(wrapper.find('span[id="username"]').text()).toEqual("Bret");
});