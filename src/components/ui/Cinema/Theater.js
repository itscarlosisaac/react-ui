import React, { Component } from 'react'
import CinemaSeat from './CinemaSeat';
import SeatRow from './SeatRow';

class Theater extends Component {

 calculateSeats(iterator){
  const { seats } = this.props.room;
  const seat =[]
  for( let e = 1; e <= seats[iterator]; e++ ){
    seat.push(<CinemaSeat className="cinema__app__seat" key={e} row={iterator} number={e} />);
  }
  return seat;
 }

 calculateRows(){
  const {rows} = this.props.room
  const rowsHtml = []
  for( let i = 0; i <= rows; i++  ){
   rowsHtml.push(<div className="cinema__app__row" key={i}>{this.calculateSeats(i)}</div>);
  }
  return rowsHtml;
 }

 render () {
  const { name } = this.props.room;
  return (
   <div>
   <header>{name}
   </header>
   <div className="cinema__app__screen">
    <div className="cinema__app__screen--inner"></div>
   </div>
   <div className="cinema__app__seats__container">
    { this.calculateRows() }
   </div>
   </div>
  )
 }
}

export default Theater