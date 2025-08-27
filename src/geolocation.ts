import { GeolocationResponse } from './types';

export class GeolocationService {
  private endpoint: string;
  private cache: GeolocationResponse | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 3600000; // 1 hour

  constructor(customEndpoint?: string) {
    // Default to free IP geolocation service
    this.endpoint = customEndpoint || 'https://ipapi.co/json/';
  }

  async checkLocation(): Promise<GeolocationResponse> {
    // Return cached result if still valid
    if (this.cache && (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.cache;
    }

    try {
      const response = await fetch(this.endpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different API response formats
      let result: GeolocationResponse;
      
      if (this.endpoint.includes('ipapi.co')) {
        // ipapi.co format
        const euCountries = [
          'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
          'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
          'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'IS', 'LI', 'NO'
        ];
        
        result = {
          inEU: euCountries.includes(data.country_code),
          country: data.country_name,
          region: data.region
        };
      } else {
        // Custom endpoint - expect specific format
        result = {
          inEU: data.inEU || data.in_eu || false,
          country: data.country,
          region: data.region
        };
      }

      // Cache the result
      this.cache = result;
      this.cacheTimestamp = Date.now();

      return result;
    } catch (error) {
      console.error('Geolocation check failed:', error);
      // Default to showing dialog on error (safer for compliance)
      return {
        inEU: true,
        country: undefined,
        region: undefined
      };
    }
  }

  async isGDPRRequired(): Promise<boolean> {
    const location = await this.checkLocation();
    return location.inEU;
  }

  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
  }
}