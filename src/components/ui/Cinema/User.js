import React, { Component } from 'react'
import EventEmitter from './EventEmitter'

class User extends Component {

 
 componentWillMount() {
  EventEmitter.on( 'update', (args) => {
   console.log(args)
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
     <p>{this.props.tickets}</p>
    </div>
    <div>
     <h2>Price</h2>
     <p>{this.props.ticketsCount * 6.48 }</p>
    </div>
   </div>
  )
 }
}

export default User