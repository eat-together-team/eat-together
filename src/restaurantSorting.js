const weighRestaurant = ({ restaurant, dietaryPref, cuisinePref, priceRange }) => {
    let totalScore = 0;

    const categoryWeights = {
        dietary: 0.4,
        price: 0.3,
        cuisine: 0.3
    };

    const restaurantCategories = restaurant.categoryAliases || []; 

    // 1. Check if any dietary tag matches
    const hasDietaryTag = dietaryPref?.some(tag => restaurantCategories.includes(tag));
    totalScore += hasDietaryTag ? categoryWeights.dietary : 0.2;

    // 2. Check if any cuisine tag matches
    const hasCuisineTag = cuisinePref?.some(tag => restaurantCategories.includes(tag));
    totalScore += hasCuisineTag ? categoryWeights.cuisine : 0.15;

    // 3. Price range match
    const restaurantPrice = restaurant?.price; // assume something like "$$", or undefined
    totalScore += restaurantPrice.length === priceRange ? categoryWeights.price : 0.15;

    return totalScore;
};

export default weighRestaurant;