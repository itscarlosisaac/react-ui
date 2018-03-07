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
      operation: '',
      history: "History",
      result: ''
    };
  }

  handleAddNumber(num) {
    this.setState(prevState => {
      let operation = prevState.operation += num;
      return { operation };
    });
  }

  handleAddSign(sign) {
    if (this.state.operation == '') return;
    this.setState( prevState => {
      const operation = prevState.operation += sign
      return { operation };
    });
  }

  handlePerformOperation() {
    var args = this.state.operation;
    const lastChar = args[args.length - 1];
    if( this.state.signs.indexOf(lastChar) !== -1){
      args = args.slice(0, -1)
    }
    const operation = args;
    const result = eval(operation);
    this.setState(prev => ({ result, operation  }) );
  }

  render() {
    return (
      <div className="calculator__app">
        <HistoryScreen history={this.state.history} />
        <ResultScreen operation={this.state.operation} />
        <h1>{this.state.result}</h1>
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
          return (
            <Sign
              handleAddSign={this.handleAddSign.bind(this)}
              handlePerformOperation={this.handlePerformOperation.bind(this)}
              key={s}
              sign={s}
            />
          );
        })}
      </div>
    );
  }
}

export default Calculator;
