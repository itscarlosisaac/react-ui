import React, { Component } from "react";
import Number from "./Number";
import Sign from "./Sign";
import ResultScreen from "./ResultScreen";
import HistoryScreen from "./HistoryScreen";

class Calculator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, "."],
      signs: ["*", "+", "-", "/", "%", "="],
      operation: "",
      history: "0",
      result: "0",
      hasDecimal: false
    };
  }

  handleAddNumber(num) {
    if ( this.state.operation.includes('.') && num == '.' ) return;
    this.setState(prevState => {
      let operation = (prevState.operation += num);

      return {
        operation
      };
    });
  }

  handleReset() {
    this.setState(prev => {
      let h = prev.operation;
      return {
        operation: "",
        result: "0"
      };
    });
  }

  handleAddSign(sign) {
    let lastChar = this.state.operation[this.state.operation.length - 1];
    let operation;
    if (this.state.operation == "" ) return;
    this.setState(prevState => {
      this.state.signs.indexOf(lastChar) == -1
        ? (operation = prevState.operation += sign)
        : (operation = prevState.operation.slice(0, -1) + sign.toString());
      return {
        operation
      };
    });
  }

  handlePerformOperation() {
    var args = this.state.operation;
    const lastChar = args[args.length - 1];
    if (this.state.signs.indexOf(lastChar) !== -1) {
      args = args.slice(0, -1);
    }
    const operation = args;
    const result = eval(operation);
    this.setState(prev => ({
      result,
      history: operation,
      operation: result
    }));
  }

  render() {
    return (
      <div className="calculator__app">
        <header className="calculator__app--header">
          <HistoryScreen history={this.state.history} />
          <ResultScreen operation={this.state.operation} />
        </header>
        <section className="calculator__app--body">
          <div className="calculator__app--numbers">
            <button
              className="calculator__app--reset"
              onClick={this.handleReset.bind(this)}
            >
              {" "}
              C{" "}
            </button>
            <Sign
              handleAddSign={this.handleAddSign.bind(this)}
              handlePerformOperation={this.handlePerformOperation.bind(this)}
              sign={"%"}
            />
            {this.state.numbers.map(num => {
              return (
                <Number
                  handleAddNumber={this.handleAddNumber.bind(this)}
                  key={num}
                  number={num}
                />
              );
            })}
          </div>
          <div className="calculator__app--signs">
            {this.state.signs.map(s => {
              if (s === "%") return;
              return (
                <Sign
                  handleAddSign={this.handleAddSign.bind(this)}
                  handlePerformOperation={this.handlePerformOperation.bind(
                    this
                  )}
                  key={s}
                  sign={s}
                />
              );
            })}
          </div>
        </section>
      </div>
    );
  }
}

export default Calculator;
