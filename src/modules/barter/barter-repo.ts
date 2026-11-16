import {
  CreateExchangeListingInput,
  ExchangeListingFilter,
  ExchangeListingSummary,
  CreateExchangeOfferInput,
  ExchangeOfferSummary,
  ExchangeAgreementSummary,
  ExchangeListingStatus,
} from "./schemas.ts";

export interface BarterRepository {
  createListing(ownerFarmerId: string, input: CreateExchangeListingInput): Promise<ExchangeListingSummary>;
  getListingById(id: string): Promise<ExchangeListingSummary | null>;
  listListings(filter: ExchangeListingFilter): Promise<ExchangeListingSummary[]>;
  updateListingStatus(id: string, status: ExchangeListingStatus): Promise<ExchangeListingSummary>;

  createOffer(listingId: string, proposerFarmerId: string, input: CreateExchangeOfferInput): Promise<ExchangeOfferSummary>;
  getOfferById(id: string): Promise<ExchangeOfferSummary | null>;
  listOffersForListing(listingId: string): Promise<ExchangeOfferSummary[]>;
  listOffersByFarmer(farmerId: string): Promise<ExchangeOfferSummary[]>;

  createAgreement(params: {
    listingId: string;
    offerId: string;
    farmerAId: string;
    farmerBId: string;
    termsSummary: string;
  }): Promise<ExchangeAgreementSummary>;
  getAgreementById(id: string): Promise<ExchangeAgreementSummary | null>;
  listAgreementsForFarmer(farmerId: string): Promise<ExchangeAgreementSummary[]>;
  confirmAgreementSide(params: {
    agreementId: string;
    userId: string;
    side: "FARMER_A" | "FARMER_B";
  }): Promise<ExchangeAgreementSummary>;
}

