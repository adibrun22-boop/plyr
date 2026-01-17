import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import Events from './pages/Events';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';
import PostGame from './pages/PostGame';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
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
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};