import React, { Component } from 'react'
import Header from '../Header';
import ProductData from './Data/data';
import RelatedProduct from './RelatedProduct';
import Rate from './Rate';

class SurfProductCard extends Component {
 constructor(props){
  super(props);
  this.state = {
   data: [],
   "title": "",
   "smallTitle": "",
   "description": "",
   "size": "",
   "rate": "",
   "price": ""
  }
 }

 componentWillMount(){
  this.setState((prev) => ({ 
    "data": ProductData,
    "title": ProductData[0].title,
    "smallTitle": ProductData[0].smallTitle,
    "description": ProductData[0].description,
    "size": ProductData[0].size,
    "rate": ProductData[0].rate,
    "price": ProductData[0].price,
    "imageUrl": ProductData[0].imageUrl
   })
  )
 }

 componentWillUpdate(){
  // const image = document.getElementById("sp__card__app--image");
  // image.classList.add('will--leave')
 }

 componentDidUpdate() {
  // const image = document.getElementById("sp__card__app--image");
  // setTimeout( () => {
  //  image.classList.add('will--enter')
  //  setTimeout(()=>{
  //   image.classList.remove('will--leave')
  //   image.classList.remove('will--enter')
  //  }, 1000 )
  // }, 1200 )
 }

 handleChange(data){
  const { title, smallTitle, description, size, rate, price, imageUrl } = data
  this.setState( (prev) => ({
   title, smallTitle, description, size, rate, price, imageUrl
  }))
 }

 render () {
  return (
   <div>
    <Header title="Surf Product Card" description="A Product Card with various products to practice animation on change states." />

    <div className="sp__card__app">
     <div className="sp__card__app--thumb">
      <img id="sp__card__app--image" src={this.state.imageUrl} alt=""/>
     </div>
     <div className="sp__card__app--body">
      <header className="sp__card__app--header">
       <h3 className="sp__card__app--title">{this.state.title}</h3>
       <h3 className="sp__card__app--size">{this.state.size}</h3>

       <Rate rating={this.state.rate} />

       <small  className="sp__card__app--price">${this.state.price}</small>
       <p className="sp__card__app--description">{this.state.description}</p>
       <button className="sp__card__app--button">Buy</button>
      </header>
      <RelatedProduct handleChange={this.handleChange.bind(this)} data={this.state.data} />
     </div>
    </div>
   </div>
  )
 }
}

export default SurfProductCard;