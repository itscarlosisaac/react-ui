import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import CustomLink from "./CustomLink";
class Nav extends Component {
  
  render() {
    const state = this.props.menuOpen
      ? "app__sidebar--open"
      : "app__sidebar--close";
    return (
      <aside className={`app__sidebar ${state}`}>
        <ul className="app__sidebar--menu">
          <CustomLink to="/" handleMenu={this.props.handleMenu.bind(this) }>Home</CustomLink>
          <CustomLink to="/calculator" handleMenu={this.props.handleMenu.bind(this) }>Calculator</CustomLink>
          <CustomLink to="/surf" handleMenu={this.props.handleMenu.bind(this) }>Surf Product</CustomLink>
        </ul>
      </aside>
    );
  }
}

export default Nav;
