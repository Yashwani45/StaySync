const { parseNaturalQuery } = require('../ai/nlpParser');

const testCases = [
  {
    input: "Mujhe college ke 3 km ke andar ₹8k ke under clean shared room chahiye aur food bhi available hona chahiye.",
    expected: {
      budget: 8000,
      radius: 3,
      roomType: 'Shared',
      foodAvailable: true,
      cleanliness: 'High',
      location: 'college'
    }
  },
  {
    input: "looking for a single ac room near chappan bhog Indore under 15000",
    expected: {
      budget: 15000,
      roomType: 'Single',
      ac: 'AC',
      location: 'chappan bhog indore'
    }
  },
  {
    input: "need a girls hostel in geeta bhawan under 7k with veg food",
    expected: {
      budget: 7000,
      gender: 'Female',
      location: 'geeta bhawan',
      foodAvailable: true
    }
  },
  {
    input: "boy roommate with sleep schedule flexible budget 10k",
    expected: {
      budget: 10000,
      gender: 'Male'
    }
  }
];

console.log('--- RUNNING NLP QUERY PARSER TESTS ---');
let passed = 0;

testCases.forEach((tc, idx) => {
  const result = parseNaturalQuery(tc.input);
  console.log(`\nTest #${idx + 1}`);
  console.log(`Input: "${tc.input}"`);
  console.log(`Parsed Output:`, JSON.stringify(result, null, 2));
  
  // Basic validation check
  let isMatch = true;
  for (const key in tc.expected) {
    if (tc.expected[key] !== result[key]) {
      // If it's a string, we can do a partial match or include check
      if (typeof tc.expected[key] === 'string' && result[key] && result[key].includes(tc.expected[key])) {
        continue;
      }
      isMatch = false;
      console.log(`❌ Mismatch for key "${key}": expected "${tc.expected[key]}", got "${result[key]}"`);
    }
  }
  
  if (isMatch) {
    console.log('✅ Passed!');
    passed++;
  }
});

console.log(`\n--- Result: ${passed}/${testCases.length} Tests Passed ---`);
