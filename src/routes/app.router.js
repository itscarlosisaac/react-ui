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
import SurfProductCard from '../components/ui/SurfProduct/SurfProductCard';

class AppRouter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      menuOpen: false
    };
  }

  handleMenu() {
    const prev = this.state.menuOpen;
    this.setState({ menuOpen: !prev });
  }

  render() {
    return (
      <Router>
        <div className="app">
          <Hamburguer
            menuOpen={this.state.menuOpen}
            handleMenu={this.handleMenu.bind(this)}
          />
          <div className="app__static">
            <Nav menuOpen={this.state.menuOpen} handleMenu={this.handleMenu.bind(this)} />
            <div className="app__content">
              <div className="app__component__container">
              <Switch>
                <Route exact={true} path="/" component={Homepage} />
                <Route exact={true} path="/calculator" component={Calculator} />
                <Route exact={true} path="/surf" component={SurfProductCard} />
              </Switch>
              </div>
              <Footer />
            </div>
          </div>
        </div>
      </Router>
    );
  }
}

export default AppRouter;
