import React, { Component } from 'react'

class SimpleProduct extends Component {
 render () {
  return (
   <div className="sp__card__app--simple--product">
    <div className="div">
     <img src={this.props.image} alt={this.props.title}/>
    </div>
    <div className="div">
    <h4>{this.props.title}</h4>
    <small>{this.props.price}</small>
    </div>
   </div>
  );
 }
}

export default SimpleProduct