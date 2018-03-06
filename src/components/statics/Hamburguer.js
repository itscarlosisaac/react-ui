import React, { Component } from "react";

class Hamburguer extends Component {
  handleClick() {
    this.props.handleMenu();
  }

  render() {
    return (
      <div>
        <div onClick={this.handleClick.bind(this)} className="app__hamburguer">
          {this.props.menuOpen ? (
            <i className="app__hamburguer--icon app__hamburguer--white icon-close" />
          ) : (
            <i className="app__hamburguer--icon icon-menu" />
          )}
        </div>
      </div>
    );
  }
}

export default Hamburguer;
