import React, { Component } from 'react'
import CinemaSeat from './CinemaSeat';

class SeatRow extends Component {

 calculateSeats(iterator){
  const seats = []
  for( let e = 1; e <= iterator; e++ ){
   seats.push(<CinemaSeat className="cinema__app__seat" key={e} row={iterator} number={e} />);
  }
  return seats;
 }

 render () {
  return (
   <div className="cinema__app__seats__container">
     { this.calculateSeats( this.props.seats ) }
   </div>
  )
 }
}

export default SeatRow