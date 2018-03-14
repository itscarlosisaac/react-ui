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
   "price": "",
   "imageUrl": ""
  }
 }

 
 componentWillMount() {
  const { title, smallTitle, description, size, rate, price, imageUrl } = this.props.data
  this.setState( (prev) => ({
   title, smallTitle, description, size, rate, price, imageUrl
  }))
 }
 

 handleChange(){
  this.props.handleChange(this.state);
 }

 render () {
  return (
   <div onClick={this.handleChange.bind(this)} className="sp__card__app--simple--product">
    <div className="div">
     <img src={this.state.imageUrl} width="30" alt={this.state.smallTitle}/>
    </div>
    <div className="div">
    <h4>{this.state.smallTitle}</h4>
    <small>${this.state.price}</small>
    </div>
   </div>
  );
 }
}

export default SimpleProduct