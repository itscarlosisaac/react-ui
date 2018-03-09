import React, { Component } from 'react'

class Header extends Component {
 render () {
  return (
   <header className="app__ui__header">
     <h1 className="app__ui__header--title">{this.props.title}</h1>
     <p className="app__ui__header--description">{this.props.description}</p>
     <div className="app__ui__header--divider"></div>
   </header>
  )
 }
}

export default Header