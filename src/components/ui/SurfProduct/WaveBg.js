import React, { Component } from 'react'

class WaveBg extends Component {
 render () {
  return (
   <div className="app__wave__container">
    <div className='app__wave app__wave--one'></div>
    <div className='app__wave app__wave--two'></div>
    <div className='app__wave app__wave--three'></div>
    <div className='app__wave app__wave--four'></div>
   </div>
  )
 }
}

export default WaveBg