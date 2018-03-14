import React, { Component } from 'react'
import SimpleProduct from './SimpleProduct';

class RelatedProduct extends Component {

 render () {
  return (
   <div className="sp__card__app--related">
    <header>
     <h3>Related Products</h3>
    </header>
    {
     this.props.data.map( (product, index) => {
      return (
       <SimpleProduct 
        handleChange={this.props.handleChange.bind(this)} 
        key={index} 
        data={product} />
      );
     })
    }
   </div>
  );
 }
}

export default RelatedProduct