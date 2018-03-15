import React, { Component } from 'react'

class CinemaSeat extends Component {
 constructor(props){
  super(props);
  this.state = {
   rowLetters: ['A', 'B', 'C', 'D', 'F', 'G', 'H', 'I', 'J', 'K' ] ,
   status: ''
  }
 }
 render () {
  return (
   <div>
    | {this.props.number}{this.state.rowLetters[this.props.row]} |
   </div>
  )
 }
}

export default CinemaSeat