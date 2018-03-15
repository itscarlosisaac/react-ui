import React, { Component } from 'react'

class MovieSidebar extends Component {
 render () {
  const { name, description, length, year, categories, contentRating, rating, trailerUrl } = this.props.movie
  return (
   <aside>
    <div>
     <video src={trailerUrl}></video>
    </div>
    <div>
     <div className="rating"></div>
     <h3>{name}</h3>
     <p>
      <span>{length} min</span>
      <span>{categories.join(" / ")}</span>
      <span>{year}</span>
     </p>
     <p>{description}</p>
    </div>
   </aside>
  )
 }
}

export default MovieSidebar