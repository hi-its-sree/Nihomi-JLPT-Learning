import meetingSomeone from './meetingSomeone'
import introducingYourself from './introducingYourself'
import orderingFood from './orderingFood'
import shopping from './shopping'
import askingDirections from './askingDirections'
import visitingStation from './visitingStation'
import hotelCheckIn from './hotelCheckIn'

export const DIALOGUE_SCRIPTS = {
  [meetingSomeone.id]: meetingSomeone,
  [introducingYourself.id]: introducingYourself,
  [orderingFood.id]: orderingFood,
  [shopping.id]: shopping,
  [askingDirections.id]: askingDirections,
  [visitingStation.id]: visitingStation,
  [hotelCheckIn.id]: hotelCheckIn,
}

export const SCENARIO_ORDER = [
  meetingSomeone.id,
  introducingYourself.id,
  orderingFood.id,
  shopping.id,
  askingDirections.id,
  visitingStation.id,
  hotelCheckIn.id,
]
