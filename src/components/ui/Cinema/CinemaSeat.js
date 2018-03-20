import React, { Component } from 'react'
import EventEmitter from './EventEmitter'


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

 componentDidUpdate (prevProps, prevState) {
    const count = document.querySelectorAll('.cinema__app__seat--selected').length;
    const row = this.state.rowLetters[this.props.row];
    const num = this.props.number
    EventEmitter.emit('update', count, row, num  )
 }
 
 render () {
  return (
   <div 
    className={this.state.selected ? "cinema__app__seat--selected" : "cinema__app__seat"} 
    letter={this.state.rowLetters[this.props.row]} 
    onClick={this.toggleActive.bind(this)}
   >

    <svg width="29px" height="28px" viewBox="0 0 29 28" version="1.1" >
     <defs>
         <path d="M2,0 L27,0 C28.1045695,-2.02906125e-16 29,0.8954305 29,2 L29,17 C29,18.1045695 28.1045695,19 27,19 L2,19 C0.8954305,19 1.3527075e-16,18.1045695 0,17 L0,2 C-1.3527075e-16,0.8954305 0.8954305,-6.85272294e-16 2,-8.8817842e-16 Z M5,21 L25,21 L25,25.5 C25,26.8807119 23.8807119,28 22.5,28 L7.5,28 C6.11928813,28 5,26.8807119 5,25.5 L5,21 Z" id="path-1"></path>
     </defs>
     <g id="Page-1" stroke={this.state.selected ? "#FBBC3D" : "none"} strokeWidth="1" fill={this.state.selected ? "#FBBC3D" : "none"} fillRule="evenodd">
         <g id="Combined-Shape">
         <path stroke={this.state.selected ? "#FBBC3D" : "#4F5F6F"} strokeWidth="1" d="M2,0.5 C1.17157288,0.5 0.5,1.17157288 0.5,2 L0.5,17 C0.5,17.8284271 1.17157288,18.5 2,18.5 L27,18.5 C27.8284271,18.5 28.5,17.8284271 28.5,17 L28.5,2 C28.5,1.17157288 27.8284271,0.5 27,0.5 L2,0.5 Z M5.5,21.5 L5.5,25.5 C5.5,26.6045695 6.3954305,27.5 7.5,27.5 L22.5,27.5 C23.6045695,27.5 24.5,26.6045695 24.5,25.5 L24.5,21.5 L5.5,21.5 Z"></path>
          <text id="4" fill="#F00" textAnchor="middle">
           <tspan x="15" y="13">{this.props.number}</tspan>
          </text>
         </g>
     </g>
    </svg>
   </div>

  )
 }
}

export default CinemaSeat