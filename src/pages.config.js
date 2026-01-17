import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import Events from './pages/Events';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';
import PostGame from './pages/PostGame';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import EditProfile from './pages/EditProfile';
import Achievements from './pages/Achievements';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Onboarding": Onboarding,
    "Events": Events,
    "CreateEvent": CreateEvent,
    "EventDetails": EventDetails,
    "PostGame": PostGame,
    "Feed": Feed,
    "Profile": Profile,
    "Settings": Settings,
    "Notifications": Notifications,
    "EditProfile": EditProfile,
    "Achievements": Achievements,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};