import React, { Component } from 'react'

class SimpleProduct extends Component {
 constructor(props){
  super(props);
  this.state = {
   "title": "",
   "smallTitle": "",
   "description": "",
   "size": "",
   "rate": "",
   "price": ""
  }
 }

 
 componentWillMount() {
  const { title, smallTitle, description, size, rate, price } = this.props.data
  this.setState( (prev) => ({
   title, smallTitle, description, size, rate, price
  }))
 }
 

 handleChange(){
  this.props.handleChange(this.state);
 }

 render () {
  return (
   <div onClick={this.handleChange.bind(this)} className="sp__card__app--simple--product">
    <div className="div">
     <img src={this.state.image} alt={this.state.smallTitle}/>
    </div>
    <div className="div">
    <h4>{this.state.smallTitle}</h4>
    <small>{this.state.price}</small>
    </div>
   </div>
  );
 }
}

export default SimpleProduct