import React, { Component } from 'react'
import Header from '../Header';
import MovieSidebar from './MovieSidebar';
import Theater from './Theater';
import { Rooms, Movies } from './Data/Data';
class CinemaApp extends Component {
 
 constructor(props){
  super(props);
  this.state = {
   "movie": 1,
   "room": 1
  }
 }

 componentWillMount() {
  this.setState( () => {
   return { movie: Movies[0], "room": Rooms[0] }
  })
 }
 
 render () {
  return (
   <div>
    <Header title="Cinema App" description="Movie Theather Ticket App." />
    <div className="cinema__app">
     <header className="cinema__app__header">
       <h3>Reserve your ticket</h3>
     </header>
     <div className="cinema__app__body">
      <MovieSidebar movie={this.state.movie} />
      <Theater room={this.state.room} />
     </div>
    </div>
   </div>
  )
 }
}

export default CinemaApp