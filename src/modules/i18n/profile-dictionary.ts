/**
 * Domain dictionary entries for participant profiles (Farmer, Buyer, Transport Provider),
 * farm/buyer locations, fleet capacity, and verification status indicators.
 */
export const PROFILE_TRANSLATIONS = {
  /* ------------------------------------------------------------------------ */
  /* Shared / Farmer Profile Entries                                          */
  /* ------------------------------------------------------------------------ */
  "profile.farmer.title": {
    namespace: "profile",
    description: "Heading on farmer profile page",
    defaultText: "Farm Profile",
  },
  "profile.farmer.subtitle": {
    namespace: "profile",
    description: "Subtitle explaining farm location capture",
    defaultText: "Tell buyers and drivers where your farm is located and what you grow in Benue State.",
  },
  "profile.farmer.stateLabel": {
    namespace: "profile",
    description: "Label for State",
    defaultText: "State",
  },
  "profile.farmer.stateValue": {
    namespace: "profile",
    description: "Display value for pilot State",
    defaultText: "Benue State (Pilot Region)",
  },
  "profile.farmer.lgaLabel": {
    namespace: "profile",
    description: "Label for LGA dropdown",
    defaultText: "Local Government Area (LGA)",
  },
  "profile.farmer.lgaPlaceholder": {
    namespace: "profile",
    description: "Default placeholder for LGA dropdown",
    defaultText: "Select your LGA",
  },
  "profile.farmer.communityLabel": {
    namespace: "profile",
    description: "Label for community or village input",
    defaultText: "Town, Village, or Community",
  },
  "profile.farmer.communityPlaceholder": {
    namespace: "profile",
    description: "Placeholder for community or village input",
    defaultText: "e.g. Tse-Agber, Tor-Donga, Wurukum",
  },
  "profile.farmer.cropsLabel": {
    namespace: "profile",
    description: "Label for primary crops selection",
    defaultText: "Crops You Grow (Choose at least one)",
  },
  "profile.farmer.coopLabel": {
    namespace: "profile",
    description: "Label for cooperative affiliation",
    defaultText: "Cooperative or Farmers Group (Optional)",
  },
  "profile.farmer.coopPlaceholder": {
    namespace: "profile",
    description: "Placeholder for cooperative name",
    defaultText: "e.g. Gboko Yam Farmers Cooperative",
  },
  "profile.farmer.sizeLabel": {
    namespace: "profile",
    description: "Label for farm size in hectares",
    defaultText: "Approximate Farm Size in Hectares (Optional)",
  },
  "profile.farmer.sizePlaceholder": {
    namespace: "profile",
    description: "Placeholder for farm size in hectares",
    defaultText: "e.g. 2.5",
  },
  "profile.farmer.saveButton": {
    namespace: "profile",
    description: "Submit button text for saving farm profile",
    defaultText: "Save Farm Profile",
  },
  "profile.farmer.savingButton": {
    namespace: "profile",
    description: "Button text while saving profile",
    defaultText: "Saving profile...",
  },
  "profile.farmer.savedSuccess": {
    namespace: "profile",
    description: "Success message after profile is saved",
    defaultText: "Farm profile saved successfully.",
  },
  "profile.farmer.statusCardTitle": {
    namespace: "profile",
    description: "Card title on account page for farm profile status",
    defaultText: "Farm Profile Status",
  },
  "profile.status.incomplete": {
    namespace: "profile",
    description: "Profile incomplete status badge",
    defaultText: "Incomplete",
  },
  "profile.status.complete": {
    namespace: "profile",
    description: "Profile complete status badge",
    defaultText: "Complete",
  },
  "profile.status.unverified": {
    namespace: "profile",
    description: "Verification status unverified badge",
    defaultText: "Unverified",
  },
  "profile.status.pending": {
    namespace: "profile",
    description: "Verification status pending review badge",
    defaultText: "Pending Review",
  },
  "profile.status.verified": {
    namespace: "profile",
    description: "Verification status verified badge",
    defaultText: "Verified",
  },
  "profile.status.rejected": {
    namespace: "profile",
    description: "Verification status rejected badge",
    defaultText: "Rejected",
  },
  "profile.farmer.completeProfileCta": {
    namespace: "profile",
    description: "Call to action button to complete farm profile",
    defaultText: "Complete Farm Profile",
  },
  "profile.farmer.editProfileCta": {
    namespace: "profile",
    description: "Call to action button to edit farm profile",
    defaultText: "Edit Farm Profile",
  },
  "profile.farmer.backToAccount": {
    namespace: "profile",
    description: "Back link text to account overview",
    defaultText: "Back to Account",
  },
  "profile.farmer.missingCropsError": {
    namespace: "profile",
    description: "Validation error message when no crops are checked",
    defaultText: "Please select at least one crop that you farm.",
  },

  /* ------------------------------------------------------------------------ */
  /* Buyer Profile Entries                                                    */
  /* ------------------------------------------------------------------------ */
  "profile.buyer.title": {
    namespace: "profile",
    description: "Heading on buyer profile page",
    defaultText: "Buyer Profile",
  },
  "profile.buyer.subtitle": {
    namespace: "profile",
    description: "Subtitle explaining buyer profile setup",
    defaultText: "Tell farmers what produce your business purchases and where you operate.",
  },
  "profile.buyer.businessNameLabel": {
    namespace: "profile",
    description: "Label for business or buyer name",
    defaultText: "Business or Organization Name",
  },
  "profile.buyer.businessNamePlaceholder": {
    namespace: "profile",
    description: "Placeholder for business name",
    defaultText: "e.g. Benue Agro Processors Ltd",
  },
  "profile.buyer.typeLabel": {
    namespace: "profile",
    description: "Label for buyer category dropdown",
    defaultText: "Buyer Category",
  },
  "profile.buyer.typePlaceholder": {
    namespace: "profile",
    description: "Placeholder for buyer category dropdown",
    defaultText: "Select your buyer category",
  },
  "profile.buyer.type.processor": {
    namespace: "profile",
    description: "Buyer category: Food processor or agro-industrial mill",
    defaultText: "Food Processor / Mill",
  },
  "profile.buyer.type.wholesaler": {
    namespace: "profile",
    description: "Buyer category: Wholesaler or bulk aggregator",
    defaultText: "Wholesaler / Bulk Trader",
  },
  "profile.buyer.type.retailer": {
    namespace: "profile",
    description: "Buyer category: Market retailer or grocery vendor",
    defaultText: "Retailer / Market Trader",
  },
  "profile.buyer.type.restaurantHotel": {
    namespace: "profile",
    description: "Buyer category: Restaurant, hotel, or food vendor",
    defaultText: "Restaurant / Hotel / Eatery",
  },
  "profile.buyer.type.institutional": {
    namespace: "profile",
    description: "Buyer category: School, hospital, or government institution",
    defaultText: "School / Hospital / Institution",
  },
  "profile.buyer.lgaLabel": {
    namespace: "profile",
    description: "Label for buyer operating LGA",
    defaultText: "Operating LGA in Benue State",
  },
  "profile.buyer.lgaPlaceholder": {
    namespace: "profile",
    description: "Placeholder for buyer operating LGA",
    defaultText: "Select operating LGA",
  },
  "profile.buyer.marketLabel": {
    namespace: "profile",
    description: "Label for primary market or warehouse location",
    defaultText: "Primary Market or Collection Point (Optional)",
  },
  "profile.buyer.marketPlaceholder": {
    namespace: "profile",
    description: "Placeholder for primary market",
    defaultText: "e.g. Modern Market Makurdi",
  },
  "profile.buyer.cropsLabel": {
    namespace: "profile",
    description: "Label for crops sourced by buyer",
    defaultText: "Produce You Regularly Purchase (Choose at least one)",
  },
  "profile.buyer.saveButton": {
    namespace: "profile",
    description: "Submit button for saving buyer profile",
    defaultText: "Save Buyer Profile",
  },
  "profile.buyer.savingButton": {
    namespace: "profile",
    description: "Button text while saving buyer profile",
    defaultText: "Saving profile...",
  },
  "profile.buyer.savedSuccess": {
    namespace: "profile",
    description: "Success message after saving buyer profile",
    defaultText: "Buyer profile saved successfully.",
  },
  "profile.buyer.statusCardTitle": {
    namespace: "profile",
    description: "Card title on account page for buyer profile",
    defaultText: "Buyer Profile Status",
  },
  "profile.buyer.editProfileCta": {
    namespace: "profile",
    description: "Call to action button to edit buyer profile",
    defaultText: "Edit Buyer Profile",
  },
  "profile.buyer.missingCropsError": {
    namespace: "profile",
    description: "Validation error when buyer selects no crops",
    defaultText: "Please select at least one produce crop that you buy.",
  },

  /* ------------------------------------------------------------------------ */
  /* Transport Provider Profile Entries                                       */
  /* ------------------------------------------------------------------------ */
  "profile.transporter.title": {
    namespace: "profile",
    description: "Heading on transporter profile page",
    defaultText: "Transport Provider Profile",
  },
  "profile.transporter.subtitle": {
    namespace: "profile",
    description: "Subtitle explaining transport fleet setup",
    defaultText: "Set your vehicle capacity and service routes across Benue LGAs.",
  },
  "profile.transporter.operatorNameLabel": {
    namespace: "profile",
    description: "Label for transport operator or fleet name",
    defaultText: "Operator or Fleet Business Name",
  },
  "profile.transporter.operatorNamePlaceholder": {
    namespace: "profile",
    description: "Placeholder for transporter operator name",
    defaultText: "e.g. Tersoo Fast Haulage",
  },
  "profile.transporter.vehicleTypesLabel": {
    namespace: "profile",
    description: "Label for vehicle types checkboxes",
    defaultText: "Vehicle Types in Fleet (Choose all that apply)",
  },
  "profile.transporter.vehicle.motorcycleTricycle": {
    namespace: "profile",
    description: "Vehicle category: Motorcycle or cargo tricycle",
    defaultText: "Motorcycle / Tricycle",
  },
  "profile.transporter.vehicle.pickup": {
    namespace: "profile",
    description: "Vehicle category: Light pickup truck",
    defaultText: "Pickup Truck",
  },
  "profile.transporter.vehicle.van": {
    namespace: "profile",
    description: "Vehicle category: Enclosed cargo van or bus",
    defaultText: "Van / Bus",
  },
  "profile.transporter.vehicle.truck": {
    namespace: "profile",
    description: "Vehicle category: Medium or heavy truck",
    defaultText: "Truck (5T+)",
  },
  "profile.transporter.capacityLabel": {
    namespace: "profile",
    description: "Label for max vehicle load capacity in kg",
    defaultText: "Maximum Load Capacity (in kg)",
  },
  "profile.transporter.capacityPlaceholder": {
    namespace: "profile",
    description: "Placeholder for max capacity",
    defaultText: "e.g. 2500",
  },
  "profile.transporter.routesLabel": {
    namespace: "profile",
    description: "Label for service LGAs multi-select",
    defaultText: "Service LGAs in Benue State (Select routes)",
  },
  "profile.transporter.availabilityLabel": {
    namespace: "profile",
    description: "Label for driver availability toggle",
    defaultText: "Current Availability Status",
  },
  "profile.transporter.available": {
    namespace: "profile",
    description: "Status option: Available for delivery trips",
    defaultText: "Available for Deliveries",
  },
  "profile.transporter.unavailable": {
    namespace: "profile",
    description: "Status option: Unavailable / on trip",
    defaultText: "Currently Busy / Unavailable",
  },
  "profile.transporter.pricingLabel": {
    namespace: "profile",
    description: "Label for pricing model preference",
    defaultText: "Pricing Model Preference",
  },
  "profile.transporter.pricing.fixedRate": {
    namespace: "profile",
    description: "Pricing option: Fixed rate card per km or bag",
    defaultText: "Fixed Rate Card",
  },
  "profile.transporter.pricing.quote": {
    namespace: "profile",
    description: "Pricing option: Quote on request per shipment",
    defaultText: "Quote on Request per Order",
  },
  "profile.transporter.saveButton": {
    namespace: "profile",
    description: "Submit button for saving transporter profile",
    defaultText: "Save Transport Profile",
  },
  "profile.transporter.savingButton": {
    namespace: "profile",
    description: "Button text while saving transporter profile",
    defaultText: "Saving profile...",
  },
  "profile.transporter.savedSuccess": {
    namespace: "profile",
    description: "Success message after saving transporter profile",
    defaultText: "Transport profile saved successfully.",
  },
  "profile.transporter.statusCardTitle": {
    namespace: "profile",
    description: "Card title on account page for transport profile",
    defaultText: "Transport Fleet Status",
  },
  "profile.transporter.editProfileCta": {
    namespace: "profile",
    description: "Call to action button to edit transport profile",
    defaultText: "Edit Transport Profile",
  },
  "profile.transporter.missingVehiclesError": {
    namespace: "profile",
    description: "Validation error when no vehicle type is checked",
    defaultText: "Please select at least one vehicle type in your fleet.",
  },
  "profile.transporter.missingRoutesError": {
    namespace: "profile",
    description: "Validation error when no service LGA is chosen",
    defaultText: "Please select at least one service LGA in Benue State.",
  },

  /* ------------------------------------------------------------------------ */
  /* Verification Document Submission & Admin Review Entries                  */
  /* ------------------------------------------------------------------------ */
  "profile.verify.title": {
    namespace: "profile",
    description: "Heading on verification submission page",
    defaultText: "Verify Your Account",
  },
  "profile.verify.subtitle": {
    namespace: "profile",
    description: "Subtitle explaining verification upload",
    defaultText: "Upload an ID or cooperative letter to get verified in the marketplace.",
  },
  "profile.verify.docTypeLabel": {
    namespace: "profile",
    description: "Label for document type selector",
    defaultText: "Document Type",
  },
  "profile.verify.docTypePlaceholder": {
    namespace: "profile",
    description: "Placeholder for document type selector",
    defaultText: "Select document type",
  },
  "profile.verify.type.nationalId": {
    namespace: "profile",
    description: "Document type: National Identity Number slip or card",
    defaultText: "National ID (NIN Slip / Card)",
  },
  "profile.verify.type.votersCard": {
    namespace: "profile",
    description: "Document type: INEC Voter's card",
    defaultText: "Voter's Card (INEC PVC)",
  },
  "profile.verify.type.driversLicense": {
    namespace: "profile",
    description: "Document type: FRSC Driver's license",
    defaultText: "Driver's License (FRSC)",
  },
  "profile.verify.type.cacCertificate": {
    namespace: "profile",
    description: "Document type: Corporate Affairs Commission certificate",
    defaultText: "CAC Certificate (Business)",
  },
  "profile.verify.type.cooperativeLetter": {
    namespace: "profile",
    description: "Document type: Cooperative recommendation or registration letter",
    defaultText: "Cooperative Letter",
  },
  "profile.verify.type.communityAttestation": {
    namespace: "profile",
    description: "Document type: Community or village head attestation",
    defaultText: "Community Attestation Letter",
  },
  "profile.verify.docNumberLabel": {
    namespace: "profile",
    description: "Label for optional document or ID number",
    defaultText: "Document or ID Number (Optional)",
  },
  "profile.verify.docNumberPlaceholder": {
    namespace: "profile",
    description: "Placeholder for document number",
    defaultText: "e.g. 12345678901 or RC-123456",
  },
  "profile.verify.fileLabel": {
    namespace: "profile",
    description: "Label for document file picker",
    defaultText: "Upload Photo or PDF Document",
  },
  "profile.verify.fileHint": {
    namespace: "profile",
    description: "Hint explaining accepted file types and limits",
    defaultText: "Accepts JPG, PNG, WEBP, or PDF. Up to 5 MB.",
  },
  "profile.verify.submitButton": {
    namespace: "profile",
    description: "Submit button for verification upload",
    defaultText: "Submit for Verification",
  },
  "profile.verify.submittingButton": {
    namespace: "profile",
    description: "Button text while uploading document",
    defaultText: "Uploading document...",
  },
  "profile.verify.submittedSuccess": {
    namespace: "profile",
    description: "Success message after verification document is uploaded",
    defaultText: "Document submitted. Our Benue team will review it shortly.",
  },
  "profile.verify.pendingAlert": {
    namespace: "profile",
    description: "Alert shown when verification is under review",
    defaultText: "Your verification document is under review by administrators.",
  },
  "profile.verify.verifiedAlert": {
    namespace: "profile",
    description: "Alert shown when participant is verified",
    defaultText: "Your account is verified. Trusted marketplace badge active.",
  },
  "profile.verify.rejectedAlert": {
    namespace: "profile",
    description: "Alert shown when verification was rejected",
    defaultText: "Verification was not approved. You may upload a clearer document.",
  },
  "profile.verify.missingFileError": {
    namespace: "profile",
    description: "Validation error when no file is selected",
    defaultText: "Please select a document file to upload.",
  },
  "profile.verify.missingTypeError": {
    namespace: "profile",
    description: "Validation error when no document type is chosen",
    defaultText: "Please select a document type.",
  },
  "profile.verify.viewDocumentCta": {
    namespace: "profile",
    description: "Call to action button to verify account",
    defaultText: "Verify Account",
  },
  "profile.verify.accountCardTitle": {
    namespace: "profile",
    description: "Card title on account page for identity verification",
    defaultText: "Identity & Market Verification",
  },
  "profile.verify.accountCardSubtitle": {
    namespace: "profile",
    description: "Card subtitle on account page for verification",
    defaultText: "Verify your identity or business to unlock full trading badges.",
  },
  "admin.verify.title": {
    namespace: "admin",
    description: "Heading on admin verification queue page",
    defaultText: "Verification Queue",
  },
  "admin.verify.subtitle": {
    namespace: "admin",
    description: "Subtitle on admin verification queue page",
    defaultText: "Review submitted participant credentials and update verification status.",
  },
  "admin.verify.filterAll": {
    namespace: "admin",
    description: "Filter tab: all submissions",
    defaultText: "All",
  },
  "admin.verify.filterPending": {
    namespace: "admin",
    description: "Filter tab: pending review",
    defaultText: "Pending Review",
  },
  "admin.verify.filterVerified": {
    namespace: "admin",
    description: "Filter tab: verified submissions",
    defaultText: "Verified",
  },
  "admin.verify.filterRejected": {
    namespace: "admin",
    description: "Filter tab: rejected submissions",
    defaultText: "Rejected",
  },
  "admin.verify.noPending": {
    namespace: "admin",
    description: "Empty state in verification queue",
    defaultText: "No verification requests in this queue.",
  },
  "admin.verify.userHeader": {
    namespace: "admin",
    description: "Table column: user and phone",
    defaultText: "Participant / Phone",
  },
  "admin.verify.roleHeader": {
    namespace: "admin",
    description: "Table column: participant role",
    defaultText: "Role",
  },
  "admin.verify.docHeader": {
    namespace: "admin",
    description: "Table column: document type",
    defaultText: "Document",
  },
  "admin.verify.dateHeader": {
    namespace: "admin",
    description: "Table column: submission date",
    defaultText: "Submitted",
  },
  "admin.verify.actionsHeader": {
    namespace: "admin",
    description: "Table column: action buttons",
    defaultText: "Action",
  },
  "admin.verify.viewDoc": {
    namespace: "admin",
    description: "Button link to inspect uploaded document",
    defaultText: "View Document",
  },
  "admin.verify.approveButton": {
    namespace: "admin",
    description: "Button to approve participant verification",
    defaultText: "Approve",
  },
  "admin.verify.rejectButton": {
    namespace: "admin",
    description: "Button to reject participant verification",
    defaultText: "Reject",
  },
  "admin.verify.rejectReasonPrompt": {
    namespace: "admin",
    description: "Prompt for rejection reason",
    defaultText: "Enter rejection reason for the participant:",
  },
  "admin.verify.approvedSuccess": {
    namespace: "admin",
    description: "Notification when participant is approved",
    defaultText: "Participant verified successfully.",
  },
  "admin.verify.rejectedSuccess": {
    namespace: "admin",
    description: "Notification when submission is rejected",
    defaultText: "Submission rejected.",
  },
} as const;
