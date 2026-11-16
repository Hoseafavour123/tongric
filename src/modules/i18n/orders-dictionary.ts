/**
/**
 * Domain dictionary entries for Tongric commercial purchase offers,
 * structured negotiations, counter-proposals, and fulfillment options.
 */
export const ORDERS_TRANSLATIONS = {
  /* ------------------------------------------------------------------------ */
  /* Offer Creation & Negotiation Entries                                     */
  /* ------------------------------------------------------------------------ */
  "orders.offer.title": {
    namespace: "orders",
    description: "Heading on create purchase offer modal",
    defaultText: "Make Purchase Offer",
  },
  "orders.offer.subtitle": {
    namespace: "orders",
    description: "Subtitle explaining commercial purchase offer terms",
    defaultText: "Submit a structured purchase proposal directly to the farmer.",
  },
  "orders.offer.quantity": {
    namespace: "orders",
    description: "Label for offer quantity input",
    defaultText: "Purchase Quantity",
  },
  "orders.offer.unitPrice": {
    namespace: "orders",
    description: "Label for proposed price per unit input",
    defaultText: "Proposed Price Per Unit (₦)",
  },
  "orders.offer.totalAmount": {
    namespace: "orders",
    description: "Label for total calculated financial offer value",
    defaultText: "Total Offer Value",
  },
  "orders.offer.fulfillment": {
    namespace: "orders",
    description: "Label for fulfillment and logistics option selection",
    defaultText: "Collection & Fulfillment Method",
  },
  "orders.offer.pickup": {
    namespace: "orders",
    description: "Option for buyer self-collection at farm gate",
    defaultText: "Farm-gate Collection (Buyer picks up at farm)",
  },
  "orders.offer.delivery": {
    namespace: "orders",
    description: "Option for farmer delivering to buyer destination",
    defaultText: "Farmer Arranges Delivery",
  },
  "orders.offer.logistics": {
    namespace: "orders",
    description: "Option for requesting platform logistics carrier quote",
    defaultText: "Request Tongric Logistics Carrier Quote",
  },
  "orders.offer.destination": {
    namespace: "orders",
    description: "Label for destination location input",
    defaultText: "Delivery / Dropoff Location",
  },
  "orders.offer.collectionDate": {
    namespace: "orders",
    description: "Label for proposed collection date picker",
    defaultText: "Proposed Collection Date",
  },
  "orders.offer.note": {
    namespace: "orders",
    description: "Label for optional offer message or delivery note",
    defaultText: "Note to Farmer (Optional)",
  },
  "orders.offer.submit": {
    namespace: "orders",
    description: "Button to submit commercial purchase offer",
    defaultText: "Send Purchase Offer",
  },
  "orders.offer.counter": {
    namespace: "orders",
    description: "Button to submit a counter-offer",
    defaultText: "Propose Counter-Offer",
  },
  "orders.offer.accept": {
    namespace: "orders",
    description: "Button to accept current offer terms",
    defaultText: "Accept Offer",
  },
  "orders.offer.decline": {
    namespace: "orders",
    description: "Button to decline offer terms",
    defaultText: "Decline Offer",
  },
  "orders.offer.withdraw": {
    namespace: "orders",
    description: "Button to withdraw offer proposal",
    defaultText: "Withdraw Offer",
  },
  "orders.offer.statusPending": {
    namespace: "orders",
    description: "Badge label for pending offer",
    defaultText: "Awaiting Farmer Response",
  },
  "orders.offer.statusCountered": {
    namespace: "orders",
    description: "Badge label for countered offer",
    defaultText: "Counter-Offer Proposed",
  },
  "orders.offer.statusAccepted": {
    namespace: "orders",
    description: "Badge label for accepted offer",
    defaultText: "Offer Accepted",
  },
  "orders.offer.statusDeclined": {
    namespace: "orders",
    description: "Badge label for declined offer",
    defaultText: "Offer Declined",
  },
  "orders.offer.statusExpired": {
    namespace: "orders",
    description: "Badge label for expired offer",
    defaultText: "Offer Expired",
  },
  "orders.offer.statusWithdrawn": {
    namespace: "orders",
    description: "Badge label for withdrawn offer",
    defaultText: "Offer Withdrawn",
  },
  "orders.offer.expiryNotice": {
    namespace: "orders",
    description: "Notice explaining offer expiration window",
    defaultText: "Offers expire in 24 hours for perishable produce or 72 hours for staples if unanswered.",
  },
  "orders.nav.offers": {
    namespace: "orders",
    description: "Tab label for active commercial negotiations",
    defaultText: "Active Negotiations",
  },
  "orders.nav.allOrders": {
    namespace: "orders",
    description: "Tab label for completed and past orders",
    defaultText: "Orders & Contracts",
  },

  /* ------------------------------------------------------------------------ */
  /* Confirmed Order & Contract Entries                                       */
  /* ------------------------------------------------------------------------ */
  "orders.order.title": {
    namespace: "orders",
    description: "Heading on confirmed order detail view",
    defaultText: "Order Details & Contract",
  },
  "orders.order.code": {
    namespace: "orders",
    description: "Label for order reference code",
    defaultText: "Order Reference Code",
  },
  "orders.order.statusConfirmed": {
    namespace: "orders",
    description: "Badge for confirmed order state",
    defaultText: "Confirmed & Locked",
  },
  "orders.order.zeroCustodyNotice": {
    namespace: "orders",
    description: "Section 19 direct payment and zero platform custody callout",
    defaultText: "Direct Settlement: Payment is made directly between Buyer and Farmer upon produce inspection. Tongric does not custody or escrow funds in Release 1.",
  },
  "orders.order.viewListing": {
    namespace: "orders",
    description: "Link to view associated produce listing",
    defaultText: "View Original Listing",
  },
  "orders.order.viewOffer": {
    namespace: "orders",
    description: "Link to view negotiation offer thread",
    defaultText: "View Offer History",
  },
  "orders.order.parties": {
    namespace: "orders",
    description: "Section heading for order participants",
    defaultText: "Transaction Participants",
  },
  "orders.order.farmer": {
    namespace: "orders",
    description: "Farmer seller role label",
    defaultText: "Farmer (Seller)",
  },
  "orders.order.buyer": {
    namespace: "orders",
    description: "Buyer role label",
    defaultText: "Buyer (Purchaser)",
  },
  "orders.order.callFarmer": {
    namespace: "orders",
    description: "Button text to initiate phone call to farmer",
    defaultText: "Call Farmer",
  },
  "orders.order.callBuyer": {
    namespace: "orders",
    description: "Button text to initiate phone call to buyer",
    defaultText: "Call Buyer",
  },
  "orders.order.milestones": {
    namespace: "orders",
    description: "Heading for order lifecycle event log",
    defaultText: "Order Timeline & Milestones",
  },
  "orders.order.activeOrders": {
    namespace: "orders",
    description: "Tab title for confirmed active orders",
    defaultText: "Confirmed Orders",
  },
  "orders.order.noOrders": {
    namespace: "orders",
    description: "Title when user has no confirmed orders",
    defaultText: "No confirmed orders found",
  },
  "orders.order.noOrdersDesc": {
    namespace: "orders",
    description: "Explanation when no orders exist",
    defaultText: "When an offer is accepted by both parties, it will appear here as a confirmed order contract.",
  },

  /* ------------------------------------------------------------------------ */
  /* Order Milestone, Cancellation & Dispute Actions                          */
  /* ------------------------------------------------------------------------ */
  "orders.action.markCollected": {
    namespace: "orders",
    description: "Button to mark produce collected from farm gate",
    defaultText: "Confirm Produce Collected",
  },
  "orders.action.markInTransit": {
    namespace: "orders",
    description: "Button to mark order in transit to destination",
    defaultText: "Mark In Transit",
  },
  "orders.action.markDelivered": {
    namespace: "orders",
    description: "Button to mark order delivered at destination",
    defaultText: "Mark Delivered",
  },
  "orders.action.confirmCompleted": {
    namespace: "orders",
    description: "Button for buyer to confirm receipt and complete order",
    defaultText: "Confirm Receipt & Complete Order",
  },
  "orders.action.cancelOrder": {
    namespace: "orders",
    description: "Button to initiate pre-collection order cancellation",
    defaultText: "Cancel Order",
  },
  "orders.action.reportDispute": {
    namespace: "orders",
    description: "Button to report a dispute on an active order",
    defaultText: "Report Dispute",
  },
  "orders.cancel.title": {
    namespace: "orders",
    description: "Title on cancellation modal",
    defaultText: "Cancel Order (Pre-Collection)",
  },
  "orders.cancel.prompt": {
    namespace: "orders",
    description: "Instructions for order cancellation",
    defaultText: "Pre-collection cancellation releases both parties and automatically restores inventory back to the active listing.",
  },
  "orders.cancel.reasonPlaceholder": {
    namespace: "orders",
    description: "Placeholder for cancellation reason text input",
    defaultText: "Explain reason for cancellation (e.g. transport unavailable, inspection discrepancy)...",
  },
  "orders.cancel.confirmButton": {
    namespace: "orders",
    description: "Submit cancellation button",
    defaultText: "Confirm Cancellation",
  },
  "orders.dispute.title": {
    namespace: "orders",
    description: "Title on dispute modal",
    defaultText: "Report Order Dispute",
  },
  "orders.dispute.prompt": {
    namespace: "orders",
    description: "Instructions for reporting dispute",
    defaultText: "Flag this transaction for admin mediation. An operator will review the details and contact both parties.",
  },
  "orders.dispute.reasonPlaceholder": {
    namespace: "orders",
    description: "Placeholder for dispute reason text input",
    defaultText: "Describe the issue or disagreement in detail...",
  },
  "orders.dispute.confirmButton": {
    namespace: "orders",
    description: "Submit dispute button",
    defaultText: "Submit Dispute to Support",
  },
  "orders.status.collected": {
    namespace: "orders",
    description: "Badge for collected produce state",
    defaultText: "Collected",
  },
  "orders.status.inTransit": {
    namespace: "orders",
    description: "Badge for in transit state",
    defaultText: "In Transit",
  },
  "orders.status.delivered": {
    namespace: "orders",
    description: "Badge for delivered produce state",
    defaultText: "Delivered",
  },
  "orders.status.completed": {
    namespace: "orders",
    description: "Badge for completed order state",
    defaultText: "Completed",
  },
  "orders.status.cancelled": {
    namespace: "orders",
    description: "Badge for cancelled order state",
    defaultText: "Cancelled",
  },
  "orders.status.disputed": {
    namespace: "orders",
    description: "Badge for disputed order state",
    defaultText: "In Dispute",
  },

  /* ------------------------------------------------------------------------ */
  /* Transport Hub, Corridors & Carrier Haulage Entries                       */
  /* ------------------------------------------------------------------------ */
  "transport.hub.title": {
    namespace: "transport",
    description: "Heading on logistics and corridors hub",
    defaultText: "Agricultural Logistics & Transport",
  },
  "transport.hub.subtitle": {
    namespace: "transport",
    description: "Subtitle explaining Benue transport corridors and carrier matching",
    defaultText: "Coordinated farm-gate produce pickup and delivery across Benue State agricultural corridors.",
  },
  "transport.action.claim": {
    namespace: "transport",
    description: "Button for transporter to claim haulage load",
    defaultText: "Claim Haulage Load",
  },
  "transport.tab.available": {
    namespace: "transport",
    description: "Tab label for open cargo loads",
    defaultText: "Open Cargo Requests",
  },
  "transport.tab.myHaulage": {
    namespace: "transport",
    description: "Tab label for assigned carrier loads",
    defaultText: "My Active Haulage",
  },
  "transport.tab.corridors": {
    namespace: "transport",
    description: "Tab label for corridor rate matrix",
    defaultText: "Corridor Rate Card",
  },
  "transport.tab.carriers": {
    namespace: "transport",
    description: "Tab label for verified carriers directory",
    defaultText: "Verified Carriers",
  },

  /* ------------------------------------------------------------------------ */
  /* Dispatch Waybill & Handover Verification Entries                         */
  /* ------------------------------------------------------------------------ */
  "orders.handover.title": {
    namespace: "orders",
    description: "Heading for handover verification section",
    defaultText: "Handover & Dispatch Authentication",
  },
  "orders.handover.farmerPickupPin": {
    namespace: "orders",
    description: "Label for farmer pickup PIN display",
    defaultText: "Farm-Gate Pickup PIN",
  },
  "orders.handover.farmerPickupDesc": {
    namespace: "orders",
    description: "Instruction for farmer to provide pickup PIN to driver",
    defaultText: "Provide this 4-digit code to the driver upon produce inspection and loading at your farm gate.",
  },
  "orders.handover.buyerDeliveryPin": {
    namespace: "orders",
    description: "Label for buyer delivery PIN display",
    defaultText: "Buyer Delivery PIN",
  },
  "orders.handover.buyerDeliveryDesc": {
    namespace: "orders",
    description: "Instruction for buyer to provide delivery PIN to driver",
    defaultText: "Provide this 4-digit code to the driver upon produce arrival and dropoff verification.",
  },
  "orders.handover.pickupVerified": {
    namespace: "orders",
    description: "Badge when farm-gate pickup is verified",
    defaultText: "Farm-Gate Pickup Authenticated",
  },
  "orders.handover.deliveryVerified": {
    namespace: "orders",
    description: "Badge when delivery handover is verified",
    defaultText: "Dropoff Delivery Authenticated",
  },
  "orders.handover.verifyPickupBtn": {
    namespace: "orders",
    description: "Button for transporter to verify farm gate collection",
    defaultText: "Verify Farm-Gate Pickup",
  },
  "orders.handover.verifyDeliveryBtn": {
    namespace: "orders",
    description: "Button for transporter to verify delivery handover",
    defaultText: "Verify Delivery Handover",
  },
  "orders.handover.waybillBtn": {
    namespace: "orders",
    description: "Button to view and print official dispatch waybill",
    defaultText: "View & Print Dispatch Waybill",
  },
  "orders.waybill.title": {
    namespace: "orders",
    description: "Heading on official dispatch waybill",
    defaultText: "Tongric Agricultural Dispatch Waybill",
  },
  "orders.waybill.number": {
    namespace: "orders",
    description: "Label for waybill number",
    defaultText: "Waybill No.",
  },
  "orders.waybill.consignor": {
    namespace: "orders",
    description: "Consignor section header",
    defaultText: "Consignor (Originating Farmer)",
  },
  "orders.waybill.consignee": {
    namespace: "orders",
    description: "Consignee section header",
    defaultText: "Consignee (Receiving Buyer)",
  },
  "orders.waybill.carrier": {
    namespace: "orders",
    description: "Carrier section header",
    defaultText: "Authorized Logistics Carrier",
  },
  "orders.waybill.manifest": {
    namespace: "orders",
    description: "Produce cargo manifest header",
    defaultText: "Cargo Manifest & Produce Lot",
  },
  "orders.waybill.disclosure": {
    namespace: "orders",
    description: "Section 19 direct settlement notice",
    defaultText: "Section 19 Platform Notice: Agricultural commerce on Tongric is executed via direct financial settlement between Buyer and Farmer. Tongric provides non-custodial logistics matching, digital waybill manifests, and dual cryptographic PIN authentication without holding user funds.",
  },
  "orders.waybill.print": {
    namespace: "orders",
    description: "Print waybill button",
    defaultText: "Print / Save Waybill Document",
  },
  "orders.reviews.rateCarrierButton": {
    namespace: "orders",
    description: "Button to open review dialog for carrier",
    defaultText: "Rate Transporter Haulage",
  },
  "orders.reviews.carrierReviewed": {
    namespace: "orders",
    description: "Badge indicating carrier was already rated",
    defaultText: "Transporter Rated",
  },
  "orders.reviews.modalTitle": {
    namespace: "orders",
    description: "Title of carrier review modal",
    defaultText: "Rate Transporter Service",
  },
  "orders.reviews.modalDesc": {
    namespace: "orders",
    description: "Description of carrier review modal",
    defaultText: "Provide verified feedback on transit timeliness, cargo handling, and communication for this corridor haulage.",
  },
  "orders.reviews.overallRatingLabel": {
    namespace: "orders",
    description: "Label for overall star rating",
    defaultText: "Overall Carrier Rating",
  },
  "orders.reviews.timelinessLabel": {
    namespace: "orders",
    description: "Label for timeliness badge score",
    defaultText: "Timeliness & Punctual Arrival",
  },
  "orders.reviews.cargoCareLabel": {
    namespace: "orders",
    description: "Label for cargo care badge score",
    defaultText: "Cargo Care & Packaging Preservation",
  },
  "orders.reviews.communicationLabel": {
    namespace: "orders",
    description: "Label for communication badge score",
    defaultText: "Polite & Clear Corridor Updates",
  },
  "orders.reviews.remarksLabel": {
    namespace: "orders",
    description: "Label for optional remarks textarea",
    defaultText: "Review Remarks (Optional)",
  },
  "orders.reviews.remarksPlaceholder": {
    namespace: "orders",
    description: "Placeholder for review remarks",
    defaultText: "Share your experience regarding loading, transit care, or offloading coordination...",
  },
  "orders.reviews.submit": {
    namespace: "orders",
    description: "Submit review button",
    defaultText: "Submit Carrier Review",
  },
  "orders.reviews.submitting": {
    namespace: "orders",
    description: "Submitting review button state",
    defaultText: "Submitting Review...",
  },
  "orders.reviews.successMessage": {
    namespace: "orders",
    description: "Success message after submitting carrier review",
    defaultText: "Carrier review submitted successfully. Thank you for building trust in Benue agricultural logistics!",
  },
  "orders.reviews.viewReviews": {
    namespace: "orders",
    description: "Label for viewing transporter reviews",
    defaultText: "Carrier Reviews",
  },
  "orders.reviews.noReviews": {
    namespace: "orders",
    description: "Label when no carrier reviews exist yet",
    defaultText: "New Transporter • No reviews yet",
  },
} as const;

