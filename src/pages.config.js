import Achievements from './pages/Achievements';
import CreateEvent from './pages/CreateEvent';
import EditProfile from './pages/EditProfile';
import EventDetails from './pages/EventDetails';
import Events from './pages/Events';
import Feed from './pages/Feed';
import FindFriends from './pages/FindFriends';
import FriendRequests from './pages/FriendRequests';
import Home from './pages/Home';
import Notifications from './pages/Notifications';
import Onboarding from './pages/Onboarding';
import PostGame from './pages/PostGame';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Achievements": Achievements,
    "CreateEvent": CreateEvent,
    "EditProfile": EditProfile,
    "EventDetails": EventDetails,
    "Events": Events,
    "Feed": Feed,
    "FindFriends": FindFriends,
    "FriendRequests": FriendRequests,
    "Home": Home,
    "Notifications": Notifications,
    "Onboarding": Onboarding,
    "PostGame": PostGame,
    "Profile": Profile,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};