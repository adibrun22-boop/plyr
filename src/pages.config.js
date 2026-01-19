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
import ContactUs from './pages/ContactUs';
import TermsOfUse from './pages/TermsOfUse';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Teams from './pages/Teams';
import CoachProfile from './pages/CoachProfile';
import CreateTeam from './pages/CreateTeam';
import TeamDetails from './pages/TeamDetails';
import Leagues from './pages/Leagues';
import CreateLeague from './pages/CreateLeague';
import LeagueDetails from './pages/LeagueDetails';
import CoachDashboard from './pages/CoachDashboard';
import CreateTrainingProgram from './pages/CreateTrainingProgram';
import TrainingPrograms from './pages/TrainingPrograms';
import TrainingProgramDetails from './pages/TrainingProgramDetails';
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
    "ContactUs": ContactUs,
    "TermsOfUse": TermsOfUse,
    "PrivacyPolicy": PrivacyPolicy,
    "Teams": Teams,
    "CoachProfile": CoachProfile,
    "CreateTeam": CreateTeam,
    "TeamDetails": TeamDetails,
    "Leagues": Leagues,
    "CreateLeague": CreateLeague,
    "LeagueDetails": LeagueDetails,
    "CoachDashboard": CoachDashboard,
    "CreateTrainingProgram": CreateTrainingProgram,
    "TrainingPrograms": TrainingPrograms,
    "TrainingProgramDetails": TrainingProgramDetails,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};