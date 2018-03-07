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
    const isZero = this.props.number === 0 ? 'is--zero' : '';
    return (
      <button className={`calculator__app--number ${isZero}`} onClick={this.handleAddNumber.bind(this)}>
        {this.props.number}
      </button>
    );
  }
}

export default Number;
