import React, { Component } from 'react'

class MovieSidebar extends Component {
 render () {
  const { name, description, length, year, categories, contentRating, rating, trailerUrl } = this.props.movie
  return (
   <aside className="cinema__app__sidebar">
    <div>
     <iframe height="315" src={trailerUrl} frameBorder="0" allow="autoplay; encrypted-media"></iframe>
    </div>
    <div className="cinema__app__sidebar--content">
     <div className="rating"></div>
     <h3 className="cinema__app__sidebar--title">{name}</h3>
     <p className="cinema__app__sidebar--meta">
      <span><i className="icon icon-clock"></i>{length} min</span>
      <span><i className="icon icon-calendar"></i>{year}</span>
     </p>
     <p className="cinema__app__sidebar--meta">
     <span><i className="icon icon-menu"></i>{categories.join(" / ")}</span>
     </p>
     <p className="cinema__app__sidebar--desc">{description}</p>
    </div>
   </aside>
  )
 }
}

export default MovieSidebar