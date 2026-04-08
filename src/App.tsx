import { Switch, Route } from "wouter";
import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Leaderboard from "@/pages/Leaderboard";
import Teams from "@/pages/Teams";
import Overview from "@/pages/Overview";
import LogActivity from "@/pages/LogActivity";
import MyStats from "@/pages/MyStats";
import Admin from "@/pages/Admin";

export default function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Overview} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/teams" component={Teams} />
        <Route path="/log" component={LogActivity} />
        <Route path="/me" component={MyStats} />
        <Route path="/admin" component={Admin} />
      </Switch>
    </Layout>
  );
}
