// import file db-city
import { postalCodes as db } from '../../data/db-city-cp-chile';

export function getZipCodeByCity(city: string): string | null {
  // Check if the city exists in the database
  const cityData = db.cityAndcode.find((item) => item.city.toLowerCase() === city.toLowerCase());

  // If the city exists, return the zip code
  if (cityData) {
    return cityData.postal_code.toString();
  }

  // If the city does not exist, return null
  return null;
}
