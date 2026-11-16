/**
 * Roommate Compatibility Algorithm
 * Calculates compatibility percentage and provides detailed matches & differences
 */
const calculateRoommateCompatibility = (profileA, profileB) => {
  let score = 0;
  let maxScore = 0;
  const matches = [];
  const differences = [];

  // 1. Budget Comparison (Weight: 20 points)
  const budgetA = profileA.monthlyBudget;
  const budgetB = profileB.monthlyBudget;
  const maxBudget = Math.max(budgetA, budgetB);
  const budgetDiff = Math.abs(budgetA - budgetB);
  const budgetScore = maxBudget > 0 ? Math.max(0, 20 - (budgetDiff / maxBudget) * 20) : 20;
  score += budgetScore;
  maxScore += 20;
  if (budgetDiff / maxBudget <= 0.15) {
    matches.push('Similar budget preference');
  } else {
    differences.push(`User budget: ₹${budgetA}, Roommate budget: ₹${budgetB}`);
  }

  // 2. Sleep Schedule (Weight: 15 points)
  maxScore += 15;
  if (profileA.sleepSchedule === profileB.sleepSchedule) {
    score += 15;
    matches.push(`Same sleep schedule (${profileA.sleepSchedule})`);
  } else if (profileA.sleepSchedule === 'Flexible' || profileB.sleepSchedule === 'Flexible') {
    score += 10;
    matches.push('Flexible sleep schedule overlap');
  } else {
    differences.push(`User is ${profileA.sleepSchedule}, Roommate is ${profileB.sleepSchedule}`);
  }

  // 3. Cleanliness (Weight: 15 points)
  maxScore += 15;
  if (profileA.cleanliness === profileB.cleanliness) {
    score += 15;
    matches.push(`Same cleanliness standard (${profileA.cleanliness})`);
  } else {
    const cleanLevel = { High: 3, Moderate: 2, Low: 1 };
    const diff = Math.abs(cleanLevel[profileA.cleanliness] - cleanLevel[profileB.cleanliness]);
    if (diff === 1) {
      score += 10;
      matches.push('Reasonably close cleanliness standards');
    } else {
      score += 2;
      differences.push(`User cleanliness: ${profileA.cleanliness}, Roommate: ${profileB.cleanliness}`);
    }
  }

  // 4. Noise Tolerance (Weight: 10 points)
  maxScore += 10;
  if (profileA.noiseTolerance === profileB.noiseTolerance) {
    score += 10;
    matches.push(`Same noise tolerance level (${profileA.noiseTolerance})`);
  } else {
    const noiseLevel = { Low: 1, Moderate: 2, High: 3 };
    const diff = Math.abs(noiseLevel[profileA.noiseTolerance] - noiseLevel[profileB.noiseTolerance]);
    if (diff === 1) {
      score += 7;
      matches.push('Manageable noise preference difference');
    } else {
      differences.push(`User noise tolerance: ${profileA.noiseTolerance}, Roommate: ${profileB.noiseTolerance}`);
    }
  }

  // 5. Smoking (Weight: 10 points)
  maxScore += 10;
  if (profileA.smoking === profileB.smoking) {
    score += 10;
    matches.push(`Aligned smoking preference (${profileA.smoking === 'No' ? 'Non-smokers' : 'Accepts smoking'})`);
  } else if (
    (profileA.smoking === 'No' && profileB.smoking === 'Outside Only') ||
    (profileA.smoking === 'Outside Only' && profileB.smoking === 'No')
  ) {
    score += 7;
    matches.push('Smoking allowed outside only');
  } else {
    differences.push(`User smoking: ${profileA.smoking}, Roommate: ${profileB.smoking}`);
  }

  // 6. Drinking (Weight: 10 points)
  maxScore += 10;
  if (profileA.drinking === profileB.drinking) {
    score += 10;
    matches.push('Same drinking preference');
  } else if (profileA.drinking === 'Socially' || profileB.drinking === 'Socially') {
    score += 7;
    matches.push('Social drinking compatibility');
  } else {
    differences.push(`User drinking: ${profileA.drinking}, Roommate: ${profileB.drinking}`);
  }

  // 7. Food Preference (Weight: 10 points)
  maxScore += 10;
  if (profileA.foodPreference === profileB.foodPreference || profileA.foodPreference === 'Any' || profileB.foodPreference === 'Any') {
    score += 10;
    matches.push('Food preferences are compatible');
  } else {
    score += 4;
    differences.push(`User prefers ${profileA.foodPreference} food, Roommate prefers ${profileB.foodPreference}`);
  }

  // 8. AC Preference (Weight: 10 points)
  maxScore += 10;
  if (profileA.acPreference === profileB.acPreference || profileA.acPreference === 'No Preference' || profileB.acPreference === 'No Preference') {
    score += 10;
    matches.push('Aligned air conditioning preferences');
  } else {
    differences.push(`User AC pref: ${profileA.acPreference}, Roommate: ${profileB.acPreference}`);
  }

  const finalPercentage = Math.round((score / maxScore) * 100);

  return {
    score: finalPercentage,
    matches,
    differences
  };
};

