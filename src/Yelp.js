// Script to test out the Yelp API for food recommendations

const apiKey = 'Qpp5fhhif1yAux97RX4ulrRaUvGEEBr4ZfilwXQlwH763U83Tul4KUjwR7-4877bUlAFs5oh7xyy6KR3o21_ePK1xQxzlzCeltgyDO4GwTRqiUOJkLz6ga5DfpP1Y3Yx';

// Library that helps allows you to send HTTP requests to the API endpoint.
const restaurant = async () => {
  const axios = require('axios');
  const search_endpoint = 'https://api.yelp.com/v3/businesses/search';

  let categories = ['coffee', 'restaurant', 'food']; // Default categories if user doesn't provide any
  const location = 'The Ave, Seattle, WA'
  const limit = 5;
  const radius = 1000;  // 1 km radius

  // Example user input
  const userInputCategories = ['Duck lover', 'Noodles', 'Dim sum', 'Curry'];

  // Check if user provided any categories
  if (userInputCategories.length > 0) {
    categories = userInputCategories;
  }

  // Build query parameters object
  let params = {
    categories: categories.join(','),
    location: location,
    limit: limit,
    radius: radius,
    sort_by: 'best_match', // sort by rating and review count
  };

  let restaurant;

  await axios.get(search_endpoint, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    params,
  }).then(response => {
    const businesses = response.data.businesses;

    // Randomly select one restaurant from the top 5 matching restaurants
    const randomIndex = Math.floor(Math.random() * businesses.length);
    restaurant = businesses[randomIndex];
  }).catch(error => {
    console.log(error);
  });

  return restaurant;
}

async function main() {
  const r = await restaurant();
  console.log(r);
}

main();