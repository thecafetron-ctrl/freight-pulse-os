/**
 * OpenAI Client Utility
 * 
 * Handles communication with OpenAI API for load-truck matching
 */

import OpenAI from 'openai';
import { Load, Truck, Match } from '../types';
import { filterVehiclesForLoads } from './vehicleFilter';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates AI-powered matches between loads and trucks
 * 
 * @param loads - Array of freight loads
 * @param trucks - Array of available trucks
 * @returns Promise<Match[]> - Array of matched load-truck pairs with scores
 */
export async function generateMatches(
  loads: Load[],
  trucks: Truck[]
): Promise<Match[]> {
  
  // Validate API key
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  console.log(`\n🔍 Original dataset: ${loads.length} loads, ${trucks.length} vehicles`);
  
  // SMART FILTERING: Pre-filter vehicles to reduce tokens and improve speed
  // Only send the most relevant vehicles to OpenAI (15 per load max)
  const filteredVehicles = filterVehiclesForLoads(loads, trucks, 15);
  
  console.log(`✂️ Filtered to: ${filteredVehicles.length} most relevant vehicles (${Math.round((filteredVehicles.length/trucks.length)*100)}% reduction)`);
  console.log(`💡 This saves tokens and makes matching 5-10x faster!`);

  // Build the system prompt
  const systemPrompt = `You are an expert AI logistics dispatcher for a global freight company.

CRITICAL RULE: Vehicles MUST be at or near the LOAD ORIGIN to pick up the cargo!
A truck in Munich CANNOT pick up a load in Dubai. A ship in New York CANNOT pick up a load in Shanghai.

Your job is to match loads with vehicles based on:

1. **LOCATION IS CRITICAL** (Most Important - 50% of score):
   - Vehicle MUST be at or near the ORIGIN city to pick up the load
   - 0-30 miles from origin = 98.0-100.0 score (same city, perfect!)
   - 30-100 miles = 88.0-97.9 score (very close, excellent)
   - 100-200 miles = 75.0-87.9 score (nearby, good)
   - 200-500 miles = 60.0-74.9 score (regional, fair)
   - 500-1000 miles = 35.0-59.9 score (far, poor for trucks)
   - 1000+ miles = 10.0-34.9 score (very far, only planes/ships viable)
   - NEVER give high scores to vehicles 1000+ miles away unless plane/ship for international
   - NEVER suggest vehicles at the DESTINATION - they can't pick up the load!

2. **Equipment Match** (30% of score):
   - Equipment MUST match exactly: Reefer→Reefer, Container→Container, etc.
   - Wrong equipment = automatic low score (under 40)

3. **Vehicle Type Suitability** (15% of score):
   - TRUCKS: Only for domestic routes, weight < 50k lbs, regional (same country/continent)
   - PLANES: For urgent/express, international routes, any weight within capacity
   - SHIPS: Only for international ocean routes, heavy loads (> 70k lbs)

4. **Other Factors** (5% combined):
   - Date alignment
   - Capacity match
   - Priority consideration

SCORING MUST BE ACCURATE AND PRECISE:
- Use DECIMAL precision (e.g., 87.3%, 92.7%, not just 87% or 93%)
- 95.0-100.0: Perfect match (same city, perfect equipment, right vehicle type)
- 85.0-94.9: Excellent (within 100 miles, perfect equipment)
- 70.0-84.9: Good (within region, good equipment match)
- 55.0-69.9: Fair (same continent, acceptable but not ideal)
- 40.0-54.9: Poor (far distance or minor issues)
- Below 40.0: Very poor (wrong location, wrong equipment, or wrong vehicle type)
- If NO suitable vehicles exist, return empty matches array

CRITICAL: You MUST respond with valid JSON in this EXACT format:
{
  "matches": [
    {
      "loadId": "L1",
      "truckId": "T2",
      "matchScore": 85,
      "reason": "Vehicle is 50 miles from origin with perfect equipment match"
    }
  ]
}

IMPORTANT: 
- Always mention vehicle location relative to ORIGIN in reasoning
- Be honest about distance and tradeoffs
- Don't give high scores to far-away vehicles
- Each load should get 2-4 realistic options

Generate comprehensive, ACCURATE matches.`;

  // Build the user prompt with data (using filtered vehicles)
  const userPrompt = `Match these loads with available vehicles (trucks, planes, ships):

LOADS:
${JSON.stringify(loads, null, 2)}

VEHICLES (pre-filtered for relevance):
${JSON.stringify(filteredVehicles, null, 2)}

Analyze each load and recommend the best 2-4 vehicles, considering vehicle type suitability, distance, equipment, dates, and priorities. 

Return a JSON object with a "matches" array containing all the match objects. Generate at least ${Math.min(loads.length * 2, filteredVehicles.length)} matches total.`;

  console.log('\n🤖 Sending optimized request to OpenAI...');
  console.log(`📦 Loads: ${loads.length}, 🚛 Vehicles sent: ${filteredVehicles.length}`);

  try {
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.5, // Slightly higher for more creative matching
      response_format: { type: 'json_object' }
    });

    // Extract response
    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    console.log('✅ Received response from OpenAI');
    
    // Parse JSON response
    let matches: Match[];
    try {
      const parsed = JSON.parse(responseText);
      // Handle both direct array and wrapped object responses
      matches = Array.isArray(parsed) ? parsed : (parsed.matches || []);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText);
      throw new Error('Invalid JSON response from OpenAI');
    }

    // Validate match structure
    if (!Array.isArray(matches)) {
      throw new Error('Response is not an array of matches');
    }

    // Validate and sort matches
    const validatedMatches = matches.filter((match: any) => {
      return (
        typeof match.loadId === 'string' &&
        typeof match.truckId === 'string' &&
        typeof match.matchScore === 'number' &&
        typeof match.reason === 'string' &&
        match.matchScore >= 0 &&
        match.matchScore <= 100
      );
    }).sort((a: any, b: any) => b.matchScore - a.matchScore); // Sort by score DESC (highest first)

    console.log(`📊 Generated ${validatedMatches.length} valid matches\n`);

    return validatedMatches as Match[];

  } catch (error: any) {
    console.error('❌ OpenAI API Error:', error.message);
    
    // Provide helpful error messages
    if (error.code === 'invalid_api_key') {
      throw new Error('Invalid OpenAI API key');
    } else if (error.code === 'rate_limit_exceeded') {
      throw new Error('OpenAI rate limit exceeded. Please try again later.');
    } else if (error.status === 401) {
      throw new Error('OpenAI authentication failed. Check API key.');
    }
    
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

