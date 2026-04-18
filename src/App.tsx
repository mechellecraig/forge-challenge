import { Switch, Route, Redirect } from "wouter";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/lib/auth";
import Leaderboard from "@/pages/Leaderboard";
import Teams from "@/pages/Teams";
import Standings from "@/pages/Standings";
import Overview from "@/pages/Overview";
import Announcements from "./pages/Announcements";
import LogActivity from "@/pages/LogActivity";
import MyStats from "@/pages/MyStats";
import Admin from "@/pages/Admin";
import Login from "@/pages/Login";
import SelectProfile from "@/pages/SelectProfile";
import Profile from "@/pages/Profile";
export default function App() {
  const { user, member, loading } = useAuth();
  const hasAuthToken =
    window.location.hash.includes("access_token") ||
    window.location.hash.includes("type=magiclink") ||
    window.location.search.includes("code=");
  if (loading || hasAuthToken) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/30 text-sm">Signing you in...</div>
      </div>
    );
  }
  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route><Redirect to="/login" /></Route>
      </Switch>
    );
  }
  if (!member) {
    return <SelectProfile />;
  }
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Overview} />
        <Route path="/announcements" component={Announcements} />
        <Route path="/standings" component={Standings} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/teams" component={Teams} />
        <Route path="/log" component={LogActivity} />
        <Route path="/me" component={MyStats} />
        <Route path="/admin" component={Admin} />
        <Route path="/profile" component={Profile} />
        <Route><Redirect to="/standings" /></Route>
      </Switch>
    </Layout>
  );
}
