export interface CookieCategory {
  /** Unique key used in the stored consent object, e.g. `analytics`. */
  id: string;
  name: string;
  description: string;
  /** Required categories are always on and cannot be toggled off by the user. */
  required: boolean;
}

export type ConsentReason = 'user_accept' | 'user_reject' | 'location_not_required';

export interface ConsentLocationData {
  country?: string;
  region?: string;
  inEU: boolean;
  detectionMethod: string;
}

export interface ConsentState {
  timestamp: number;
  categories: {
    [key: string]: boolean;
  };
  version: string;
  reason: ConsentReason;
  locationData?: ConsentLocationData;
}

export interface CookieDialogConfig {
  /** Only show the dialog to visitors in the EU/EEA (IP based). Default `false`. */
  enableLocation?: boolean;
  /** Show the dialog automatically from `init()` when consent is needed. Default `true`. */
  autoShow?: boolean;
  position?: 'bottom' | 'top' | 'center';
  /** `auto` follows the visitor's `prefers-color-scheme` setting. Default `light`. */
  theme?: 'light' | 'dark' | 'auto';
  privacyUrl?: string;
  cookiePolicyUrl?: string;
  /** Days before stored consent expires and the dialog is shown again. Default `365`. */
  expiryDays?: number;
  /** Show the dialog even when consent is already stored. Default `false`. */
  forceShow?: boolean;
  /** Log geolocation and lifecycle details to the console. Default `false`. */
  debug?: boolean;
  categories?: CookieCategory[];
  translations?: Translations;
  /** Fired when the visitor accepts all cookies, or saves preferences with at least one optional category enabled. */
  onAccept?: (consent: ConsentState) => void;
  /** Fired when the visitor rejects all cookies, or saves preferences with every optional category disabled. */
  onReject?: (consent: ConsentState) => void;
  /** Fired whenever the visitor saves preferences from the settings panel. */
  onChange?: (consent: ConsentState) => void;
  onLocationNotRequired?: (locationData: { country?: string; region?: string; inEU: boolean }) => void;
  geolocationEndpoint?: string;
}

export interface Translations {
  title?: string;
  description?: string;
  acceptButton?: string;
  rejectButton?: string;
  /** Label of the button that opens the preferences panel. */
  settingsButton?: string;
  /** Label of the button that saves preferences. */
  saveButton?: string;
  /** @deprecated Use `saveButton`. Kept as a fallback for older configs. */
  closeButton?: string;
  privacyLink?: string;
  cookiePolicyLink?: string;
  necessaryCategory?: string;
  necessaryDescription?: string;
  /** Badge shown next to required categories instead of a toggle. */
  alwaysActive?: string;
  /** Accessible name for the settings panel, read by screen readers. */
  settingsTitle?: string;
}

export interface GeolocationResponse {
  inEU: boolean;
  country?: string;
  region?: string;
}
