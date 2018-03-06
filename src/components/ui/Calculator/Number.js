import React, { Component } from "react";

class Number extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleAddNumber() {
    this.props.handleAddNumber(this.props.number);
  }

  render() {
    return (
      <button onClick={this.handleAddNumber.bind(this)}>
        {this.props.number}
      </button>
    );
  }
}

export default Number;
