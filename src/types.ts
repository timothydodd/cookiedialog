export interface CookieCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

export interface ConsentState {
  timestamp: number;
  categories: {
    [key: string]: boolean;
  };
  version: string;
  reason: 'user_accept' | 'user_reject' | 'location_not_required';
  locationData?: {
    country?: string;
    region?: string;
    inEU: boolean;
    detectionMethod: string;
  };
}

export interface CookieDialogConfig {
  enableLocation?: boolean;
  autoShow?: boolean;
  position?: 'bottom' | 'top' | 'center';
  theme?: 'light' | 'dark' | 'auto';
  privacyUrl?: string;
  cookiePolicyUrl?: string;
  expiryDays?: number;
  forceShow?: boolean;
  categories?: CookieCategory[];
  translations?: Translations;
  onAccept?: (consent: ConsentState) => void;
  onReject?: () => void;
  onChange?: (consent: ConsentState) => void;
  onLocationNotRequired?: (locationData: { country?: string; region?: string; inEU: boolean }) => void;
  geolocationEndpoint?: string;
}

export interface Translations {
  title?: string;
  description?: string;
  acceptButton?: string;
  rejectButton?: string;
  settingsButton?: string;
  closeButton?: string;
  saveButton?: string;
  privacyLink?: string;
  cookiePolicyLink?: string;
  necessaryCategory?: string;
  necessaryDescription?: string;
}

export interface GeolocationResponse {
  inEU: boolean;
  country?: string;
  region?: string;
}