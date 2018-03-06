import React from "react";
import {
  BrowserRouter as Router,
  Link,
  Switch,
  NavLink,
  Route
} from "react-router-dom";

// Import Components
import Nav from "../components/statics/Navigation";
import Footer from "../components/statics/Footer";
import Hamburguer from "../components/statics/Hamburguer";

// Pages
import Homepage from "../components/pages/Homepage";

// Components
import Calculator from "../components/ui/Calculator/Calculator";

const AppRouter = () => (
  <Router>
    <div className="app">
      <Hamburguer />
      <div className="app__static">
        <Nav />
        <div className="app__content">
          <Switch>
            <Route exact={true} path="/" component={Homepage} />
            <Route exact={true} path="/calculator" component={Calculator} />
          </Switch>
          <Footer />
        </div>
      </div>
    </div>
  </Router>
);

export default AppRouter;
