import axios from 'axios/dist/axios.min.js';

export const dummySearch = (term, options) => new Promise(resolve =>
  setTimeout(
    () => resolve(Array.from(
      { length: options.maxSearchResultsSize },
      (_, index) => ({id: (index + 1).toString(), name: `${term} ${index + 1}`})
    )),
    Math.floor(Math.random() * 500) + 500 // random timeout from 500 to 999 ms
  )
);

const YELP_API_KEY = process.env.YELP_API_KEY;
const U_DISTRICT_STATION_POSITION = { lat: 47.6599616, long: -122.3140041 };
const DEFAULT_SEARCH_RADIUS = 8045;

export const yelpSearch = async (term, options) => {
  try {  
    const response = await axios.get("https://api.yelp.com/v3/businesses/search", {
      headers: {
        Authorization: `Bearer ${YELP_API_KEY}`
      },
      params: {
        term,
        radius: options?.radius ?? DEFAULT_SEARCH_RADIUS,
        latitude: options?.lat ?? U_DISTRICT_STATION_POSITION.lat,
        longitude: options?.long ?? U_DISTRICT_STATION_POSITION.long,
        limit: options.maxSearchResultsSize
      }
    });
    return response.data.businesses.map(business => ({
      id: business.id,
      name: business.name,
      address: `${business.location.address1}, ${business.location.city} ${business.location.state}, ${business.location.zip_code}`,
      // Carried through so a static map pin can be rendered without a
      // separate geocoding call — Yelp already gives us this for free.
      lat: business.coordinates?.latitude ?? null,
      lng: business.coordinates?.longitude ?? null,
    }));
  } catch {
    return [];
  }

}
