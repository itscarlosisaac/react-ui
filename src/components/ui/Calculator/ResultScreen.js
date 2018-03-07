import React, { Component } from "react";

class ResultScreen extends Component {
  render() {
    return <div className="calculator__app--results">{this.props.operation}</div>;
  }
}

export default ResultScreen;