/**
 * Combined Recommendations Engine
 * Combines properties with service providers to create custom living bundles.
 */
const getCombinedRecommendations = (userProfile, properties, providers, limit = 5) => {
  const bundles = [];
  const selectedServices = userProfile.selectedServices || ['room'];
  
  // Extract tiffin providers, laundry, cleaning
  const tiffinProviders = providers.filter(p => p.category === 'Tiffin');
  const laundryProviders = providers.filter(p => p.category === 'Laundry');
  const cleaningProviders = providers.filter(p => p.category === 'Cleaning');
  
  // Sort properties by distance / price for base combinations
  // In a real application, we would run database filters first
  const baseProperties = properties.slice(0, 10);
  
  for (const property of baseProperties) {
    let tiffinOpt = tiffinProviders[0]; // pick nearest or best rated
    let laundryOpt = laundryProviders[0];
    let cleaningOpt = cleaningProviders[0];
    
    // Calculate total cost
    let rent = property.monthlyRent;
    let tiffinCost = 0;
    let laundryCost = 0;
    let cleaningCost = 0;
    
    if (selectedServices.includes('tiffin') && tiffinOpt) {
      // Veg price or subscription monthly price
      tiffinCost = tiffinOpt.tiffinDetails?.monthlyPrice || tiffinOpt.tiffinDetails?.vegPrice * 30 || 2500;
    }
    
    if (selectedServices.includes('laundry') && laundryOpt) {
      // Estimate 10kg laundry per month
      laundryCost = (laundryOpt.laundryDetails?.pricePerKg || 50) * 10;
    }
    
    if (selectedServices.includes('cleaning') && cleaningOpt) {
      // Estimate 4 regular cleanings per month
      const cleanPrice = cleaningOpt.cleaningDetails?.priceMap?.get('Regular Room') || 150;
      cleaningCost = cleanPrice * 4;
    }
    
    const totalCost = rent + tiffinCost + laundryCost + cleaningCost;
    
    // Calculate match factors
    const budgetMatch = userProfile.monthlyBudget >= totalCost 
      ? 100 
      : Math.max(0, Math.round(100 - ((totalCost - userProfile.monthlyBudget) / userProfile.monthlyBudget) * 100));
      
    // Average property rating & provider rating
    let ratingSum = property.rating;
    let ratingCount = 1;
    
    if (tiffinCost > 0 && tiffinOpt) {
      ratingSum += tiffinOpt.rating;
      ratingCount++;
    }
    
    const avgRating = ratingSum / ratingCount;
    
    // Cleanliness / Food alignment
    let lifestyleScore = 80;
    if (tiffinCost > 0 && tiffinOpt) {
      const foodPrefMatches = userProfile.foodPreference === 'Any' || 
        (userProfile.foodPreference === 'Veg' && tiffinOpt.tiffinDetails?.vegPrice > 0) ||
        (userProfile.foodPreference === 'Non-Veg' && tiffinOpt.tiffinDetails?.nonVegPrice > 0);
      lifestyleScore = foodPrefMatches ? 100 : 60;
    }
    
    const finalScore = Math.round((budgetMatch * 0.5) + (lifestyleScore * 0.3) + ((avgRating / 5) * 100 * 0.2));
    
    bundles.push({
      property,
      tiffin: tiffinCost > 0 ? tiffinOpt : null,
      laundry: laundryCost > 0 ? laundryOpt : null,
      cleaning: cleaningCost > 0 ? cleaningOpt : null,
      breakdown: {
        rent,
        tiffin: tiffinCost,
        laundry: laundryCost,
        cleaning: cleaningCost
      },
      totalCost,
      matchPercentage: finalScore,
      reasons: {
        budgetMatch,
        lifestyleScore,
        avgRatingPercentage: Math.round((avgRating / 5) * 100)
      }
    });
  }
  
  // Sort bundles by match percentage descending
  return bundles.sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, limit);
};

module.exports = {
  calculateRoommateCompatibility,
  getCombinedRecommendations
};
