import { Switch, Route, Redirect } from "wouter";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/lib/auth";
import Leaderboard from "@/pages/Leaderboard";
import Teams from "@/pages/Teams";
import Overview from "@/pages/Overview";
import LogActivity from "@/pages/LogActivity";
import MyStats from "@/pages/MyStats";
import Admin from "@/pages/Admin";
import Login from "@/pages/Login";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-white/30 text-sm">Loading...</div>
    </div>
  );

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/auth/callback">
        {user ? <Redirect to="/" /> : <Redirect to="/login" />}
      </Route>
      <Route>
        {!user ? <Redirect to="/login" /> : (
          <Layout>
            <Switch>
              <Route path="/" component={Overview} />
              <Route path="/leaderboard" component={Leaderboard} />
              <Route path="/teams" component={Teams} />
              <Route path="/log" component={LogActivity} />
              <Route path="/me" component={MyStats} />
              <Route path="/admin" component={Admin} />
            </Switch>
          </Layout>
        )}
      </Route>
    </Switch>
  );
}
