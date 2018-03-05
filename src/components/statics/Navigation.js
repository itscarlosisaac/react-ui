import React, { Component } from "react";
import { NavLink } from "react-router-dom";

class Nav extends Component {
  render() {
    return (
      <aside className="app__sidebar">
        <ul className="app__sidebar" className="app__sidebar--menu">
          <NavLink className="app__sidebar--link" to="/">
            Link
          </NavLink>
          <NavLink className="app__sidebar--link" to="/calculator">
            Link
          </NavLink>
        </ul>
      </aside>
    );
  }
}

export default Nav;
