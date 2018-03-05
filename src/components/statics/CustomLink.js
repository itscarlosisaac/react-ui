import React from "react";
import { NavLink } from "react-router-dom";

class CustomLink extends React.Component {
  render() {
    return (
      <li>
        <NavLink
          exact
          activeClassName="app__sidebar--link--active"
          className="app__sidebar--link"
          to={this.props.to}
        >
          {this.props.children}
        </NavLink>
      </li>
    );
  }
}

export default CustomLink;
