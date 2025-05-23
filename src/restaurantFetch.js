import {YELP_API_KEY} from "@env";
import axios from "axios";

const apiKey = YELP_API_KEY;

// Library that helps allows you to send HTTP requests to the API endpoint.
const restaurant = async (categoryParams, priceRange) => {

  const search_endpoint = 'https://api.yelp.com/v3/businesses/search';

  let categories = categoryParams ? categoryParams : ['coffee', 'restaurant', 'food'];
  const location = 'The Ave, Seattle, WA'
  const limit = 10;
  const radius = 10000;  // 1 km radius

  // Example user input

  // Check if user provided any categories

  console.log(categories);

  // Build query parameters object
  let params = {
    categories: categories.join(','),
    location: location,
    limit: limit,
    radius: radius,
    sort_by: 'best_match', // sort by rating and review count
  };
  if(priceRange){
    params.price = priceRange.toString();
  }

  let businesses;

  await axios.get(search_endpoint, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    params,
  }).then(response => {
    businesses = response.data.businesses;

    // Randomly select one restaurant from the top 5 matching restaurants
    // const randomIndex = Math.floor(Math.random() * businesses.length);
    // restaurant = businesses[randomIndex];
  }).catch(error => {
    console.log(error);
  });

  return businesses;
}

export default restaurant;