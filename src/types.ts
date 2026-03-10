export interface Location {
  id: string;
  city: string;
  state?: string;
  country: string;
  timezone: string;
  offsetLabel: string; // e.g., "GMT", "PST"
  isBase?: boolean;
}

export const INITIAL_LOCATIONS: Location[] = [
  {
    id: '11',
    city: 'Mumbai',
    country: 'India',
    timezone: 'Asia/Kolkata',
    offsetLabel: 'IST',
    isBase: true,
  },
  {
    id: '1',
    city: 'San Francisco',
    state: 'California',
    country: 'USA',
    timezone: 'America/Los_Angeles',
    offsetLabel: 'PST',
  },
  {
    id: '2',
    city: 'London',
    country: 'UK',
    timezone: 'Europe/London',
    offsetLabel: 'GMT',
  },
  {
    id: '3',
    city: 'Tokyo',
    country: 'JP',
    timezone: 'Asia/Tokyo',
    offsetLabel: 'JST',
  },
  {
    id: '4',
    city: 'New York',
    state: 'New York',
    country: 'USA',
    timezone: 'America/New_York',
    offsetLabel: 'EST',
  },
];

export const ALL_LOCATIONS: Location[] = [
  ...INITIAL_LOCATIONS,
  { id: '6', city: 'Chicago', state: 'Illinois', country: 'USA', timezone: 'America/Chicago', offsetLabel: 'CST' },
  { id: '7', city: 'Mexico City', country: 'Mexico', timezone: 'America/Mexico_City', offsetLabel: 'CST' },
  { id: '8', city: 'Beijing', country: 'China', timezone: 'Asia/Shanghai', offsetLabel: 'CST' },
  { id: '9', city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', offsetLabel: 'AEST' },
  { id: '10', city: 'Paris', country: 'France', timezone: 'Europe/Paris', offsetLabel: 'CET' },
  { id: '12', city: 'Dubai', country: 'UAE', timezone: 'Asia/Dubai', offsetLabel: 'GST' },
  { id: '13', city: 'Seattle', state: 'Washington', country: 'USA', timezone: 'America/Los_Angeles', offsetLabel: 'PST' },
  { id: '14', city: 'Austin', state: 'Texas', country: 'USA', timezone: 'America/Chicago', offsetLabel: 'CST' },
  { id: '15', city: 'Toronto', country: 'Canada', timezone: 'America/Toronto', offsetLabel: 'EST' },
  { id: '16', city: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore', offsetLabel: 'SGT' },
  { id: '17', city: 'Hong Kong', country: 'China', timezone: 'Asia/Hong_Kong', offsetLabel: 'HKT' },
  { id: '18', city: 'Seoul', country: 'South Korea', timezone: 'Asia/Seoul', offsetLabel: 'KST' },
  { id: '19', city: 'Bangkok', country: 'Thailand', timezone: 'Asia/Bangkok', offsetLabel: 'ICT' },
  { id: '20', city: 'Jakarta', country: 'Indonesia', timezone: 'Asia/Jakarta', offsetLabel: 'WIB' },
  { id: '21', city: 'Istanbul', country: 'Turkey', timezone: 'Europe/Istanbul', offsetLabel: 'TRT' },
  { id: '22', city: 'Moscow', country: 'Russia', timezone: 'Europe/Moscow', offsetLabel: 'MSK' },
  { id: '23', city: 'Cairo', country: 'Egypt', timezone: 'Africa/Cairo', offsetLabel: 'EET' },
  { id: '24', city: 'Johannesburg', country: 'South Africa', timezone: 'Africa/Johannesburg', offsetLabel: 'SAST' },
  { id: '25', city: 'Lagos', country: 'Nigeria', timezone: 'Africa/Lagos', offsetLabel: 'WAT' },
  { id: '26', city: 'Madrid', country: 'Spain', timezone: 'Europe/Madrid', offsetLabel: 'CET' },
  { id: '27', city: 'Rome', country: 'Italy', timezone: 'Europe/Rome', offsetLabel: 'CET' },
  { id: '28', city: 'Amsterdam', country: 'Netherlands', timezone: 'Europe/Amsterdam', offsetLabel: 'CET' },
  { id: '29', city: 'Zurich', country: 'Switzerland', timezone: 'Europe/Zurich', offsetLabel: 'CET' },
  { id: '30', city: 'Stockholm', country: 'Sweden', timezone: 'Europe/Stockholm', offsetLabel: 'CET' },
  { id: '31', city: 'Sao Paulo', country: 'Brazil', timezone: 'America/Sao_Paulo', offsetLabel: 'BRT' },
  { id: '32', city: 'Buenos Aires', country: 'Argentina', timezone: 'America/Argentina/Buenos_Aires', offsetLabel: 'ART' },
  { id: '33', city: 'Santiago', country: 'Chile', timezone: 'America/Santiago', offsetLabel: 'CLT' },
  { id: '34', city: 'Lima', country: 'Peru', timezone: 'America/Lima', offsetLabel: 'PET' },
  { id: '35', city: 'Bogota', country: 'Colombia', timezone: 'America/Bogota', offsetLabel: 'COT' },
  { id: '36', city: 'Vancouver', country: 'Canada', timezone: 'America/Vancouver', offsetLabel: 'PST' },
  { id: '37', city: 'Phoenix', state: 'Arizona', country: 'USA', timezone: 'America/Phoenix', offsetLabel: 'MST' },
  { id: '38', city: 'Denver', state: 'Colorado', country: 'USA', timezone: 'America/Denver', offsetLabel: 'MST' },
  { id: '39', city: 'Miami', state: 'Florida', country: 'USA', timezone: 'America/New_York', offsetLabel: 'EST' },
  { id: '40', city: 'Boston', state: 'Massachusetts', country: 'USA', timezone: 'America/New_York', offsetLabel: 'EST' },
];
