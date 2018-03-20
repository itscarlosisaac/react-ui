import React, { Component } from 'react'
import EventEmitter from './EventEmitter'

class User extends Component {
 constructor(props){
  super(props);
  this.state = {
   tickets: [],
   ticketsCount: 0
  }
 }
 
 componentWillMount() {
  EventEmitter.on( 'update', ( count, ticketRow, number ) => {
   this.setState( (prevState, nextState) => {
    const sel = ticketRow + number.toString();

    const ticketsRow = 
     prevState.tickets.includes(sel) ? 
     prevState.tickets.filter( (item) => { return item != sel }) : 
     prevState.tickets.concat(sel)

    return {
     tickets: ticketsRow,
     ticketsCount: count
    }
   })
  })
 }

 render () {
  return (
   <div>
    <div>
     <h3>Name</h3>
     <p>{this.props.name}</p>
    </div>
    <div>
     <h3>Tickets</h3>
     { <h4>{this.state.tickets.join(', ')}</h4> }
    </div>
    <div>
     <h2>Price</h2>
     <p>{(this.state.ticketsCount * 6.48).toFixed(2) }</p>
    </div>
   </div>
  )
 }
}

export default User