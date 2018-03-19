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
   <div className="cinema__app__seat" letter={this.state.rowLetters[this.props.row]} onClick={this.toggleActive.bind(this)}>
    | {this.props.number}{this.state.rowLetters[this.props.row]} |

    <svg width="20px" height="19px" viewBox="0 0 20 19" version="1.1">
        <defs>
            <path d="M2,0 L18,0 C19.1045695,-2.02906125e-16 20,0.8954305 20,2 L20,11 C20,12.1045695 19.1045695,13 18,13 L2,13 C0.8954305,13 1.3527075e-16,12.1045695 0,11 L0,2 C-1.3527075e-16,0.8954305 0.8954305,2.02906125e-16 2,0 Z M3,14 L17,14 L17,16.5 C17,17.8807119 15.8807119,19 14.5,19 L5.5,19 C4.11928813,19 3,17.8807119 3,16.5 L3,14 Z" id="path-1"></path>
        </defs>
        <g id="Page-1" stroke="none" stroke-width="1" fill={this.state.selected ? "#FBBC3D" : "none"} fill-rule="evenodd">
            <g id="Combined-Shape">
                
                <path stroke={this.state.selected ? "#FBBC3D" : "#4F5F6F"} stroke-width="1" d="M2,0.5 C1.17157288,0.5 0.5,1.17157288 0.5,2 L0.5,11 C0.5,11.8284271 1.17157288,12.5 2,12.5 L18,12.5 C18.8284271,12.5 19.5,11.8284271 19.5,11 L19.5,2 C19.5,1.17157288 18.8284271,0.5 18,0.5 L2,0.5 Z M3.5,14.5 L3.5,16.5 C3.5,17.6045695 4.3954305,18.5 5.5,18.5 L14.5,18.5 C15.6045695,18.5 16.5,17.6045695 16.5,16.5 L16.5,14.5 L3.5,14.5 Z"></path>
            </g>
        </g>
    </svg>
   </div>

  )
 }
}

export default CinemaSeat