import React, { Component } from 'react'
import SeatRow from './SeatRow';

class Theater extends Component {

 calculateRows(){
  const { rows } = this.props.room
  const result = []
  for( let i = 0; i < rows; i++  ){
    result.push(<SeatRow className="cinema__app__row" key={i} room={this.props.room} seats={this.props.room.seats[i]} />);
  }
  return result;
 }

 render () {
  const { name } = this.props.room;
  return (
   <div className="cinema__app__theater">
    <header><h1 className="cinema__app__theater__title">{name}</h1></header>
    <div className="cinema__app__screen">
      <div className="cinema__app__screen--inner"></div>
      <div className="cinema__app__screen--glow"></div>
    </div>
    { this.calculateRows() }
   </div>
  )
 }
}

export default Theater