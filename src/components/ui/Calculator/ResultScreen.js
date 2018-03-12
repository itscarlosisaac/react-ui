import React, { Component } from "react";

class ResultScreen extends Component {
  
  render() {
    const op = this.props.operation;
    return <div className={ op !== "" ? "calculator__app--results" : "calculator__app--results calculator__app--results--empty" }>{op}</div>;
  }
}

export default ResultScreen;
