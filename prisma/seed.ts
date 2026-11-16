import fs from "node:fs";
import path from "node:path";
import { PrismaClient, UserRole, AccountStatus, VerificationStatus, ProduceGrade, AvailabilityStatus, FulfillmentMode, OrderStatus, OfferStatus, ExchangeListingStatus, ExchangeOfferStatus, ExchangeAgreementStatus, LoanApplicationStatus, ConsentType, VehicleType, PricingModel, BuyerType } from "@prisma/client";
import { hashSecret } from "../src/modules/auth/crypto.ts";
import { createPrismaI18nRepository } from "../src/modules/i18n/i18n-prisma-repo.ts";
import { syncTranslationsWithRepo } from "../src/modules/i18n/i18n-core.ts";
import { DEFAULT_FINANCING_PRODUCTS } from "../src/modules/finance/schemas.ts";

const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL must be configured in .env before running prisma/seed.ts.");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  console.log("🌾 [Tongric Seed] Starting Benue State Pilot Seeding...");

  // 1. Synchronize Multilingual Dictionaries (English, Tiv, Idoma, Hausa)
  const existingKeyCount = await prisma.translationKey.count();
  if (existingKeyCount < 500) {
    console.log("🌐 [Tongric Seed] Synchronizing multilingual dictionaries (en, tiv, ido, ha)...");
    const i18nRepo = createPrismaI18nRepository(prisma);
    const syncSummary = await syncTranslationsWithRepo(i18nRepo);
    console.log(`✓ Synced ${syncSummary.languagesSynced} languages and ${syncSummary.keysSynced} keys.`);
  } else {
    console.log(`🌐 [Tongric Seed] Multilingual dictionaries already synchronized (${existingKeyCount} keys present).`);
  }

  // 2. Seed Partner Financing Products
  console.log("🏦 [Tongric Seed] Seeding partner financing products...");
  for (const product of DEFAULT_FINANCING_PRODUCTS) {
    await prisma.financingProduct.upsert({
      where: { id: product.id },
      update: {
        partnerName: product.partnerName,
        title: product.title,
        description: product.description,
        minAmountNgn: product.minAmountNgn,
        maxAmountNgn: product.maxAmountNgn,
        interestRateSummary: product.interestRateSummary,
        repaymentTerms: product.repaymentTerms,
        eligibilityText: product.eligibilityText,
        requiredDocuments: product.requiredDocuments,
        isDemoProduct: product.isDemoProduct,
        isActive: product.isActive,
      },
      create: {
        id: product.id,
        partnerName: product.partnerName,
        title: product.title,
        description: product.description,
        minAmountNgn: product.minAmountNgn,
        maxAmountNgn: product.maxAmountNgn,
        interestRateSummary: product.interestRateSummary,
        repaymentTerms: product.repaymentTerms,
        eligibilityText: product.eligibilityText,
        requiredDocuments: product.requiredDocuments,
        isDemoProduct: product.isDemoProduct,
        isActive: product.isActive,
      },
    });
  }
  console.log(`✓ Seeded ${DEFAULT_FINANCING_PRODUCTS.length} partner financing products.`);

  // Standard demo password hash for "Password123!"
  const demoPasswordHash = await hashSecret("Password123!");

  // 3. Seed Demo Users & Profiles
  console.log("👥 [Tongric Seed] Seeding pilot demo users...");

  // Farmer A: Terna Aondover (Gboko - Tiv)
  const farmerA = await prisma.user.upsert({
    where: { phoneNumber: "+2348011111111" },
    update: {
      fullName: "Terna Aondover",
      preferredLanguageCode: "tiv",
      accountStatus: AccountStatus.ACTIVE,
      passwordHash: demoPasswordHash,
    },
    create: {
      phoneNumber: "+2348011111111",
      fullName: "Terna Aondover",
      role: UserRole.FARMER,
      preferredLanguageCode: "tiv",
      accountStatus: AccountStatus.ACTIVE,
      passwordHash: demoPasswordHash,
    },
  });

  await prisma.farmerProfile.upsert({
    where: { userId: farmerA.id },
    update: {
      lga: "Gboko",
      community: "Mkar / Wannune Corridor",
      primaryCrops: ["yam", "soybeans", "maize"],
      cooperativeName: "Gboko Central Farmers Cooperative",
      farmSizeHectares: 4.5,
      verificationStatus: VerificationStatus.VERIFIED,
      verifiedAt: new Date("2026-10-01T08:00:00Z"),
    },
    create: {
      userId: farmerA.id,
      state: "Benue",
      lga: "Gboko",
      community: "Mkar / Wannune Corridor",
      primaryCrops: ["yam", "soybeans", "maize"],
      cooperativeName: "Gboko Central Farmers Cooperative",
      farmSizeHectares: 4.5,
      verificationStatus: VerificationStatus.VERIFIED,
      verifiedAt: new Date("2026-10-01T08:00:00Z"),
    },
  });

  // Buyer: Emeka Okonkwo (Makurdi - English)
  const buyer = await prisma.user.upsert({
    where: { phoneNumber: "+2348022222222" },
    update: {
      fullName: "Emeka Okonkwo",
      preferredLanguageCode: "en",
      accountStatus: AccountStatus.ACTIVE,
      passwordHash: demoPasswordHash,
    },
    create: {
      phoneNumber: "+2348022222222",
      fullName: "Emeka Okonkwo",
      role: UserRole.BUYER,
      preferredLanguageCode: "en",
      accountStatus: AccountStatus.ACTIVE,
      passwordHash: demoPasswordHash,
    },
  });

  await prisma.buyerProfile.upsert({
    where: { userId: buyer.id },
    update: {
      businessName: "AgroVentures Wholesale Ltd",
      buyerType: BuyerType.WHOLESALER,
      operatingLga: "Makurdi",
      primaryMarket: "Wurukum Modern Market",
      cropsSourced: ["yam", "soybeans", "rice", "tomatoes"],
      verificationStatus: VerificationStatus.VERIFIED,
      verifiedAt: new Date("2026-10-05T10:00:00Z"),
    },
    create: {
      userId: buyer.id,
      businessName: "AgroVentures Wholesale Ltd",
      buyerType: BuyerType.WHOLESALER,
      state: "Benue",
      operatingLga: "Makurdi",
      primaryMarket: "Wurukum Modern Market",
      cropsSourced: ["yam", "soybeans", "rice", "tomatoes"],
      verificationStatus: VerificationStatus.VERIFIED,
      verifiedAt: new Date("2026-10-05T10:00:00Z"),
    },
  });

  // Transporter: Danladi Ibrahim (Makurdi - Hausa)
  const transporter = await prisma.user.upsert({
    where: { phoneNumber: "+2348033333333" },
    update: {
      fullName: "Danladi Ibrahim",
      preferredLanguageCode: "ha",
      accountStatus: AccountStatus.ACTIVE,
      passwordHash: demoPasswordHash,
    },
    create: {
      phoneNumber: "+2348033333333",
      fullName: "Danladi Ibrahim",
      role: UserRole.TRANSPORT_PROVIDER,
      preferredLanguageCode: "ha",
      accountStatus: AccountStatus.ACTIVE,
      passwordHash: demoPasswordHash,
    },
  });

  await prisma.transportProfile.upsert({
    where: { userId: transporter.id },
    update: {
      operatorName: "Benue Express Haulage Ltd",
      vehicleTypes: [VehicleType.TRUCK],
      maxCapacityKg: 10000,
      operatingLgas: ["Makurdi", "Gboko", "Ukum", "Katsina-Ala", "Otukpo"],
      isAvailable: true,
      pricingModel: PricingModel.QUOTE_ON_REQUEST,
      verificationStatus: VerificationStatus.VERIFIED,
      verifiedAt: new Date("2026-10-02T12:00:00Z"),
    },
    create: {
      userId: transporter.id,
      operatorName: "Benue Express Haulage Ltd",
      vehicleTypes: [VehicleType.TRUCK],
      maxCapacityKg: 10000,
      operatingLgas: ["Makurdi", "Gboko", "Ukum", "Katsina-Ala", "Otukpo"],
      isAvailable: true,
      pricingModel: PricingModel.QUOTE_ON_REQUEST,
      verificationStatus: VerificationStatus.VERIFIED,
      verifiedAt: new Date("2026-10-02T12:00:00Z"),
    },
  });

  // Admin / Pilot Coordinator: Oche Idoko (Makurdi - English)
  const admin = await prisma.user.upsert({
    where: { phoneNumber: "+2348099999999" },
    update: {
      fullName: "Oche Idoko (Pilot Coordinator)",
      preferredLanguageCode: "en",
      accountStatus: AccountStatus.ACTIVE,
      passwordHash: demoPasswordHash,
    },
    create: {
      phoneNumber: "+2348099999999",
      fullName: "Oche Idoko (Pilot Coordinator)",
      role: UserRole.ADMIN,
      preferredLanguageCode: "en",
      accountStatus: AccountStatus.ACTIVE,
      passwordHash: demoPasswordHash,
    },
  });

  // Grant Reviewer / Judge (Makurdi / National - Full Admin & Verification Access)
  const reviewer = await prisma.user.upsert({
    where: { phoneNumber: "+2348088888888" },
    update: {
      fullName: "Grant Reviewer / Judge",
      preferredLanguageCode: "en",
      accountStatus: AccountStatus.ACTIVE,
      passwordHash: demoPasswordHash,
    },
    create: {
      phoneNumber: "+2348088888888",
      fullName: "Grant Reviewer / Judge",
      role: UserRole.ADMIN,
      preferredLanguageCode: "en",
      accountStatus: AccountStatus.ACTIVE,
      passwordHash: demoPasswordHash,
    },
  });

  // Assisted Farmer: Abeje Ochanya (Otukpo - Idoma)
  const farmerB = await prisma.user.upsert({
    where: { phoneNumber: "+2348012223344" },
    update: {
      fullName: "Abeje Ochanya",
      preferredLanguageCode: "ido",
      accountStatus: AccountStatus.ACTIVE,
      assistedByUserId: admin.id,
      passwordHash: demoPasswordHash,
    },
    create: {
      phoneNumber: "+2348012223344",
      fullName: "Abeje Ochanya",
      role: UserRole.FARMER,
      preferredLanguageCode: "ido",
      accountStatus: AccountStatus.ACTIVE,
      assistedByUserId: admin.id,
      passwordHash: demoPasswordHash,
    },
  });

  await prisma.farmerProfile.upsert({
    where: { userId: farmerB.id },
    update: {
      lga: "Otukpo",
      community: "Otukpo Central Basin",
      primaryCrops: ["soybeans", "cassava", "pepper"],
      cooperativeName: "Idoma Women Agro Cooperative",
      farmSizeHectares: 2.0,
      verificationStatus: VerificationStatus.VERIFIED,
      verifiedAt: new Date("2026-10-10T14:00:00Z"),
    },
    create: {
      userId: farmerB.id,
      state: "Benue",
      lga: "Otukpo",
      community: "Otukpo Central Basin",
      primaryCrops: ["soybeans", "cassava", "pepper"],
      cooperativeName: "Idoma Women Agro Cooperative",
      farmSizeHectares: 2.0,
      verificationStatus: VerificationStatus.VERIFIED,
      verifiedAt: new Date("2026-10-10T14:00:00Z"),
    },
  });

  // Consents for users
  for (const user of [farmerA, buyer, transporter, admin, farmerB, reviewer]) {
    for (const consentType of [ConsentType.TERMS_AND_PRIVACY, ConsentType.FINANCIAL_DATA_SHARING]) {
      const existing = await prisma.consentRecord.findFirst({
        where: { userId: user.id, consentType },
      });
      if (!existing) {
        await prisma.consentRecord.create({
          data: {
            userId: user.id,
            consentType,
            policyVersion: "2026-v1.0",
            granted: true,
            locale: user.preferredLanguageCode,
          },
        });
      }
    }
  }

  // 4. Seed Active Produce Listings
  console.log("🌽 [Tongric Seed] Seeding realistic Benue produce listings...");
  
  // Listing 1: Zaki-Biam White Yam (Ukum LGA)
  const yamListing = await prisma.produceListing.upsert({
    where: { id: "list-yam-001" },
    update: {
      farmerId: farmerA.id,
      title: "Zaki-Biam Premium Harvest White Yam (Export Quality)",
      cropCode: "yam",
      cropCategory: "tuber",
      grade: ProduceGrade.GRADE_A,
      quantity: 500,
      unitCode: "unit",
      estimatedWeightKg: 1500, // 3kg/tuber avg
      pricePerUnit: 1200,
      currency: "NGN",
      minOrderQuantity: 50,
      isNegotiable: true,
      availabilityStatus: AvailabilityStatus.AVAILABLE_NOW,
      state: "Benue",
      lga: "Ukum",
      community: "Zaki-Biam International Yam Market",
      description: "Direct dry-season harvest white guinea yam tubers from fertile Zaki-Biam plains. High starch density, clean storage condition.",
      status: "ACTIVE",
    },
    create: {
      id: "list-yam-001",
      farmerId: farmerA.id,
      title: "Zaki-Biam Premium Harvest White Yam (Export Quality)",
      cropCode: "yam",
      cropCategory: "tuber",
      grade: ProduceGrade.GRADE_A,
      quantity: 500,
      unitCode: "unit",
      estimatedWeightKg: 1500,
      pricePerUnit: 1200,
      currency: "NGN",
      minOrderQuantity: 50,
      isNegotiable: true,
      availabilityStatus: AvailabilityStatus.AVAILABLE_NOW,
      state: "Benue",
      lga: "Ukum",
      community: "Zaki-Biam International Yam Market",
      description: "Direct dry-season harvest white guinea yam tubers from fertile Zaki-Biam plains. High starch density, clean storage condition.",
      status: "ACTIVE",
    },
  });

  // Listing 2: Soybeans (Gboko)
  await prisma.produceListing.upsert({
    where: { id: "list-soya-002" },
    update: {
      farmerId: farmerA.id,
      title: "High-Oil Clean Dried Soybeans (100kg Sacks)",
      cropCode: "soybeans",
      cropCategory: "grain_legume",
      grade: ProduceGrade.GRADE_A,
      quantity: 25,
      unitCode: "bag",
      estimatedWeightKg: 2500,
      pricePerUnit: 48000,
      currency: "NGN",
      minOrderQuantity: 5,
      isNegotiable: true,
      availabilityStatus: AvailabilityStatus.AVAILABLE_NOW,
      state: "Benue",
      lga: "Gboko",
      community: "Wannune Agricultural Belt",
      description: "Moisture content tested below 11%. Machine threshed, free of foreign debris, ready for industrial processing.",
      status: "ACTIVE",
    },
    create: {
      id: "list-soya-002",
      farmerId: farmerA.id,
      title: "High-Oil Clean Dried Soybeans (100kg Sacks)",
      cropCode: "soybeans",
      cropCategory: "grain_legume",
      grade: ProduceGrade.GRADE_A,
      quantity: 25,
      unitCode: "bag",
      estimatedWeightKg: 2500,
      pricePerUnit: 48000,
      currency: "NGN",
      minOrderQuantity: 5,
      isNegotiable: true,
      availabilityStatus: AvailabilityStatus.AVAILABLE_NOW,
      state: "Benue",
      lga: "Gboko",
      community: "Wannune Agricultural Belt",
      description: "Moisture content tested below 11%. Machine threshed, free of foreign debris, ready for industrial processing.",
      status: "ACTIVE",
    },
  });

  // Listing 3: Fresh Tomatoes (Makurdi)
  await prisma.produceListing.upsert({
    where: { id: "list-toma-003" },
    update: {
      farmerId: farmerB.id,
      title: "Benue River Basin Fresh Roma Tomatoes (Large Raffia Baskets)",
      cropCode: "tomatoes",
      cropCategory: "horticulture",
      grade: ProduceGrade.GRADE_B,
      quantity: 40,
      unitCode: "basket",
      estimatedWeightKg: 1200,
      pricePerUnit: 8500,
      currency: "NGN",
      minOrderQuantity: 5,
      isNegotiable: true,
      availabilityStatus: AvailabilityStatus.AVAILABLE_NOW,
      state: "Benue",
      lga: "Makurdi",
      community: "River Benue Alluvial Floodplain",
      description: "Firm, thick-fleshed Roma tomatoes freshly harvested early morning. Ideal for wholesale transport to southern urban terminals.",
      status: "ACTIVE",
    },
    create: {
      id: "list-toma-003",
      farmerId: farmerB.id,
      title: "Benue River Basin Fresh Roma Tomatoes (Large Raffia Baskets)",
      cropCode: "tomatoes",
      cropCategory: "horticulture",
      grade: ProduceGrade.GRADE_B,
      quantity: 40,
      unitCode: "basket",
      estimatedWeightKg: 1200,
      pricePerUnit: 8500,
      currency: "NGN",
      minOrderQuantity: 5,
      isNegotiable: true,
      availabilityStatus: AvailabilityStatus.AVAILABLE_NOW,
      state: "Benue",
      lga: "Makurdi",
      community: "River Benue Alluvial Floodplain",
      description: "Firm, thick-fleshed Roma tomatoes freshly harvested early morning. Ideal for wholesale transport to southern urban terminals.",
      status: "ACTIVE",
    },
  });

  // Listing 4: Yellow Maize (Katsina-Ala)
  await prisma.produceListing.upsert({
    where: { id: "list-maiz-004" },
    update: {
      farmerId: farmerA.id,
      title: "Premium Sun-Dried Yellow Maize (100kg Bags)",
      cropCode: "maize",
      cropCategory: "grain_legume",
      grade: ProduceGrade.GRADE_A,
      quantity: 60,
      unitCode: "bag",
      estimatedWeightKg: 6000,
      pricePerUnit: 38000,
      currency: "NGN",
      minOrderQuantity: 10,
      isNegotiable: true,
      availabilityStatus: AvailabilityStatus.AVAILABLE_NOW,
      state: "Benue",
      lga: "Katsina-Ala",
      community: "Katsina-Ala Grain Terminal",
      description: "Sun-dried yellow flint maize. Zero weevil infestation, treated for long storage.",
      status: "ACTIVE",
    },
    create: {
      id: "list-maiz-004",
      farmerId: farmerA.id,
      title: "Premium Sun-Dried Yellow Maize (100kg Bags)",
      cropCode: "maize",
      cropCategory: "grain_legume",
      grade: ProduceGrade.GRADE_A,
      quantity: 60,
      unitCode: "bag",
      estimatedWeightKg: 6000,
      pricePerUnit: 38000,
      currency: "NGN",
      minOrderQuantity: 10,
      isNegotiable: true,
      availabilityStatus: AvailabilityStatus.AVAILABLE_NOW,
      state: "Benue",
      lga: "Katsina-Ala",
      community: "Katsina-Ala Grain Terminal",
      description: "Sun-dried yellow flint maize. Zero weevil infestation, treated for long storage.",
      status: "ACTIVE",
    },
  });

  // Listing 5: Red Habanero Pepper (Otukpo)
  await prisma.produceListing.upsert({
    where: { id: "list-pepp-005" },
    update: {
      farmerId: farmerB.id,
      title: "Otukpo Fiery Red Habanero Pepper (Atarodo Baskets)",
      cropCode: "pepper",
      cropCategory: "horticulture",
      grade: ProduceGrade.GRADE_A,
      quantity: 20,
      unitCode: "basket",
      estimatedWeightKg: 500,
      pricePerUnit: 12000,
      currency: "NGN",
      minOrderQuantity: 2,
      isNegotiable: true,
      availabilityStatus: AvailabilityStatus.AVAILABLE_NOW,
      state: "Benue",
      lga: "Otukpo",
      community: "Otukpo Central Market Axis",
      description: "Deep red pungent pepper baskets with zero rot. Graded and packed in ventilated raffia for distance haulage.",
      status: "ACTIVE",
    },
    create: {
      id: "list-pepp-005",
      farmerId: farmerB.id,
      title: "Otukpo Fiery Red Habanero Pepper (Atarodo Baskets)",
      cropCode: "pepper",
      cropCategory: "horticulture",
      grade: ProduceGrade.GRADE_A,
      quantity: 20,
      unitCode: "basket",
      estimatedWeightKg: 500,
      pricePerUnit: 12000,
      currency: "NGN",
      minOrderQuantity: 2,
      isNegotiable: true,
      availabilityStatus: AvailabilityStatus.AVAILABLE_NOW,
      state: "Benue",
      lga: "Otukpo",
      community: "Otukpo Central Market Axis",
      description: "Deep red pungent pepper baskets with zero rot. Graded and packed in ventilated raffia for distance haulage.",
      status: "ACTIVE",
    },
  });

  // 5. Seed Commercial Offer, Handover PIN & In-Transit Order Demo
  console.log("🚚 [Tongric Seed] Seeding active commercial order with logistics waybill & handover PINs...");
  
  const demoOffer = await prisma.commercialOffer.upsert({
    where: { offerCode: "OFF-202611-0084" },
    update: {
      status: OfferStatus.ACCEPTED,
    },
    create: {
      offerCode: "OFF-202611-0084",
      listingId: yamListing.id,
      buyerId: buyer.id,
      farmerId: farmerA.id,
      status: OfferStatus.ACCEPTED,
      quantity: 200,
      unitCode: "unit",
      unitPrice: 1200,
      currency: "NGN",
      totalAmount: 240000,
      fulfillmentMode: FulfillmentMode.TONGRIC_LOGISTICS_REQUEST,
      destinationLocation: "Wurukum Wholesale Depot, Makurdi",
      lastActionById: farmerA.id,
      expiresAt: new Date(Date.now() + 7 * 86400000),
    },
  });

  await prisma.order.upsert({
    where: { orderCode: "ORD-202611-00101" },
    update: {
      status: OrderStatus.IN_TRANSIT,
      transporterId: transporter.id,
      pickupVerifiedAt: new Date(Date.now() - 3600000),
    },
    create: {
      orderCode: "ORD-202611-00101",
      offerId: demoOffer.id,
      listingId: yamListing.id,
      farmerId: farmerA.id,
      buyerId: buyer.id,
      transporterId: transporter.id,
      cropCode: "yam",
      quantity: 200,
      unitCode: "unit",
      estimatedWeightKg: 600,
      unitPrice: 1200,
      currency: "NGN",
      totalAmount: 240000,
      fulfillmentMode: FulfillmentMode.TONGRIC_LOGISTICS_REQUEST,
      destinationLocation: "Wurukum Wholesale Depot, Makurdi",
      corridorRoute: "Zaki-Biam → Katsina-Ala → Gboko → Makurdi (A344 Corridor)",
      estimatedFreightFee: 35000,
      waybillNumber: "WB-202611-88901",
      pickupPin: "5821",
      deliveryPin: "9412",
      pickupVerifiedAt: new Date(Date.now() - 3600000),
      status: OrderStatus.IN_TRANSIT,
      paymentArrangementNote: "Direct Bank Transfer on delivery inspection as agreed.",
    },
  });

  // Seed historical completed order for Farmer A to demonstrate credit tenure & sales volume
  const completedHistoricalOffer = await prisma.commercialOffer.upsert({
    where: { offerCode: "OFF-202610-0012" },
    update: { status: OfferStatus.ACCEPTED },
    create: {
      offerCode: "OFF-202610-0012",
      listingId: yamListing.id,
      buyerId: buyer.id,
      farmerId: farmerA.id,
      status: OfferStatus.ACCEPTED,
      quantity: 100,
      unitCode: "unit",
      unitPrice: 1100,
      currency: "NGN",
      totalAmount: 110000,
      fulfillmentMode: FulfillmentMode.TONGRIC_LOGISTICS_REQUEST,
      destinationLocation: "Otukpo Main Grain Market",
      lastActionById: farmerA.id,
      expiresAt: new Date("2026-10-25T18:00:00Z"),
    },
  });

  const completedOrder = await prisma.order.upsert({
    where: { orderCode: "ORD-202610-00050" },
    update: { status: OrderStatus.COMPLETED },
    create: {
      orderCode: "ORD-202610-00050",
      offerId: completedHistoricalOffer.id,
      listingId: yamListing.id,
      farmerId: farmerA.id,
      buyerId: buyer.id,
      transporterId: transporter.id,
      cropCode: "yam",
      quantity: 100,
      unitCode: "unit",
      estimatedWeightKg: 300,
      unitPrice: 1100,
      currency: "NGN",
      totalAmount: 110000,
      fulfillmentMode: FulfillmentMode.TONGRIC_LOGISTICS_REQUEST,
      destinationLocation: "Otukpo Main Grain Market",
      corridorRoute: "Zaki-Biam → Otukpo",
      estimatedFreightFee: 20000,
      waybillNumber: "WB-202610-00431",
      pickupPin: "4190",
      deliveryPin: "7823",
      pickupVerifiedAt: new Date("2026-10-20T10:00:00Z"),
      deliveryVerifiedAt: new Date("2026-10-20T16:00:00Z"),
      status: OrderStatus.COMPLETED,
    },
  });

  // Carrier Review for Transporter
  await prisma.carrierReview.upsert({
    where: {
      orderId_reviewerId: {
        orderId: completedOrder.id,
        reviewerId: buyer.id,
      },
    },
    update: {
      rating: 5,
      comment: "Danladi arrived on time in Otukpo. Produce was well secured with zero bruising.",
    },
    create: {
      orderId: completedOrder.id,
      transporterId: transporter.id,
      reviewerId: buyer.id,
      rating: 5,
      timelinessScore: 5,
      cargoCareScore: 5,
      communicationScore: 5,
      comment: "Danladi arrived on time in Otukpo. Produce was well secured with zero bruising.",
    },
  });

  // 6. Seed Farmer Barter Exchange Demo
  console.log("🤝 [Tongric Seed] Seeding agricultural barter listings & dual-confirmed trade agreement...");
  
  const barterListing = await prisma.exchangeListing.upsert({
    where: { id: "barter-list-001" },
    update: {
      status: ExchangeListingStatus.AGREED,
    },
    create: {
      id: "barter-list-001",
      ownerFarmerId: farmerA.id,
      offeredItemType: "CROP",
      offeredCropId: "yam",
      offeredTitle: "100 Tubers of Zaki-Biam White Yam",
      offeredDescription: "Selected seed-quality and table-ready white yam tubers.",
      offeredQty: 100,
      offeredUnit: "unit",
      desiredDescription: "Seeking 3 Bags of Clean Soybeans (100kg sacks) for feed formulation.",
      desiredQty: 3,
      desiredUnit: "bag",
      locationLga: "Gboko",
      status: ExchangeListingStatus.AGREED,
    },
  });

  const barterOffer = await prisma.exchangeOffer.upsert({
    where: { id: "barter-offer-001" },
    update: {
      status: ExchangeOfferStatus.ACCEPTED,
    },
    create: {
      id: "barter-offer-001",
      listingId: barterListing.id,
      proposerFarmerId: farmerB.id,
      offeredItemDescription: "3 Bags of TGX Clean Soybeans, 100kg each, stored dry in Otukpo.",
      offeredQty: 3,
      offeredUnit: "bag",
      message: "I can meet you halfway at Wannune market junction on Thursday morning for inspection.",
      status: ExchangeOfferStatus.ACCEPTED,
    },
  });

  await prisma.exchangeAgreement.upsert({
    where: { id: "barter-agree-001" },
    update: {
      farmerAConfirmedAt: new Date(Date.now() - 7200000),
      status: ExchangeAgreementStatus.ACTIVE,
    },
    create: {
      id: "barter-agree-001",
      listingId: barterListing.id,
      offerId: barterOffer.id,
      farmerAId: farmerA.id,
      farmerBId: farmerB.id,
      termsSummary: "Swap 100 tubers of White Yam for 3 Bags of Soybeans at Wannune Junction. Non-custodial direct barter exchange.",
      farmerAConfirmedAt: new Date(Date.now() - 7200000),
      status: ExchangeAgreementStatus.ACTIVE,
    },
  });

  // 7. Seed Simple Loan Application Demo
  console.log("📄 [Tongric Seed] Seeding consented credit application demonstration...");
  
  const consentRecord = await prisma.consentRecord.findFirst({
    where: { userId: farmerA.id, consentType: ConsentType.FINANCIAL_DATA_SHARING },
  });

  if (consentRecord) {
    await prisma.loanApplication.upsert({
      where: { referenceCode: "LN-202611-00421" },
      update: {
        status: LoanApplicationStatus.UNDER_PARTNER_REVIEW,
      },
      create: {
        id: "loan-app-001",
        referenceCode: "LN-202611-00421",
        farmerId: farmerA.id,
        productId: "prod-badc-1",
        requestedAmountNgn: 100000,
        purpose: "Procurement of organic fertilizer and weeding labor for dry-season yam ridge preparation.",
        consentRecordId: consentRecord.id,
        transactionSummarySnapshotJson: {
          completedOrdersCount: 2,
          totalSalesVolumeNgn: 350000,
          averageOrderNgn: 175000,
          activeListingsCount: 3,
          kycStatus: "VERIFIED",
          farmerFullName: "Terna Aondover",
          locationLga: "Gboko",
          tenureDays: 45,
          estimatedCreditScore: 75,
          recommendedTier: "Tier 2 (₦150,000 max)",
          generatedAt: new Date().toISOString(),
        },
        documentKeys: ["NATIONAL_ID", "COOPERATIVE_LETTER"],
        status: LoanApplicationStatus.UNDER_PARTNER_REVIEW,
        partnerNote: "BADC Makurdi credit officer verified cooperative endorsement letter. Field verification scheduled.",
      },
    });
  }

  console.log("✅ [Tongric Seed] Benue State Pilot Seeding Completed Successfully!");
  console.log("-------------------------------------------------------------------");
  console.log("Demo Credentials (Password: Password123! for all accounts):");
  console.log("  🌾 Farmer:       08011111111 (Terna Aondover, Gboko - Tiv)");
  console.log("  🛒 Buyer:        08022222222 (Emeka Okonkwo, Makurdi - English)");
  console.log("  🚚 Transporter:  08033333333 (Danladi Ibrahim, Makurdi - Hausa)");
  console.log("  🛡️ Admin:        08099999999 (Oche Idoko, Makurdi - English)");
  console.log("  🌱 Assisted:     08012223344 (Abeje Ochanya, Otukpo - Idoma)");
  console.log("-------------------------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ [Tongric Seed] Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
