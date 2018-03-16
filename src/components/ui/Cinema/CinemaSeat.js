import React, { Component } from 'react'

class CinemaSeat extends Component {
 constructor(props){
  super(props);
  this.state = {
   rowLetters: ['A', 'B', 'C', 'D', 'F', 'G', 'H', 'I', 'J', 'K' ] ,
   selected: false,
   reserved: false,
   disabled: false
  }
 }

 toggleActive(){
  this.setState((prevState) => {
   const status = prevState.selected
   return ({ selected: !status });
  })
 }

 render () {
  return (
   <div onClick={this.toggleActive.bind(this)}>
    | {this.props.number}{this.state.rowLetters[this.props.row]} |
   </div>
  )
 }
}

export default CinemaSeat