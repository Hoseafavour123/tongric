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
} as const;

