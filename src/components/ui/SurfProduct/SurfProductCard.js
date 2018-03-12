import React, { Component } from 'react'
import Header from '../Header';
import Data from './Data/data';




class SurfProductCard extends Component {
 render () {
  return (
   <div>
    <Header title="Surf Product Card" description="A Product Card with various products to practice animation on change states." />
    <div className="sp__card__app">
     <div className="sp__card__app--thumb">

     </div>
     <header className="sp__card__app--header">
      <h3 className="sp__card__app--title">Pukas Magma By Mikel Agote</h3>
      <div className="rate">
       <i className="fa-star fa-icon"></i>
       <i className="fa-star fa-icon"></i>
       <i className="fa-star fa-icon"></i>
       <i className="fa-star fa-icon"></i>
       <i className="fa-star fa-icon"></i>
      </div>
      <small  className="sp__card__app--price">$547</small>
      <p  className="sp__card__app--description">Lorem ipsum dolor sit amet.</p>
      <button className="sp__card__app--button">Buy</button>
     </header>
    </div>
   </div>
  )
 }
}

export default SurfProductCard;