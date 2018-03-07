import React, { Component } from 'react'

class Homepage extends Component {
 render () {
  return (
   <div className="app__homepage">
    <h1 className="app__homepage--title">UI React Portfolio</h1>
    <p className="app__homepage--desc">
     This is an small portfolio I've been working on in order to learn and practice new things with React.js / Node / Express and some other libraries I want to learn.
    </p>
    <small className="app__homepage--disclaimer">
      Disclaimer: Hope you enjoy what you see here.
    </small>
   </div>
  )
 }
}

export default Homepage