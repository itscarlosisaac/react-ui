import React, { Component } from "react";

class Sign extends Component {
  handleAddSign() {
    this.props.sign == "="
      ? this.props.handlePerformOperation()
      : this.props.handleAddSign(this.props.sign);
  }
  render() {
    return (
      <button className="calculator__app--sign" onClick={this.handleAddSign.bind(this)}>{this.props.sign}</button>
    );
  }
}

export default Sign;
