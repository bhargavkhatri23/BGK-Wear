// Comprehensive Indian States and Cities with Smart City-to-State Mapping

export const INDIAN_STATES_LIST: string[] = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Delhi NCR',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Other'
];

export const CITY_TO_STATE_MAP: Record<string, string> = {
  // Gujarat
  'Surat': 'Gujarat',
  'Ahmedabad': 'Gujarat',
  'Vadodara': 'Gujarat',
  'Rajkot': 'Gujarat',
  'Bhavnagar': 'Gujarat',
  'Jamnagar': 'Gujarat',
  'Gandhinagar': 'Gujarat',
  'Junagadh': 'Gujarat',
  'Anand': 'Gujarat',
  'Navsari': 'Gujarat',
  'Morbi': 'Gujarat',
  'Bharuch': 'Gujarat',
  'Valsad': 'Gujarat',
  'Vapi': 'Gujarat',
  'Porbandar': 'Gujarat',
  'Mehsana': 'Gujarat',
  'Bhuj': 'Gujarat',

  // Maharashtra
  'Mumbai': 'Maharashtra',
  'Pune': 'Maharashtra',
  'Nagpur': 'Maharashtra',
  'Thane': 'Maharashtra',
  'Nashik': 'Maharashtra',
  'Navi Mumbai': 'Maharashtra',
  'Aurangabad': 'Maharashtra',
  'Solapur': 'Maharashtra',
  'Kolhapur': 'Maharashtra',
  'Amravati': 'Maharashtra',
  'Jalgaon': 'Maharashtra',
  'Akola': 'Maharashtra',
  'Latur': 'Maharashtra',
  'Sangli': 'Maharashtra',

  // Rajasthan
  'Jaipur': 'Rajasthan',
  'Udaipur': 'Rajasthan',
  'Jodhpur': 'Rajasthan',
  'Kota': 'Rajasthan',
  'Bikaner': 'Rajasthan',
  'Ajmer': 'Rajasthan',
  'Bhilwara': 'Rajasthan',
  'Alwar': 'Rajasthan',
  'Sikar': 'Rajasthan',
  'Pali': 'Rajasthan',
  'Sri Ganganagar': 'Rajasthan',

  // Delhi NCR & Haryana & UP NCR
  'Delhi NCR': 'Delhi NCR',
  'New Delhi': 'Delhi NCR',
  'Noida': 'Uttar Pradesh',
  'Greater Noida': 'Uttar Pradesh',
  'Ghaziabad': 'Uttar Pradesh',
  'Gurgaon': 'Haryana',
  'Gurugram': 'Haryana',
  'Faridabad': 'Haryana',

  // Karnataka
  'Bangalore': 'Karnataka',
  'Bengaluru': 'Karnataka',
  'Mysore': 'Karnataka',
  'Hubli': 'Karnataka',
  'Dharwad': 'Karnataka',
  'Mangalore': 'Karnataka',
  'Belgaum': 'Karnataka',

  // Telangana & Andhra Pradesh
  'Hyderabad': 'Telangana',
  'Secunderabad': 'Telangana',
  'Warangal': 'Telangana',
  'Visakhapatnam': 'Andhra Pradesh',
  'Vijayawada': 'Andhra Pradesh',
  'Guntur': 'Andhra Pradesh',
  'Tirupati': 'Andhra Pradesh',
  'Nellore': 'Andhra Pradesh',

  // Tamil Nadu
  'Chennai': 'Tamil Nadu',
  'Coimbatore': 'Tamil Nadu',
  'Madurai': 'Tamil Nadu',
  'Tiruchirappalli': 'Tamil Nadu',
  'Salem': 'Tamil Nadu',
  'Erode': 'Tamil Nadu',
  'Vellore': 'Tamil Nadu',

  // West Bengal
  'Kolkata': 'West Bengal',
  'Howrah': 'West Bengal',
  'Durgapur': 'West Bengal',
  'Siliguri': 'West Bengal',
  'Asansol': 'West Bengal',

  // Uttar Pradesh
  'Lucknow': 'Uttar Pradesh',
  'Kanpur': 'Uttar Pradesh',
  'Agra': 'Uttar Pradesh',
  'Varanasi': 'Uttar Pradesh',
  'Prayagraj': 'Uttar Pradesh',
  'Meerut': 'Uttar Pradesh',
  'Bareilly': 'Uttar Pradesh',
  'Aligarh': 'Uttar Pradesh',
  'Moradabad': 'Uttar Pradesh',
  'Saharanpur': 'Uttar Pradesh',
  'Gorakhpur': 'Uttar Pradesh',
  'Mathura': 'Uttar Pradesh',

  // Punjab & Chandigarh
  'Chandigarh': 'Chandigarh',
  'Ludhiana': 'Punjab',
  'Amritsar': 'Punjab',
  'Jalandhar': 'Punjab',
  'Patiala': 'Punjab',
  'Bathinda': 'Punjab',
  'Mohali': 'Punjab',

  // Madhya Pradesh
  'Indore': 'Madhya Pradesh',
  'Bhopal': 'Madhya Pradesh',
  'Jabalpur': 'Madhya Pradesh',
  'Gwalior': 'Madhya Pradesh',
  'Ujjain': 'Madhya Pradesh',
  'Sagar': 'Madhya Pradesh',
  'Ratlam': 'Madhya Pradesh',

  // Bihar & Jharkhand
  'Patna': 'Bihar',
  'Gaya': 'Bihar',
  'Bhagalpur': 'Bihar',
  'Muzaffarpur': 'Bihar',
  'Ranchi': 'Jharkhand',
  'Jamshedpur': 'Jharkhand',
  'Dhanbad': 'Jharkhand',
  'Bokaro': 'Jharkhand',

  // Kerala
  'Kochi': 'Kerala',
  'Thiruvananthapuram': 'Kerala',
  'Kozhikode': 'Kerala',
  'Thrissur': 'Kerala',
  'Kollam': 'Kerala',

  // Other Major State Capitals & Key Cities
  'Raipur': 'Chhattisgarh',
  'Bilaspur': 'Chhattisgarh',
  'Bhubaneswar': 'Odisha',
  'Cuttack': 'Odisha',
  'Rourkela': 'Odisha',
  'Dehradun': 'Uttarakhand',
  'Haridwar': 'Uttarakhand',
  'Rishikesh': 'Uttarakhand',
  'Guwahati': 'Assam',
  'Panaji': 'Goa',
  'Margao': 'Goa',
  'Shimla': 'Himachal Pradesh',
  'Dharamshala': 'Himachal Pradesh',
  'Srinagar': 'Jammu & Kashmir',
  'Jammu': 'Jammu & Kashmir'
};

