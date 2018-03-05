import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import CustomLink from "./CustomLink";

console.log(<CustomLink />);
class Nav extends Component {
  render() {
    return (
      <aside className="app__sidebar">
        <ul className="app__sidebar--menu">
          <CustomLink to="/">Home</CustomLink>
          <CustomLink to="/calculator">Calculator</CustomLink>
        </ul>
      </aside>
    );
  }
}

export default Nav;
