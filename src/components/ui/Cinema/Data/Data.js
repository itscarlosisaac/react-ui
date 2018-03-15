
const Rooms = [
 {
  "id": 1,
  "name": "Room 1",
  "rows": 8,
  "seats": [ 11, 11, 13, 13, 17, 17, 17, 13 ]
 }
]

const Movies = [
 {
  "roomId": 1,
  "name": "Guardian of the Galaxia",
  "description": "A group of intergalactic criminals are forced to work together to stop a fanatical warrior from taking control of the universe." ,
  "length": 121, 
  "year": 2014,
  "categories": [ "adventure", "science fiction", "action" ],
  "contentRating": "PG-13",
  "rating": 4,
  "trailerUrl": "https://www.youtube.com/watch?v=d96cjJhvlMA"
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