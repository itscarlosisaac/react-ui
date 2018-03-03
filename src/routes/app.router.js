import React from 'react';
import { BrowserRouter as Router, Link, Switch, NavLink, Route } from 'react-router-dom';

// Import Components
import Nav from '../components/statics/Navigation';
import Footer from '../components/statics/Footer';

// Pages
import Homepage from '../components/pages/Homepage'

const AppRouter = () => (
 <Router>
  <div className="app">
   <div className="app__static">
    <aside className="app__sidebar">
     <Nav/>
    </aside>
    <div className="app__content">
     <Switch>
      <Route exact={true} path="/" component={Homepage} />
     </Switch>
     <Footer />
    </div>
   </div>
  </div>
 </Router>
)

export default AppRouter;