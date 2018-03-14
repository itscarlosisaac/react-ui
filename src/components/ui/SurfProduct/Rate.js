import React, { Component } from 'react'

class Rate extends Component {
 render () {
  const toRender = []
  for( let r = 1; r <= this.props.rating; r ++){
   toRender.push(<i key={r}>{r}</i>)
  }
  return (
   <div className="sp__card__app--rate">
     {toRender}
   </div>
  )
 }
}

export default Rate