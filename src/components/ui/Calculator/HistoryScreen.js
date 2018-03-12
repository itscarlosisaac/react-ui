import React, { Component } from "react";

class HistoryScreen extends Component {
  render() {
    return <div className="calculator__app--history">{this.props.history}</div>;
  }
}

export default HistoryScreen;
