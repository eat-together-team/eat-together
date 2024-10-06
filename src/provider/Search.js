import axios from 'axios';

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
        limit: options.maxSearchResultsSize,
        // categories: "food"
      }
    });
    return response.data.businesses.map(business => ({id: business.id, name: business.name }));
  } catch(err) {
    return [{id: "xxx", name: err.toString()}];
  }

}