// Alphabetical list of popular cities
export const POPULAR_INDIAN_CITIES: string[] = Object.keys(CITY_TO_STATE_MAP).sort((a, b) => 
  a.localeCompare(b)
);

// Explorer / Filter dropdown cities list (Includes 'All Cities' at start)
export const CITIES_LIST: string[] = [
  'All Cities',
  'Surat',
  'Ahmedabad',
  'Mumbai',
  'Delhi NCR',
  'Jaipur',
  'Bangalore',
  'Hyderabad',
  'Pune',
  'Kolkata',
  'Chandigarh',
  'Lucknow',
  'Indore',
  'Udaipur',
  'Vadodara',
  'Rajkot',
  'Chennai',
  'Kochi',
  'Patna',
  'Bhopal',
  'Nagpur',
  'Noida',
  'Gurgaon',
  'Agra',
  'Varanasi',
  'Amritsar',
  'Ludhiana',
  'Dehradun',
  'Ranchi',
  'Bhubaneswar',
  'Guwahati',
  'Goa (Panaji)'
];

/**
 * Smart lookup function: Returns matching state for a given city
 */
export function getStateForCity(city: string): string | undefined {
  if (!city) return undefined;
  const trimmed = city.trim();
  
  // Exact match
  if (CITY_TO_STATE_MAP[trimmed]) {
    return CITY_TO_STATE_MAP[trimmed];
  }

  // Case-insensitive match
  const lower = trimmed.toLowerCase();
  for (const [key, state] of Object.entries(CITY_TO_STATE_MAP)) {
    if (key.toLowerCase() === lower) {
      return state;
    }
  }

  // Partial match fallback
  for (const [key, state] of Object.entries(CITY_TO_STATE_MAP)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return state;
    }
  }

  return undefined;
}
