import { useAuth } from "@/hooks/useAuth";
import { Router, Route, Switch } from "wouter";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Inventory from "@/pages/Inventory";
import Products from "@/pages/Products";
import PointOfSale from "@/pages/PointOfSale";
import Transactions from "@/pages/Transactions";
import Reports from "@/pages/Reports";
import Employees from "@/pages/Employees";
import CashFlow from "@/pages/CashFlow";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/products" component={Products} />
          <Route path="/pos" component={PointOfSale} />
          <Route path="/transactions" component={Transactions} />
          <Route path="/reports" component={Reports} />
          <Route path="/employees" component={Employees} />
          <Route path="/cash-flow" component={CashFlow} />
          <Route path="/admin" component={Admin} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <Router>
      <AppRouter />
    </Router>
  );
}