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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Format the response from Yelp API
const extractRestaurantInfo = async (businesses) => {
  if (!businesses || businesses.length === 0) {
    return [];
  }

  // Yelp rate-limits bursts of concurrent requests, so firing all of these
  // detail calls at once via Promise.all mostly comes back 429'd (each
  // failure is swallowed by fetchBusinessDetails, which just returns null
  // for that business) — hours/photos then silently end up empty for most
  // or all restaurants. Fetching one at a time with a short delay keeps us
  // under the burst limit.
  const detailsList = [];
  for (const business of businesses) {
    detailsList.push(await fetchBusinessDetails(business.id));
    await sleep(250);
  }

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
      lat: business.coordinates?.latitude ?? null,
      lng: business.coordinates?.longitude ?? null,
    };
  });
};

// Format the response from Yelp API using only the /businesses/search results.
// This avoids extra per-business detail requests that can trigger 429 rate limits.
const extractRestaurantInfoFromSearch = (businesses) => {
  if (!businesses || businesses.length === 0) {
    return [];
  }

  return businesses.map((business) => ({
    id: business.id,
    name: business.name,
    rating: business.rating,
    reviewCount: business.review_count,
    price: business.price,
    categories: (business.categories || []).map((cat) => cat.title).join(', '),
    address: (business.location?.display_address || []).join(', '),
    phone: business.display_phone,
    serviceOptions: (business.transactions || []).join(', '),
    imageUrl: business.image_url,
    url: business.url,
    hours: null,
    photos: [],
    lat: business.coordinates?.latitude ?? null,
    lng: business.coordinates?.longitude ?? null,
  }));
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

  let businesses = [];

  await axios.get(search_endpoint, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    params,
  }).then(response => {
    businesses = response.data.businesses || [];
  }).catch(error => {
    console.log('Error fetching restaurant search results', error?.message || error);
  });

  try {
    return await extractRestaurantInfo(businesses);
  } catch (err) {
    console.log('Error enriching restaurant details, falling back to basic data', err?.message || err);
    return extractRestaurantInfoFromSearch(businesses);
  }
}

export default restaurant;