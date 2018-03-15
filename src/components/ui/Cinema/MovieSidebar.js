import React, { Component } from 'react'

class MovieSidebar extends Component {
 render () {
  const { name, description, length, year, categories, contentRating, rating, trailerUrl } = this.props.movie
  return (
   <aside>
    <div>
     <iframe width="560" height="315" src={trailerUrl} frameborder="0" allow="autoplay; encrypted-media"></iframe>
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