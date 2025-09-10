import cities from 'cities.json' with { type: 'json' }

// Based on the actual cities.json structure
interface City {
  name: string
  lat: string
  lng: string
  country: string
  admin1: string
  admin2: string
}

// Mapping for country codes to full country names
const countryNames: Record<string, string> = {
  US: 'United States',
  CA: 'Canada',
  GB: 'United Kingdom',
  AU: 'Australia',
  DE: 'Germany',
  FR: 'France',
  IT: 'Italy',
  ES: 'Spain',
  NL: 'Netherlands',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  FI: 'Finland',
  CH: 'Switzerland',
  AT: 'Austria',
  BE: 'Belgium',
  IE: 'Ireland',
  PT: 'Portugal',
  PL: 'Poland',
  CZ: 'Czech Republic',
  HU: 'Hungary',
  RO: 'Romania',
  BG: 'Bulgaria',
  HR: 'Croatia',
  SI: 'Slovenia',
  SK: 'Slovakia',
  LT: 'Lithuania',
  LV: 'Latvia',
  EE: 'Estonia',
  JP: 'Japan',
  KR: 'South Korea',
  CN: 'China',
  IN: 'India',
  SG: 'Singapore',
  HK: 'Hong Kong',
  TW: 'Taiwan',
  TH: 'Thailand',
  MY: 'Malaysia',
  ID: 'Indonesia',
  PH: 'Philippines',
  VN: 'Vietnam',
  BR: 'Brazil',
  MX: 'Mexico',
  AR: 'Argentina',
  CL: 'Chile',
  CO: 'Colombia',
  PE: 'Peru',
  ZA: 'South Africa',
  EG: 'Egypt',
  NG: 'Nigeria',
  KE: 'Kenya',
  MA: 'Morocco',
  IL: 'Israel',
  AE: 'United Arab Emirates',
  SA: 'Saudi Arabia',
  TR: 'Turkey',
  RU: 'Russia',
  UA: 'Ukraine',
  BY: 'Belarus',
  KZ: 'Kazakhstan',
  UZ: 'Uzbekistan',
  NZ: 'New Zealand',
  FJ: 'Fiji',
  IS: 'Iceland',
  LU: 'Luxembourg',
  MT: 'Malta',
  CY: 'Cyprus',
  GR: 'Greece',
}

const getCountryName = (countryCode: string) => {
  return countryNames[countryCode] || countryCode
}

const getCityKey = (city: City) =>
  `${city.name}-${city.country}-${city.admin1}-${city.lat}-${city.lng}`

export const parseLocation = (locationKey: string | null | undefined): string | null => {
  if (!locationKey) return null

  // If it's already a formatted string (legacy data), return as is
  if (!locationKey.includes('-') || locationKey.split('-').length < 5) {
    return locationKey
  }

  // Find the city that matches the key
  const city = (cities as City[]).find((city) => getCityKey(city) === locationKey)

  if (city) {
    return `${city.name}, ${getCountryName(city.country)}`
  }

  // Fallback: return the original key if no match found
  return locationKey
}
