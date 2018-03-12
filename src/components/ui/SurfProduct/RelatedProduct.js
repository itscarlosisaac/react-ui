import React, { Component } from 'react'
import SimpleProduct from './SimpleProduct';

class RelatedProduct extends Component {
 render () {
  return (
   <div className="sp__card__app--related">
    <header>
     <h3>Related Product</h3>
    </header>
    {
     this.props.data.map( (product, index) => {
      return <SimpleProduct key={index} title={product.smallTitle} price={product.price} />
     } )
    }
   </div>
  );
 }
}

export default RelatedProduct