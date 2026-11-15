export interface PilotLanguageDefinition {
  code: string;
  name: string;
  nativeName: string;
  isDefault: boolean;
  isPilotPriority: boolean;
  sortOrder: number;
}

import { AUTH_AND_PRIVACY_TRANSLATIONS } from "./auth-dictionary.ts";
import { PROFILE_TRANSLATIONS } from "./profile-dictionary.ts";
import { MARKETPLACE_TRANSLATIONS } from "./marketplace-dictionary.ts";

export const DEFAULT_LOCALE = "en" as const;

/**
 * Benue State pilot configured languages:
 * English (default), Tiv, Idoma, and Hausa.
 */
export const SUPPORTED_PILOT_LANGUAGES: readonly PilotLanguageDefinition[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    isDefault: true,
    isPilotPriority: true,
    sortOrder: 1,
  },
  {
    code: "tiv",
    name: "Tiv",
    nativeName: "Tiv",
    isDefault: false,
    isPilotPriority: true,
    sortOrder: 2,
  },
  {
    code: "ido",
    name: "Idoma",
    nativeName: "Idoma",
    isDefault: false,
    isPilotPriority: true,
    sortOrder: 3,
  },
  {
    code: "ha",
    name: "Hausa",
    nativeName: "Hausa",
    isDefault: false,
    isPilotPriority: true,
    sortOrder: 4,
  },
] as const;

export interface BaseTranslationDefinition {
  namespace: string;
  defaultText: string;
  description: string;
}

