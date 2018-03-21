import React from 'react';

const Rooms = [
 {
  "id": 1,
  "name": "CXC - 3D | Room",
  "rows": 8,
  "rowLetters": ['A', 'B', 'C', 'D', 'F', 'G', 'H', 'I', 'J', 'K' ] ,
  "seats": [ 9, 9, 11, 11, 13, 13, 11, 9 ]
 },
 {
  "id": 2,
  "name": "3D | VIP Room",
  "rows": 6,
  "rowLetters": ['A', 'B', 'C', 'D', 'F', 'G', 'H', 'I', 'J', 'K' ] ,
  "seats": [ 7, 9, 11, 11, 9, 7 ]
 },
]

const Movies = [
 {
  "roomId": 1,
  "name": "Guardians of the Galaxy",
  "description": "A group of intergalactic criminals are forced to work together to stop a fanatical warrior from taking control of the universe." ,
  "length": 121, 
  "year": 2014,
  "categories": [ "adventure", "science fiction", "action" ],
  "contentRating": "PG-13",
  "rating": 4,
  "trailerUrl": "https://www.youtube.com/embed/d96cjJhvlMA?rel=0&amp;showinfo=0"
 }
]

const Status = [ 
 {
  type: "Available",
  color: "red"
 },
 {
  type: "Reserved",
  color: "red"
 },
 {
  type: "Selected",
  color: "red"
 },
 {
  type: "Disabled",
  color: "red"
 }
]

module.exports = { Rooms, Movies, Status };