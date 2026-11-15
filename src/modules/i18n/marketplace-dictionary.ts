/**
 * Domain dictionary entries for the Tongric Agricultural Produce Marketplace,
 * commercial produce listings, grading, units, availability, and farm location capture.
 */
export const MARKETPLACE_TRANSLATIONS = {
  /* ------------------------------------------------------------------------ */
  /* Produce Listing Creation Entries                                         */
  /* ------------------------------------------------------------------------ */
  "marketplace.create.title": {
    namespace: "marketplace",
    description: "Heading on create produce listing page",
    defaultText: "Create Produce Listing",
  },
  "marketplace.create.subtitle": {
    namespace: "marketplace",
    description: "Subtitle explaining produce listing purpose",
    defaultText: "List your Benue harvest for commercial buyers, food processors, and retailers.",
  },
  "marketplace.create.cropLabel": {
    namespace: "marketplace",
    description: "Label for produce crop selector",
    defaultText: "Produce Crop",
  },
  "marketplace.create.cropPlaceholder": {
    namespace: "marketplace",
    description: "Placeholder for produce crop selector",
    defaultText: "Select crop",
  },
  "marketplace.create.gradeLabel": {
    namespace: "marketplace",
    description: "Label for quality grade radio selection",
    defaultText: "Quality Grade",
  },
  "marketplace.create.gradeA": {
    namespace: "marketplace",
    description: "Title for Grade A premium quality",
    defaultText: "Grade A (Premium)",
  },
  "marketplace.create.gradeADesc": {
    namespace: "marketplace",
    description: "Description for Grade A premium quality",
    defaultText: "Export & supermarket grade, uniform size, zero defects.",
  },
  "marketplace.create.gradeB": {
    namespace: "marketplace",
    description: "Title for Grade B standard quality",
    defaultText: "Grade B (Standard Market)",
  },
  "marketplace.create.gradeBDesc": {
    namespace: "marketplace",
    description: "Description for Grade B standard quality",
    defaultText: "Good quality local open-market standard, clean and sound.",
  },
  "marketplace.create.gradeC": {
    namespace: "marketplace",
    description: "Title for Grade C processing quality",
    defaultText: "Grade C (Processing / Bulk)",
  },
  "marketplace.create.gradeCDesc": {
    namespace: "marketplace",
    description: "Description for Grade C processing quality",
    defaultText: "Suitable for milling, industrial processing, or animal feed.",
  },
  "marketplace.create.quantityLabel": {
    namespace: "marketplace",
    description: "Label for quantity input",
    defaultText: "Total Quantity Available",
  },
  "marketplace.create.quantityPlaceholder": {
    namespace: "marketplace",
    description: "Placeholder for quantity input",
    defaultText: "e.g. 50",
  },
  "marketplace.create.unitLabel": {
    namespace: "marketplace",
    description: "Label for packaging unit dropdown",
    defaultText: "Packaging Unit",
  },
  "marketplace.create.unitPlaceholder": {
    namespace: "marketplace",
    description: "Placeholder for packaging unit dropdown",
    defaultText: "Select packaging unit",
  },
  "marketplace.create.estimatedWeight": {
    namespace: "marketplace",
    description: "Label for calculated total weight",
    defaultText: "Estimated Total Weight",
  },
  "marketplace.create.pricePerUnitLabel": {
    namespace: "marketplace",
    description: "Label for price per unit input",
    defaultText: "Price Per Unit (₦)",
  },
  "marketplace.create.pricePlaceholder": {
    namespace: "marketplace",
    description: "Placeholder for price per unit input",
    defaultText: "e.g. 35000",
  },
  "marketplace.create.minOrderQuantityLabel": {
    namespace: "marketplace",
    description: "Label for minimum order quantity input",
    defaultText: "Minimum Order Quantity (MOQ)",
  },
  "marketplace.create.minOrderQuantityPlaceholder": {
    namespace: "marketplace",
    description: "Placeholder for minimum order quantity input",
    defaultText: "e.g. 5",
  },
  "marketplace.create.negotiableLabel": {
    namespace: "marketplace",
    description: "Label for negotiable price checkbox",
    defaultText: "Price is open to negotiation",
  },
  "marketplace.create.negotiableDesc": {
    namespace: "marketplace",
    description: "Description for negotiable price toggle",
    defaultText: "Buyers can submit counter-offers or negotiate for large quantities.",
  },
  "marketplace.create.availabilityLabel": {
    namespace: "marketplace",
    description: "Label for produce availability selection",
    defaultText: "Harvest Availability",
  },
  "marketplace.create.availableNow": {
    namespace: "marketplace",
    description: "Title for available now option",
    defaultText: "Available Now (Harvested & Ready)",
  },
  "marketplace.create.availableNowDesc": {
    namespace: "marketplace",
    description: "Description for available now option",
    defaultText: "Produce is currently harvested and ready for inspection or pickup.",
  },
  "marketplace.create.upcomingHarvest": {
    namespace: "marketplace",
    description: "Title for upcoming harvest option",
    defaultText: "Upcoming Harvest (Pre-order)",
  },
  "marketplace.create.upcomingHarvestDesc": {
    namespace: "marketplace",
    description: "Description for upcoming harvest option",
    defaultText: "Produce is still in the field; buyers can book batches in advance.",
  },
  "marketplace.create.harvestDateLabel": {
    namespace: "marketplace",
    description: "Label for estimated harvest date input",
    defaultText: "Estimated Harvest Date",
  },
  "marketplace.create.locationSection": {
    namespace: "marketplace",
    description: "Heading for produce pickup location section",
    defaultText: "Produce Location (Benue State)",
  },
  "marketplace.create.stateLabel": {
    namespace: "marketplace",
    description: "Label for State",
    defaultText: "State",
  },
  "marketplace.create.stateValue": {
    namespace: "marketplace",
    description: "Display value for pilot State",
    defaultText: "Benue State (Pilot Region)",
  },
  "marketplace.create.lgaLabel": {
    namespace: "marketplace",
    description: "Label for LGA dropdown",
    defaultText: "Local Government Area (LGA)",
  },
  "marketplace.create.lgaPlaceholder": {
    namespace: "marketplace",
    description: "Placeholder for LGA dropdown",
    defaultText: "Select farm LGA",
  },
  "marketplace.create.communityLabel": {
    namespace: "marketplace",
    description: "Label for community or farm location",
    defaultText: "Town, Village, or Farm Settlement",
  },
  "marketplace.create.communityPlaceholder": {
    namespace: "marketplace",
    description: "Placeholder for community or farm location",
    defaultText: "e.g. Tse-Agber, Tor-Donga, Wurukum Market",
  },
  "marketplace.create.descriptionLabel": {
    namespace: "marketplace",
    description: "Label for optional produce details input",
    defaultText: "Produce Description & Condition (Optional)",
  },
  "marketplace.create.descriptionPlaceholder": {
    namespace: "marketplace",
    description: "Placeholder for produce description",
    defaultText: "State variety, moisture level, bag type, or road access details...",
  },
  "marketplace.create.photosLabel": {
    namespace: "marketplace",
    description: "Label for produce photos section",
    defaultText: "Produce Photos (Up to 4)",
  },
  "marketplace.create.photosDesc": {
    namespace: "marketplace",
    description: "Helper text for photos",
    defaultText: "Real photos of your harvest help buyers verify quality and close deals faster.",
  },
  "marketplace.create.addPhoto": {
    namespace: "marketplace",
    description: "Button to upload or take a photo",
    defaultText: "Take or Upload Photo",
  },
  "marketplace.create.compressingPhoto": {
    namespace: "marketplace",
    description: "Status indicator while compressing photo",
    defaultText: "Optimizing photo for fast upload...",
  },
  "marketplace.create.removePhoto": {
    namespace: "marketplace",
    description: "Button to delete an uploaded photo",
    defaultText: "Remove",
  },
  "marketplace.create.primaryPhotoBadge": {
    namespace: "marketplace",
    description: "Badge for main listing photo",
    defaultText: "Main Photo",
  },
  "marketplace.create.submitButton": {
    namespace: "marketplace",
    description: "Primary action button to publish produce listing",
    defaultText: "Publish Produce Listing",
  },
  "marketplace.create.submitting": {
    namespace: "marketplace",
    description: "Button text while listing submission is in flight",
    defaultText: "Publishing Listing...",
  },
  "marketplace.create.successMessage": {
    namespace: "marketplace",
    description: "Banner message upon listing creation success",
    defaultText: "Your produce listing has been published to the marketplace.",
  },
  "marketplace.create.viewListing": {
    namespace: "marketplace",
    description: "Link to view the newly published listing",
    defaultText: "View Listing",
  },
  "marketplace.create.errorCrop": {
    namespace: "marketplace",
    description: "Validation error for missing crop",
    defaultText: "Please choose a crop.",
  },
  "marketplace.create.errorQuantity": {
    namespace: "marketplace",
    description: "Validation error for invalid quantity",
    defaultText: "Quantity must be at least 1.",
  },
  "marketplace.create.errorUnit": {
    namespace: "marketplace",
    description: "Validation error for missing packaging unit",
    defaultText: "Please choose a packaging unit.",
  },
  "marketplace.create.errorPrice": {
    namespace: "marketplace",
    description: "Validation error for missing or zero price",
    defaultText: "Price per unit must be greater than ₦0.",
  },
  "marketplace.create.errorMinOrder": {
    namespace: "marketplace",
    description: "Validation error for MOQ exceeding total quantity",
    defaultText: "Minimum order cannot exceed total quantity.",
  },
  "marketplace.create.errorLga": {
    namespace: "marketplace",
    description: "Validation error for missing LGA",
    defaultText: "Please select an LGA in Benue State.",
  },
  "marketplace.create.errorCommunity": {
    namespace: "marketplace",
    description: "Validation error for missing community",
    defaultText: "Please enter your town or community.",
  },
  "marketplace.create.errorHarvestDate": {
    namespace: "marketplace",
    description: "Validation error for missing harvest date on upcoming harvest",
    defaultText: "Please enter the estimated harvest date.",
  },

  /* ------------------------------------------------------------------------ */
  /* General Marketplace & Navigation Entries                                 */
  /* ------------------------------------------------------------------------ */
  "marketplace.nav.title": {
    namespace: "marketplace",
    description: "Marketplace page title",
    defaultText: "Produce Market",
  },
  "marketplace.nav.subtitle": {
    namespace: "marketplace",
    description: "Marketplace page subtitle",
    defaultText: "Commercial agricultural produce directly from verified Benue farmers.",
  },
  "marketplace.nav.createListing": {
    namespace: "marketplace",
    description: "Call to action button to create listing",
    defaultText: "Sell Produce",
  },
  "marketplace.nav.myListings": {
    namespace: "marketplace",
    description: "Tab or link to farmer's own listings",
    defaultText: "My Listings",
  },
  "marketplace.nav.allListings": {
    namespace: "marketplace",
    description: "Tab or link to browse all listings",
    defaultText: "Browse All Produce",
  },
  "marketplace.status.active": {
    namespace: "marketplace",
    description: "Badge label for active listing",
    defaultText: "Active",
  },
  "marketplace.status.draft": {
    namespace: "marketplace",
    description: "Badge label for draft listing",
    defaultText: "Draft",
  },
  "marketplace.status.paused": {
    namespace: "marketplace",
    description: "Badge label for paused listing",
    defaultText: "Paused",
  },
  "marketplace.status.soldOut": {
    namespace: "marketplace",
    description: "Badge label for sold out listing",
    defaultText: "Sold Out",
  },
  "marketplace.status.cancelled": {
    namespace: "marketplace",
    description: "Badge label for cancelled listing",
    defaultText: "Cancelled",
  },
  "marketplace.list.empty": {
    namespace: "marketplace",
    description: "Title when no produce listings exist",
    defaultText: "No produce listings yet",
  },
  "marketplace.list.emptyDesc": {
    namespace: "marketplace",
    description: "Description when no produce listings exist",
    defaultText: "Check back soon or create the first produce listing in Benue State.",
  },
  "marketplace.listing.negotiable": {
    namespace: "marketplace",
    description: "Badge indicating price is negotiable",
    defaultText: "Negotiable",
  },
  "marketplace.listing.fixed": {
    namespace: "marketplace",
    description: "Badge indicating price is fixed",
    defaultText: "Fixed Price",
  },
  "marketplace.listing.moq": {
    namespace: "marketplace",
    description: "Minimum order quantity prefix",
    defaultText: "Min order",
  },
  "marketplace.listing.totalWeight": {
    namespace: "marketplace",
    description: "Total estimated weight label",
    defaultText: "Total weight",
  },
  "marketplace.listing.seller": {
    namespace: "marketplace",
    description: "Seller label",
    defaultText: "Seller",
  },
  "marketplace.listing.contactSeller": {
    namespace: "marketplace",
    description: "Button to contact seller",
    defaultText: "Contact Farmer",
  },
  /* ------------------------------------------------------------------------ */
  /* Marketplace Discovery, Filtering & Listing Detail Entries               */
  /* ------------------------------------------------------------------------ */
  "marketplace.filter.allCrops": {
    namespace: "marketplace",
    description: "Label for all crops filter chip",
    defaultText: "All Crops",
  },
  "marketplace.filter.allLgas": {
    namespace: "marketplace",
    description: "Option for all Benue LGAs",
    defaultText: "All LGAs (Benue)",
  },
  "marketplace.filter.allGrades": {
    namespace: "marketplace",
    description: "Option for all quality grades",
    defaultText: "All Grades",
  },
  "marketplace.filter.allAvailability": {
    namespace: "marketplace",
    description: "Option for all harvest availability states",
    defaultText: "All Availability",
  },
  "marketplace.filter.availableNow": {
    namespace: "marketplace",
    description: "Option for ready produce",
    defaultText: "Available Now",
  },
  "marketplace.filter.upcomingHarvest": {
    namespace: "marketplace",
    description: "Option for upcoming harvest produce",
    defaultText: "Upcoming Harvest",
  },
  "marketplace.filter.sortNewest": {
    namespace: "marketplace",
    description: "Sort option for newest listings",
    defaultText: "Newest First",
  },
  "marketplace.filter.sortPriceAsc": {
    namespace: "marketplace",
    description: "Sort option for lowest price per unit",
    defaultText: "Price: Low to High",
  },
  "marketplace.filter.sortPriceDesc": {
    namespace: "marketplace",
    description: "Sort option for highest price per unit",
    defaultText: "Price: High to Low",
  },
  "marketplace.filter.sortQtyDesc": {
    namespace: "marketplace",
    description: "Sort option for highest quantity",
    defaultText: "Quantity: High to Low",
  },
  "marketplace.filter.reset": {
    namespace: "marketplace",
    description: "Button to clear all filters",
    defaultText: "Reset Filters",
  },
  "marketplace.filter.resultsCount": {
    namespace: "marketplace",
    description: "Header showing number of matching produce listings",
    defaultText: "Showing produce listings",
  },
  "marketplace.filter.noResults": {
    namespace: "marketplace",
    description: "Notice when no produce listings match filter criteria",
    defaultText: "No listings match your selected filters.",
  },
  "marketplace.detail.backToMarket": {
    namespace: "marketplace",
    description: "Back button linking to marketplace overview",
    defaultText: "Back to Marketplace",
  },
  "marketplace.detail.callFarmer": {
    namespace: "marketplace",
    description: "Call to action button to call farmer directly",
    defaultText: "Call Farmer",
  },
  "marketplace.detail.makeOffer": {
    namespace: "marketplace",
    description: "Call to action button to start commercial enquiry or offer",
    defaultText: "Start Purchase / Make Offer",
  },
  "marketplace.detail.verifiedSeller": {
    namespace: "marketplace",
    description: "Badge indicating farmer verification",
    defaultText: "Verified Farmer",
  },
  "marketplace.detail.unverifiedSeller": {
    namespace: "marketplace",
    description: "Badge indicating unverified farmer",
    defaultText: "Unverified Farmer",
  },
  "marketplace.detail.minOrder": {
    namespace: "marketplace",
    description: "Minimum order quantity label on detail view",
    defaultText: "Minimum Order Quantity",
  },
  "marketplace.detail.totalAvailable": {
    namespace: "marketplace",
    description: "Total available stock quantity label",
    defaultText: "Total Available Quantity",
  },
  "marketplace.detail.estimatedWeight": {
    namespace: "marketplace",
    description: "Total estimated weight label on detail view",
    defaultText: "Estimated Total Weight",
  },
  "marketplace.detail.harvestDate": {
    namespace: "marketplace",
    description: "Estimated harvest date label",
    defaultText: "Estimated Harvest Date",
  },
  "marketplace.detail.sellerInfo": {
    namespace: "marketplace",
    description: "Section heading for farmer identity and origin",
    defaultText: "Farmer & Farm Origin",
  },
  "marketplace.detail.produceDetails": {
    namespace: "marketplace",
    description: "Section heading for produce commercial specifications",
    defaultText: "Commercial Specifications",
  },
  "marketplace.detail.perishable": {
    namespace: "marketplace",
    description: "Tag for perishable produce requiring rapid logistics",
    defaultText: "Perishable Produce",
  },
  "marketplace.detail.cooperative": {
    namespace: "marketplace",
    description: "Cooperative label on detail view",
    defaultText: "Cooperative",
  },
} as const;

