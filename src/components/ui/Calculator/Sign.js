import React, { Component } from "react";

class Sign extends Component {
  handleAddSign() {
    this.props.sign == "="
      ? this.props.handlePerformOperation()
      : this.props.handleAddSign(this.props.sign);
  }
  render() {
    return (
      <button onClick={this.handleAddSign.bind(this)}>{this.props.sign}</button>
    );
  }
}

export default Sign;
