import {YELP_API_KEY} from "@env";
import axios from "axios";

const apiKey = YELP_API_KEY;

// delay function to reduce rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// batch processing function
const fetchRestaurantDetails = async (businessIds) => {
  const batchSize = 3; // Process 3 restaurants at a time
  const business_endpoint = "https://api.yelp.com/v3/businesses/";
  
  const allResults = [];
  
  for (let i = 0; i < businessIds.length; i += batchSize) {
    const batch = businessIds.slice(i, i + batchSize);
    
    // Process each restaurant in the batch (details + reviews)
    const batchPromises = batch.map(async (id) => {
      try {
        const [details, reviews] = await Promise.all([
          axios.get(`${business_endpoint}${id}`, {
            headers: { Authorization: `Bearer ${apiKey}` }
          }),
          axios.get(`${business_endpoint}${id}/reviews`, {
            headers: { Authorization: `Bearer ${apiKey}` }
          })
        ]);
        
        return {
          id,
          details: details.data,
          reviews: reviews.data
        };
      } catch (error) {
        console.error(`Failed to fetch data for ${id}:`, error);
        return { id, details: null, reviews: null };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    allResults.push(...batchResults);
    
    // Wait between batches to avoid rate limits
    if (i + batchSize < businessIds.length) {
      await delay(500); // 500ms between batches
    }
  }
  
  return allResults;
};

// Helper function to format hours
const formatHours = (hours) => {
  if (!hours || !hours[0] || !hours[0].open) return null;
  
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const todayHours = {};
  
  hours[0].open.forEach(period => {
    const day = daysOfWeek[period.day];
    const startTime = period.start ? `${period.start.slice(0, 2)}:${period.start.slice(2)}` : '';
    const endTime = period.end ? `${period.end.slice(0, 2)}:${period.end.slice(2)}` : '';
    todayHours[day] = startTime && endTime ? `${startTime} - ${endTime}` : 'Hours not available';
  });
  
  return todayHours;
};

// Helper function to get review excerpt
const getReviewExcerpt = (reviews) => {
  if (!reviews || !reviews.reviews || reviews.reviews.length === 0) return null;
  
  // Get the first review and truncate to ~200 characters
  const firstReview = reviews.reviews[0].text;
  return firstReview.length > 100 ? firstReview.substring(0, 200) + '...' : firstReview;
};

// Main restaurant function
const restaurant = async (categoryParams, priceRange) => {
  const search_endpoint = 'https://api.yelp.com/v3/businesses/search';
  
  let categories = categoryParams ? categoryParams : ['coffee', 'restaurant', 'food'];
  const location = 'The Ave, Seattle, WA';
  const limit = 10;
  const radius = 10000;
  
  
  let params = {
    categories: categories.join(','),
    location: location,
    limit: limit,
    radius: radius,
    sort_by: 'best_match',
  };
  
  if(priceRange){
    params.price = priceRange.toString();
  }
  
  let businesses;
  
  try {
    const response = await axios.get(search_endpoint, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      params,
    });
    businesses = response.data.businesses;
  } catch (error) {
    console.log('Search API error:', error);
    return [];
  }
  
  const businessIds = businesses.map(business => business.id);
  console.log(businessIds);
  
  // Fetch details in batches
  const businessDetails = await fetchRestaurantDetails(businessIds);
  
  // Combine and format data to return only specified fields
  const simplifiedBusinesses = businesses.map(business => {
    const detailData = businessDetails.find(detail => detail.id === business.id);
    const details = detailData?.details;
    const reviews = detailData?.reviews;
    
    return {
      name: business.name,
      rating: business.rating,
      price: business.price || null,
      reviewExcerpt: getReviewExcerpt(reviews),
      image: business.image_url,
      address: business.location.display_address.join(', '),
      categoryAliases: business.categories.map(cat => cat.alias),
      hours: formatHours(details?.hours)
    };
  });
  
  return simplifiedBusinesses;
};

export default restaurant;