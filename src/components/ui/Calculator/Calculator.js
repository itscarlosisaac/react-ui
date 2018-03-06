import React, { Component } from "react";
import Number from "./Number";
import Sign from "./Sign";
import ResultScreen from "./ResultScreen";
import HistoryScreen from "./HistoryScreen";

class Calculator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numbers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      signs: ["*", "+", "-", "/", "%", "="],
      operation: "",
      history: "History",
      temp: ""
    };
  }

  handleAddNumber(num) {
    console.log(num);
  }

  render() {
    return (
      <div className="calculator__app">
        <HistoryScreen history={this.state.history} />
        <ResultScreen />
        {this.state.numbers.map(num => {
          return (
            <Number
              handleAddNumber={this.handleAddNumber.bind(this)}
              key={num}
              number={num}
            />
          );
        })}

        {this.state.signs.map(s => {
          return <Sign key={s} sign={s} />;
        })}
      </div>
    );
  }
}

export default Calculator;
