import {YELP_API_KEY} from "@env";
import axios from "axios/dist/axios.min.js";

const apiKey = YELP_API_KEY;

// fetch detailed business info for a given business
const fetchBusinessDetails = async (businessId) => {
  const detailsEndpoint = `https://api.yelp.com/v3/businesses/${businessId}`;
  try {
    const response = await axios.get(detailsEndpoint, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    return response.data;
  } catch (err) {
    console.log('Error fetching business details', err?.message || err);
    return null;
  }
};

// Format the response from Yelp API
const extractRestaurantInfo = async (businesses) => {
  if (!businesses || businesses.length === 0) {
    return [];
  }

  const detailsList = await Promise.all(
    businesses.map((b) => fetchBusinessDetails(b.id))
  );

  return businesses.map((business, index) => {
    const details = detailsList[index] || {};
    return {
      id: business.id,
      name: business.name,
      rating: business.rating,
      reviewCount: business.review_count,
      price: business.price,
      categories: business.categories.map((cat) => cat.title).join(', '),
      address: business.location.display_address.join(', '),
      phone: business.display_phone,
      serviceOptions: business.transactions.join(', '),
      imageUrl: business.image_url,
      url: business.url,
      hours: details.hours || null,
      photos: Array.isArray(details.photos) ? details.photos.slice(0, 3) : [],
    };
  });
};

const restaurant = async (categoryParams, priceRange) => {

  const search_endpoint = 'https://api.yelp.com/v3/businesses/search';

  let categories = categoryParams ? categoryParams : ['coffee', 'restaurant', 'food'];
  const location = 'University District, Seattle, WA';
  const limit = 10;
  const radius = 10000;  // 10 km radius

  // Check if user provided any categories

  // console.log(categories);
  // console.log(categoryParams);

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
  }).catch(error => {
    console.log(error);
  });

  const formattedBusinesses = await extractRestaurantInfo(businesses);
  return formattedBusinesses;
}

export default restaurant;