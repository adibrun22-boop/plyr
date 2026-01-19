import Achievements from './pages/Achievements';
import CoachDashboard from './pages/CoachDashboard';
import CoachProfile from './pages/CoachProfile';
import ContactUs from './pages/ContactUs';
import CreateEvent from './pages/CreateEvent';
import CreateLeague from './pages/CreateLeague';
import CreateTeam from './pages/CreateTeam';
import CreateTrainingProgram from './pages/CreateTrainingProgram';
import EditProfile from './pages/EditProfile';
import EventDetails from './pages/EventDetails';
import Events from './pages/Events';
import Feed from './pages/Feed';
import FindFriends from './pages/FindFriends';
import FriendRequests from './pages/FriendRequests';
import Home from './pages/Home';
import LeagueDetails from './pages/LeagueDetails';
import Leagues from './pages/Leagues';
import Notifications from './pages/Notifications';
import Onboarding from './pages/Onboarding';
import PostGame from './pages/PostGame';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import TeamDetails from './pages/TeamDetails';
import Teams from './pages/Teams';
import TermsOfUse from './pages/TermsOfUse';
import TrainingProgramDetails from './pages/TrainingProgramDetails';
import TrainingPrograms from './pages/TrainingPrograms';
import EditTrainingProgram from './pages/EditTrainingProgram';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Achievements": Achievements,
    "CoachDashboard": CoachDashboard,
    "CoachProfile": CoachProfile,
    "ContactUs": ContactUs,
    "CreateEvent": CreateEvent,
    "CreateLeague": CreateLeague,
    "CreateTeam": CreateTeam,
    "CreateTrainingProgram": CreateTrainingProgram,
    "EditProfile": EditProfile,
    "EventDetails": EventDetails,
    "Events": Events,
    "Feed": Feed,
    "FindFriends": FindFriends,
    "FriendRequests": FriendRequests,
    "Home": Home,
    "LeagueDetails": LeagueDetails,
    "Leagues": Leagues,
    "Notifications": Notifications,
    "Onboarding": Onboarding,
    "PostGame": PostGame,
    "PrivacyPolicy": PrivacyPolicy,
    "Profile": Profile,
    "Settings": Settings,
    "TeamDetails": TeamDetails,
    "Teams": Teams,
    "TermsOfUse": TermsOfUse,
    "TrainingProgramDetails": TrainingProgramDetails,
    "TrainingPrograms": TrainingPrograms,
    "EditTrainingProgram": EditTrainingProgram,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};