export const BASE_TRANSLATIONS = {
  ...AUTH_AND_PRIVACY_TRANSLATIONS,
  ...PROFILE_TRANSLATIONS,
  ...MARKETPLACE_TRANSLATIONS,
  // Common UI controls
  "common.appName": {
    namespace: "common",
    defaultText: "Tongric",
    description: "Brand name",
  },
  "common.save": {
    namespace: "common",
    defaultText: "Save",
    description: "Primary save action button",
  },
  "common.cancel": {
    namespace: "common",
    defaultText: "Cancel",
    description: "Dismiss or cancel button",
  },
  "common.retry": {
    namespace: "common",
    defaultText: "Try Again",
    description: "Retry failed request button",
  },
  "common.loading": {
    namespace: "common",
    defaultText: "Loading...",
    description: "Generic loading label",
  },
  "common.submit": {
    namespace: "common",
    defaultText: "Submit",
    description: "Form submit button",
  },
  "common.close": {
    namespace: "common",
    defaultText: "Close",
    description: "Close modal/drawer button",
  },
  "common.comingSoon": {
    namespace: "common",
    defaultText: "Coming soon",
    description: "Label for features in upcoming phases",
  },
  "common.verified": {
    namespace: "common",
    defaultText: "Verified",
    description: "Account verification badge",
  },
  "common.unverified": {
    namespace: "common",
    defaultText: "Unverified",
    description: "Unverified account badge",
  },
  "common.perishable": {
    namespace: "common",
    defaultText: "Perishable",
    description: "Badge for time-sensitive crops like tomatoes and mangoes",
  },

  // Navigation (5 mobile bottom tabs + header controls)
  "nav.home": {
    namespace: "nav",
    defaultText: "Home",
    description: "Mobile bottom tab label (keep <= 10 chars for 320px screens)",
  },
  "nav.market": {
    namespace: "nav",
    defaultText: "Market",
    description: "Mobile bottom tab label (keep <= 10 chars for 320px screens)",
  },
  "nav.orders": {
    namespace: "nav",
    defaultText: "Orders",
    description: "Mobile bottom tab label (keep <= 10 chars for 320px screens)",
  },
  "nav.transport": {
    namespace: "nav",
    defaultText: "Transport",
    description: "Mobile bottom tab label (keep <= 10 chars for 320px screens)",
  },
  "nav.finance": {
    namespace: "nav",
    defaultText: "Finance",
    description: "Mobile bottom tab label (keep <= 10 chars for 320px screens)",
  },
  "nav.account": {
    namespace: "nav",
    defaultText: "Account",
    description: "Header account menu button",
  },
  "nav.language": {
    namespace: "nav",
    defaultText: "Language",
    description: "Header language switcher label",
  },

  // Language onboarding & picker
  "i18n.promptTitle": {
    namespace: "i18n",
    defaultText: "Choose your preferred language",
    description: "First-visit onboarding card heading",
  },
  "i18n.promptBody": {
    namespace: "i18n",
    defaultText:
      "Select the language you prefer for navigating Tongric. You can change this anytime from the top header.",
    description: "First-visit onboarding card explanation",
  },
  "i18n.keepEnglish": {
    namespace: "i18n",
    defaultText: "Keep English",
    description: "Dismiss onboarding language prompt while keeping English",
  },
  "i18n.dialogTitle": {
    namespace: "i18n",
    defaultText: "Select Language",
    description: "Language switcher modal heading",
  },
  "i18n.dialogSubtitle": {
    namespace: "i18n",
    defaultText:
      "Only community-validated translations are displayed in local languages.",
    description: "Language switcher modal subtext",
  },
  "i18n.readyBadge": {
    namespace: "i18n",
    defaultText: "Ready",
    description: "Badge when 100% of strings in a language are validated",
  },
  "i18n.reviewProgressBadge": {
    namespace: "i18n",
    defaultText: "{{count}}/{{total}} reviewed",
    description:
      "Badge showing how many keys are validated out of total keys for a language",
  },
  "i18n.fallbackNotice": {
    namespace: "i18n",
    defaultText:
      "Tiv, Idoma, and Hausa translations are under native-speaker review. Unreviewed labels currently appear in English.",
    description:
      "Honest explanation shown when active or available languages lack 100% validated translations",
  },
  "i18n.switchError": {
    namespace: "i18n",
    defaultText:
      "Could not save your language preference. Please check your connection and try again.",
    description: "Error shown when changing language fails",
  },

  // Workspace view switcher
  "mode.switchAria": {
    namespace: "mode",
    defaultText: "Workspace view mode",
    description: "Accessible group label for Farmer/Buyer mode toggle",
  },
  "mode.farmer": {
    namespace: "mode",
    defaultText: "Farmer",
    description: "Farmer mode toggle option (keep short)",
  },
  "mode.buyer": {
    namespace: "mode",
    defaultText: "Buyer",
    description: "Buyer mode toggle option (keep short)",
  },
  "mode.farmerBadge": {
    namespace: "mode",
    defaultText: "Farmer View Active",
    description: "Status badge shown when Farmer view is selected",
  },
  "mode.buyerBadge": {
    namespace: "mode",
    defaultText: "Buyer View Active",
    description: "Status badge shown when Buyer view is selected",
  },

  // Home overview
  "home.pilotBadge": {
    namespace: "home",
    defaultText: "Benue Pilot MVP",
    description: "Pilot location badge on home screen",
  },
  "home.farmerTitle": {
    namespace: "home",
    defaultText: "Sell your produce directly and arrange transport",
    description: "Main heading in Farmer view",
  },
  "home.farmerSubtitle": {
    namespace: "home",
    defaultText:
      "List tomatoes, pepper, mangoes, and staples cleanly, compare buyer offers, and track deliveries from farm to buyer.",
    description: "Subtitle in Farmer view",
  },
  "home.buyerTitle": {
    namespace: "home",
    defaultText: "Source fresh agricultural produce directly from farmers",
    description: "Main heading in Buyer view",
  },
  "home.buyerSubtitle": {
    namespace: "home",
    defaultText:
      "Discover verified smallholder supply across Benue State, negotiate transparent orders, and coordinate haulage.",
    description: "Subtitle in Buyer view",
  },
  "home.foundationAlertTitle": {
    namespace: "home",
    defaultText:
      "Foundation active — Marketplace, Orders, Transport & Finance unlock next",
    description: "Home screen status banner heading",
  },
  "home.foundationAlertBody": {
    namespace: "home",
    defaultText:
      "You can switch between Farmer and Buyer views using the toggle in the header. Accounts, listings, logistics, and loan workflows arrive sequentially across Phases 3–9.",
    description: "Home screen status banner description",
  },
  "home.farmerFlowTitle": {
    namespace: "home",
    defaultText: "How Farmer Selling Works",
    description: "Farmer steps card heading",
  },
  "home.buyerFlowTitle": {
    namespace: "home",
    defaultText: "How Buyer Sourcing Works",
    description: "Buyer steps card heading",
  },
  "home.flowSubtitle": {
    namespace: "home",
    defaultText: "Core transaction sequence prioritized for Tongric Release 1.",
    description: "Steps card description",
  },
  "home.stepFarmerListLabel": {
    namespace: "home",
    defaultText: "List available harvest",
    description: "Farmer workflow step 1 title",
  },
  "home.stepFarmerListDesc": {
    namespace: "home",
    defaultText: "Publish quantity, price, LGA location, and compressed photo.",
    description: "Farmer workflow step 1 description",
  },
  "home.stepFarmerAgreeLabel": {
    namespace: "home",
    defaultText: "Negotiate & confirm buyer order",
    description: "Farmer workflow step 2 title",
  },
  "home.stepFarmerAgreeDesc": {
    namespace: "home",
    defaultText: "Review offers transparently and lock agreed quantity.",
    description: "Farmer workflow step 2 description",
  },
  "home.stepFarmerDeliverLabel": {
    namespace: "home",
    defaultText: "Coordinate transport & confirm delivery",
    description: "Farmer workflow step 3 title",
  },
  "home.stepFarmerDeliverDesc": {
    namespace: "home",
    defaultText: "Track 6 delivery milestones until buyer confirms receipt.",
    description: "Farmer workflow step 3 description",
  },
  "home.stepBuyerSearchLabel": {
    namespace: "home",
    defaultText: "Search produce in Benue communities",
    description: "Buyer workflow step 1 title",
  },
  "home.stepBuyerSearchDesc": {
    namespace: "home",
    defaultText: "Filter verified farmers by crop, LGA, quantity, and price.",
    description: "Buyer workflow step 1 description",
  },
  "home.stepBuyerOfferLabel": {
    namespace: "home",
    defaultText: "Submit offer & lock order",
    description: "Buyer workflow step 2 title",
  },
  "home.stepBuyerOfferDesc": {
    namespace: "home",
    defaultText:
      "Negotiate terms directly with the farmer with clear payment notes.",
    description: "Buyer workflow step 2 description",
  },
  "home.stepBuyerReceiveLabel": {
    namespace: "home",
    defaultText: "Arrange logistics & confirm receipt",
    description: "Buyer workflow step 3 title",
  },
  "home.stepBuyerReceiveDesc": {
    namespace: "home",
    defaultText:
      "Compare transport quotes and track produce to your destination.",
    description: "Buyer workflow step 3 description",
  },
  "home.mobileTitle": {
    namespace: "home",
    defaultText: "Mobile-First Navigation",
    description: "Mobile navigation explanation card heading",
  },
  "home.mobileSubtitle": {
    namespace: "home",
    defaultText: "Built for low-end Android phones and slow rural connectivity.",
    description: "Mobile navigation card subtitle",
  },
  "home.mobileDesc1": {
    namespace: "home",
    defaultText:
      "On mobile screens, Tongric organizes core sections into five bottom tabs: Home, Market, Orders, Transport, and Finance.",
    description: "Mobile navigation paragraph 1",
  },
  "home.mobileDesc2": {
    namespace: "home",
    defaultText:
      "Your Farmer / Buyer view toggle, Language selector, and upcoming Account entry stay accessible in the top header on every screen.",
    description: "Mobile navigation paragraph 2",
  },

  // Offline & connectivity states
  "offline.bannerOfflineTitle": {
    namespace: "offline",
    defaultText: "No internet connection",
    description: "Banner title shown when browser loses connectivity",
  },
  "offline.bannerOfflineBody": {
    namespace: "offline",
    defaultText:
      "You are offline. Wait until your mobile data or Wi-Fi returns before submitting changes.",
    description: "Banner explanation while offline",
  },
  "offline.bannerOnlineTitle": {
    namespace: "offline",
    defaultText: "Back online",
    description: "Brief banner title when connectivity returns",
  },
  "offline.bannerOnlineBody": {
    namespace: "offline",
    defaultText: "Connection restored. You can retry or continue your task safely.",
    description: "Banner explanation upon reconnection",
  },
  "offline.pageTitle": {
    namespace: "offline",
    defaultText: "You are currently offline",
    description: "PWA offline fallback page heading",
  },
  "offline.pageBody": {
    namespace: "offline",
    defaultText:
      "Tongric needs an active internet connection to load live produce stock, offers, and delivery updates. Turn on mobile data or Wi-Fi and tap Try Again.",
    description: "PWA offline fallback page instructions",
  },

  // Common errors
  "errors.validation": {
    namespace: "errors",
    defaultText: "Please check the highlighted fields and try again.",
    description: "Generic form validation failure message",
  },
  "errors.unauthorized": {
    namespace: "errors",
    defaultText: "Please sign in to continue.",
    description: "401 authentication required message",
  },
  "errors.forbidden": {
    namespace: "errors",
    defaultText: "You do not have permission to perform this action.",
    description: "403 forbidden action message",
  },
  "errors.notFound": {
    namespace: "errors",
    defaultText: "The requested item could not be found.",
    description: "404 missing record message",
  },
  "errors.network": {
    namespace: "errors",
    defaultText: "Network connection lost. Please check your signal and retry.",
    description: "Offline/network failure message",
  },
  "errors.timeout": {
    namespace: "errors",
    defaultText: "Connection timed out. Please check your network and retry.",
    description: "Slow network timeout message",
  },
  "errors.serverUnavailable": {
    namespace: "errors",
    defaultText: "Service temporarily unavailable. Please try again shortly.",
    description: "503 temporary outage message",
  },

  // Priority crop catalog
  "crop.tomatoes": {
    namespace: "crop",
    defaultText: "Tomatoes",
    description: "Produce category: Tomatoes",
  },
  "crop.pepper": {
    namespace: "crop",
    defaultText: "Pepper",
    description: "Produce category: Pepper",
  },
  "crop.mangoes": {
    namespace: "crop",
    defaultText: "Mangoes",
    description: "Produce category: Mangoes",
  },
  "crop.cashew": {
    namespace: "crop",
    defaultText: "Cashew",
    description: "Produce category: Cashew",
  },
  "crop.yam": {
    namespace: "crop",
    defaultText: "Yam",
    description: "Produce category: Yam",
  },
  "crop.cassava": {
    namespace: "crop",
    defaultText: "Cassava",
    description: "Produce category: Cassava",
  },
  "crop.rice": {
    namespace: "crop",
    defaultText: "Rice",
    description: "Produce category: Rice",
  },
  "crop.maize": {
    namespace: "crop",
    defaultText: "Maize",
    description: "Produce category: Maize",
  },
  "crop.soybeans": {
    namespace: "crop",
    defaultText: "Soybeans",
    description: "Produce category: Soybeans",
  },
  "crop.other": {
    namespace: "crop",
    defaultText: "Other Crop",
    description: "Fallback produce category",
  },

  // Nigerian agricultural units
  "unit.basket": {
    namespace: "unit",
    defaultText: "Basket",
    description: "Nigerian produce measure: Basket (~30 kg estimate)",
  },
  "unit.bag": {
    namespace: "unit",
    defaultText: "Bag",
    description: "Nigerian produce measure: Bag (~50 kg estimate)",
  },
  "unit.crate": {
    namespace: "unit",
    defaultText: "Crate",
    description: "Nigerian produce measure: Crate (~25 kg estimate)",
  },
  "unit.basin": {
    namespace: "unit",
    defaultText: "Basin",
    description: "Nigerian produce measure: Basin (~20 kg estimate)",
  },
  "unit.kg": {
    namespace: "unit",
    defaultText: "Kilogram (kg)",
    description: "Metric weight unit: Kilogram",
  },
  "unit.tonne": {
    namespace: "unit",
    defaultText: "Tonne",
    description: "Metric weight unit: Tonne (1,000 kg)",
  },
  "unit.unit": {
    namespace: "unit",
    defaultText: "Piece / Bunch",
    description: "Countable item such as single yam tuber or mango lot",
  },

  // Structured workflow status labels
  "status.order.confirmed": {
    namespace: "status",
    defaultText: "Order Confirmed",
    description: "Order lifecycle: confirmed and stock reserved",
  },
  "status.order.transportRequested": {
    namespace: "status",
    defaultText: "Transport Requested",
    description: "Order lifecycle: logistics requested",
  },
  "status.order.transportAssigned": {
    namespace: "status",
    defaultText: "Transport Assigned",
    description: "Order lifecycle: transport provider selected",
  },
  "status.order.collected": {
    namespace: "status",
    defaultText: "Collected",
    description: "Order lifecycle: produce picked up by driver",
  },
  "status.order.inTransit": {
    namespace: "status",
    defaultText: "In Transit",
    description: "Order lifecycle: shipment on the road",
  },
  "status.order.delivered": {
    namespace: "status",
    defaultText: "Delivered",
    description: "Order lifecycle: arrived at buyer destination",
  },
  "status.order.completed": {
    namespace: "status",
    defaultText: "Completed",
    description: "Order lifecycle: buyer confirmed receipt",
  },
  "status.order.cancelled": {
    namespace: "status",
    defaultText: "Cancelled",
    description: "Order lifecycle: order cancelled",
  },
  "status.order.disputed": {
    namespace: "status",
    defaultText: "Disputed",
    description: "Order lifecycle: issue reported for admin review",
  },
  "status.delivery.requested": {
    namespace: "status",
    defaultText: "Transportation requested",
    description: "Delivery milestone 1",
  },
  "status.delivery.providerConfirmed": {
    namespace: "status",
    defaultText: "Provider confirmed",
    description: "Delivery milestone 2",
  },
  "status.delivery.collected": {
    namespace: "status",
    defaultText: "Produce collected",
    description: "Delivery milestone 3",
  },
  "status.delivery.dispatched": {
    namespace: "status",
    defaultText: "Shipment dispatched",
    description: "Delivery milestone 4",
  },
  "status.delivery.delivered": {
    namespace: "status",
    defaultText: "Produce delivered",
    description: "Delivery milestone 5",
  },
  "status.delivery.buyerConfirmed": {
    namespace: "status",
    defaultText: "Buyer confirmed receipt",
    description: "Delivery milestone 6",
  },
  "status.verification.unverified": {
    namespace: "status",
    defaultText: "Unverified",
    description: "Account verification status: not submitted",
  },
  "status.verification.pending": {
    namespace: "status",
    defaultText: "Pending Review",
    description: "Account verification status: under admin review",
  },
  "status.verification.verified": {
    namespace: "status",
    defaultText: "Verified",
    description: "Account verification status: approved",
  },
  "status.verification.rejected": {
    namespace: "status",
    defaultText: "Needs Update",
    description: "Account verification status: rejected with feedback",
  },

  // Low-data mode controls
  "lowData.label": {
    namespace: "lowData",
    defaultText: "Low-Data Mode",
    description: "Setting label for saving mobile data",
  },
  "lowData.description": {
    namespace: "lowData",
    defaultText:
      "Hide produce photos until you tap to load them, saving mobile data on slow connections.",
    description: "Explanation of Low-Data Mode",
  },
  "lowData.on": {
    namespace: "lowData",
    defaultText: "On",
    description: "Low-Data Mode enabled label",
  },
  "lowData.off": {
    namespace: "lowData",
    defaultText: "Off",
    description: "Low-Data Mode disabled label",
  },
  "lowData.loadPhotoButton": {
    namespace: "lowData",
    defaultText: "Load photo",
    description: "Button shown on deferred images in Low-Data Mode",
  },
  "lowData.photoDeferredNote": {
    namespace: "lowData",
    defaultText: "Photo hidden to save mobile data",
    description: "Short note above Load photo button in Low-Data Mode",
  },
} as const satisfies Record<string, BaseTranslationDefinition>;

export type TranslationKeyId = keyof typeof BASE_TRANSLATIONS;
export type TranslationDictionary = Record<TranslationKeyId, string>;

export function getDefaultDictionary(): TranslationDictionary {
  const dict = {} as Record<string, string>;
  for (const [key, def] of Object.entries(BASE_TRANSLATIONS)) {
    dict[key] = def.defaultText;
  }
  return dict as TranslationDictionary;
}
