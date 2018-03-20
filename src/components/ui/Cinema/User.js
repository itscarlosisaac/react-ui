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
  EventEmitter.on( 'update', (count) => {
   this.setState( (prevState) => {
    return {
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
     <p>{this.state.tickets}</p>
    </div>
    <div>
     <h2>Price</h2>
     <p>{this.state.ticketsCount * 6.48 }</p>
    </div>
   </div>
  )
 }
}

export default User