import React, { Component } from 'react'
import CinemaSeat from './CinemaSeat';

class SeatRow extends Component {

 calculateSeats(iterator){
  const seats = []
  for( let e = 1; e <= iterator; e++ ){
   seats.push(<CinemaSeat className="cinema__app__seat" key={e} row={this.props.rowLetter} number={e} />);
  }
  return seats;
 }

 render () {
  return (
   <div className="cinema__app__seats__container">
     <div className="cinema__app__seats__row cinema__app__seats__row--left">{ this.props.rowLetter }</div>
     { this.calculateSeats( this.props.seats ) }
     <div className="cinema__app__seats__row cinema__app__seats__row--right">{ this.props.rowLetter }</div>
   </div>
  )
 }
}

export default SeatRow