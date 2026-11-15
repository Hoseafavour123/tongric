const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const outDir = path.resolve(process.cwd(), 'public/grant-screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const W = 390;
const H = 844;

function frame(tab, mode, title, content) {
  const tabs = [
    { id: 'home', label: 'Home', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { id: 'market', label: 'Market', icon: 'M3 3h18v4H3z M3 7l2 14h14l2-14' },
    { id: 'orders', label: 'Orders', icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2' },
    { id: 'transport', label: 'Transport', icon: 'M1 3h15v13H1z M16 8h4l3 3v5h-7' },
    { id: 'finance', label: 'Finance', icon: 'M3 21h18M3 10h18M5 10v11M19 10v11M12 2l10 5H2z' },
  ];

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-opacity="0.12" />
    </filter>
    <clipPath id="screenClip">
      <rect x="0" y="0" width="${W}" height="${H}" rx="42" />
    </clipPath>
  </defs>

  <!-- Phone Shell -->
  <rect x="0" y="0" width="${W}" height="${H}" rx="42" fill="#ffffff" filter="url(#shadow)" stroke="#cbd5e1" stroke-width="2.5"/>

  <g clip-path="url(#screenClip)">
    <!-- Status Bar -->
    <rect x="0" y="0" width="${W}" height="44" fill="#ffffff"/>
    <text x="34" y="29" font-size="14" font-weight="600" fill="#0f172a">09:41</text>
    <rect x="135" y="10" width="120" height="24" rx="12" fill="#0f172a"/>
    <circle cx="236" cy="22" r="5" fill="#1e293b"/>
    
    <!-- Status Icons -->
    <g transform="translate(320, 18)" fill="#0f172a">
      <rect x="16" y="2" width="22" height="11" rx="3" fill="none" stroke="#0f172a" stroke-width="1.5"/>
      <rect x="18" y="4" width="14" height="7" rx="1.5" fill="#0f172a"/>
      <path d="M39 5.5v4" stroke="#0f172a" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M9 11a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
      <path d="M4.5 7.5a5 5 0 0 1 6 0" stroke="#0f172a" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <rect x="-1" y="9" width="2" height="4" rx="0.5"/>
      <rect x="2" y="6" width="2" height="7" rx="0.5"/>
      <rect x="5" y="3" width="2" height="10" rx="0.5"/>
    </g>

    <!-- Top Header Navigation -->
    <rect x="0" y="44" width="${W}" height="52" fill="#ffffff" stroke="#f1f5f9" stroke-width="1"/>
    <g transform="translate(16, 55)">
      <rect x="0" y="0" width="28" height="28" rx="6" fill="#15803d"/>
      <text x="14" y="20" font-size="15" font-weight="800" fill="#ffffff" text-anchor="middle">T</text>
      <text x="36" y="20" font-size="16" font-weight="700" fill="#0f172a">Tongric</text>
    </g>

    <g transform="translate(202, 55)">
      <!-- Mode Pill -->
      <rect x="0" y="1" width="74" height="26" rx="13" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1"/>
      <rect x="${mode === 'FARMER' ? '2' : '37'}" y="3" width="35" height="22" rx="11" fill="#15803d"/>
      <text x="19" y="18" font-size="10" font-weight="700" fill="${mode === 'FARMER' ? '#ffffff' : '#64748b'}" text-anchor="middle">Farm</text>
      <text x="54" y="18" font-size="10" font-weight="700" fill="${mode === 'BUYER' ? '#ffffff' : '#64748b'}" text-anchor="middle">Buy</text>

      <!-- Language -->
      <rect x="80" y="1" width="48" height="26" rx="6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
      <text x="104" y="18" font-size="10" font-weight="600" fill="#334155" text-anchor="middle">🌐 EN</text>

      <!-- Account -->
      <rect x="134" y="1" width="28" height="26" rx="6" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1"/>
      <text x="148" y="18" font-size="11" font-weight="700" fill="#065f46" text-anchor="middle">T</text>
    </g>

    <!-- Body Content Area -->
    <g transform="translate(0, 96)">
      ${content}
    </g>

    <!-- Bottom Navigation Bar -->
    <g transform="translate(0, 770)">
      <rect x="0" y="0" width="${W}" height="74" fill="#ffffff" stroke="#f1f5f9" stroke-width="1"/>
      ${tabs.map((t, i) => {
        const x = i * 78 + 39;
        const active = t.id === tab;
        const color = active ? '#15803d' : '#64748b';
        return `
          <g transform="translate(${x}, 14)">
            ${active ? `<line x1="-16" y1="-14" x2="16" y2="-14" stroke="#15803d" stroke-width="3" stroke-linecap="round"/>` : ''}
            <path d="${t.icon}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="translate(-10, -2) scale(0.9)"/>
            <text x="0" y="24" font-size="10" font-weight="${active ? '700' : '500'}" fill="${color}" text-anchor="middle">${t.label}</text>
          </g>
        `;
      }).join('')}
      <rect x="125" y="60" width="140" height="4" rx="2" fill="#0f172a"/>
    </g>
  </g>
</svg>`;
}

// -----------------------------------------------------------------------------
// Screen 1: Home (Farmer Perspective)
// -----------------------------------------------------------------------------
const screen01 = frame('home', 'FARMER', 'Home Overview', `
  <!-- Welcome Card -->
  <g transform="translate(16, 16)">
    <rect x="0" y="0" width="358" height="186" rx="12" fill="#ffffff" stroke="#86efac" stroke-width="1.5"/>
    <rect x="14" y="14" width="76" height="22" rx="6" fill="#dcfce7"/>
    <text x="52" y="29" font-size="11" font-weight="700" fill="#15803d" text-anchor="middle">Farmer View</text>

    <rect x="96" y="14" width="94" height="22" rx="6" fill="#f1f5f9"/>
    <text x="143" y="29" font-size="11" font-weight="600" fill="#475569" text-anchor="middle">Benue Pilot: Active</text>

    <text x="14" y="62" font-size="18" font-weight="800" fill="#0f172a">Welcome back, Tersoo!</text>
    <text x="14" y="82" font-size="12" fill="#64748b">Direct produce marketing &amp; logistics for Benue farmers.</text>

    <!-- Primary Action Button -->
    <rect x="14" y="100" width="190" height="42" rx="8" fill="#15803d"/>
    <text x="109" y="126" font-size="13" font-weight="700" fill="#ffffff" text-anchor="middle">+ Sell Produce / List</text>

    <rect x="212" y="100" width="132" height="42" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <text x="278" y="126" font-size="13" font-weight="600" fill="#334155" text-anchor="middle">Marketplace</text>

    <text x="14" y="166" font-size="11" font-weight="600" fill="#64748b">Quick Links: My Farm Profile • Orders &amp; Offers • Verify ID</text>
  </g>

  <!-- Priority Crops Chips -->
  <g transform="translate(16, 218)">
    <rect x="0" y="0" width="358" height="110" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <text x="14" y="24" font-size="13" font-weight="700" fill="#0f172a">Benue Agricultural Priority Produce</text>
    <text x="14" y="40" font-size="11" fill="#64748b">Tap any harvest category to browse active lots</text>

    <!-- Chips -->
    <g transform="translate(14, 52)">
      <rect x="0" y="0" width="60" height="34" rx="8" fill="#f0fdf4" stroke="#86efac" stroke-width="1"/>
      <text x="30" y="21" font-size="11" font-weight="700" fill="#15803d" text-anchor="middle">🥔 Yam</text>

      <rect x="68" y="0" width="112" height="34" rx="8" fill="#fef2f2" stroke="#fca5a5" stroke-width="1"/>
      <text x="124" y="21" font-size="11" font-weight="700" fill="#b91c1c" text-anchor="middle">🍅 Tomatoes (24h)</text>

      <rect x="188" y="0" width="76" height="34" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
      <text x="226" y="21" font-size="11" font-weight="600" fill="#334155" text-anchor="middle">🌾 Rice</text>

      <rect x="272" y="0" width="72" height="34" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
      <text x="308" y="21" font-size="11" font-weight="600" fill="#334155" text-anchor="middle">Cassava</text>
    </g>
  </g>

  <!-- Stepper Journey -->
  <g transform="translate(16, 342)">
    <rect x="0" y="0" width="358" height="160" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <text x="14" y="24" font-size="13" font-weight="700" fill="#0f172a">Commercial Selling Flow</text>

    <!-- Step 1 -->
    <circle cx="26" cy="56" r="12" fill="#15803d"/>
    <text x="26" y="60" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">✓</text>
    <text x="48" y="54" font-size="12" font-weight="700" fill="#0f172a">1. List Your Produce</text>
    <text x="48" y="68" font-size="11" fill="#64748b">Photos, unit price, Benue LGA location, quality grade</text>

    <!-- Step 2 -->
    <circle cx="26" cy="98" r="12" fill="#dcfce7" stroke="#15803d" stroke-width="2"/>
    <text x="26" y="102" font-size="11" font-weight="700" fill="#15803d" text-anchor="middle">2</text>
    <text x="48" y="96" font-size="12" font-weight="700" fill="#0f172a">2. Review Offers &amp; Counter</text>
    <text x="48" y="110" font-size="11" fill="#64748b">Negotiate prices &amp; delivery up to 3 structured rounds</text>

    <!-- Step 3 -->
    <circle cx="26" cy="138" r="12" fill="#f1f5f9"/>
    <text x="26" y="142" font-size="11" font-weight="700" fill="#94a3b8" text-anchor="middle">3</text>
    <text x="48" y="136" font-size="12" font-weight="600" fill="#64748b">3. Deliver &amp; Direct Settle</text>
    <text x="48" y="150" font-size="11" fill="#94a3b8">Farm-gate collection, direct settlement (Section 19)</text>
  </g>

  <!-- Pilot Trust Cards -->
  <g transform="translate(16, 516)">
    <rect x="0" y="0" width="172" height="74" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <text x="12" y="24" font-size="12" font-weight="700" fill="#15803d">📍 23 Benue LGAs</text>
    <text x="12" y="42" font-size="10" fill="#64748b">Makurdi, Gboko, Otukpo, Katsina-Ala, Vandeikya</text>

    <rect x="186" y="0" width="172" height="74" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <text x="198" y="24" font-size="12" font-weight="700" fill="#15803d">⚖️ Grade A/B/C</text>
    <text x="198" y="42" font-size="10" fill="#64748b">Standardized commercial agricultural sorting</text>
  </g>

  <!-- Section 19 Policy -->
  <g transform="translate(16, 602)">
    <rect x="0" y="0" width="358" height="60" rx="10" fill="#fefce8" stroke="#fef08a" stroke-width="1"/>
    <text x="12" y="22" font-size="11" font-weight="700" fill="#854d0e">🛡️ Regulatory Compliance (Section 19)</text>
    <text x="12" y="40" font-size="10" fill="#713f12">Zero platform custody of funds. Direct buyer-farmer settlement.</text>
  </g>
`);

// -----------------------------------------------------------------------------
// Screen 2: Home (Buyer Perspective)
// -----------------------------------------------------------------------------
const screen02 = frame('home', 'BUYER', 'Buyer Sourcing', `
  <!-- Welcome Card Buyer -->
  <g transform="translate(16, 16)">
    <rect x="0" y="0" width="358" height="190" rx="12" fill="#ffffff" stroke="#93c5fd" stroke-width="1.5"/>
    <rect x="14" y="14" width="76" height="22" rx="6" fill="#dbeafe"/>
    <text x="52" y="29" font-size="11" font-weight="700" fill="#1d4ed8" text-anchor="middle">Buyer View</text>

    <rect x="96" y="14" width="94" height="22" rx="6" fill="#f1f5f9"/>
    <text x="143" y="29" font-size="11" font-weight="600" fill="#475569" text-anchor="middle">Direct Sourcing</text>

    <text x="14" y="62" font-size="18" font-weight="800" fill="#0f172a">Commercial Food Sourcing</text>
    <text x="14" y="82" font-size="12" fill="#64748b">Source bulk grains, tubers, and vegetables directly from Benue.</text>

    <!-- Primary Action Button -->
    <rect x="14" y="102" width="200" height="42" rx="8" fill="#15803d"/>
    <text x="114" y="128" font-size="13" font-weight="700" fill="#ffffff" text-anchor="middle">Explore Produce Market →</text>

    <rect x="222" y="102" width="122" height="42" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <text x="283" y="128" font-size="13" font-weight="600" fill="#334155" text-anchor="middle">My Orders</text>

    <text x="14" y="168" font-size="11" font-weight="600" fill="#64748b">Verified Farmers • Quality Graded • Integrated Haulage</text>
  </g>

  <!-- Buyer Filter Highlights -->
  <g transform="translate(16, 222)">
    <rect x="0" y="0" width="358" height="130" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <text x="14" y="24" font-size="13" font-weight="700" fill="#0f172a">Sourcing Categories in Season</text>
    
    <g transform="translate(14, 38)">
      <rect x="0" y="0" width="158" height="38" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
      <text x="12" y="24" font-size="12" font-weight="700" fill="#15803d">🥔 Benue Yam</text>
      <text x="110" y="24" font-size="10" fill="#64748b">Gboko Hub</text>

      <rect x="170" y="0" width="158" height="38" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
      <text x="182" y="24" font-size="12" font-weight="700" fill="#b91c1c">🍅 Roma Tomato</text>
      <text x="288" y="24" font-size="10" fill="#64748b">Perishable</text>
    </g>

    <g transform="translate(14, 82)">
      <rect x="0" y="0" width="158" height="38" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
      <text x="12" y="24" font-size="12" font-weight="700" fill="#15803d">🌾 White Maize</text>
      <text x="110" y="24" font-size="10" fill="#64748b">Otukpo Hub</text>

      <rect x="170" y="0" width="158" height="38" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
      <text x="182" y="24" font-size="12" font-weight="700" fill="#15803d">🌱 Soybeans</text>
      <text x="282" y="24" font-size="10" fill="#64748b">High-protein</text>
    </g>
  </g>

  <!-- Trust Features -->
  <g transform="translate(16, 366)">
    <rect x="0" y="0" width="358" height="150" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <text x="14" y="24" font-size="13" font-weight="700" fill="#0f172a">Buyer Protection &amp; Standards</text>

    <text x="14" y="52" font-size="12" font-weight="700" fill="#15803d">✓ Document-Verified Producers</text>
    <text x="14" y="68" font-size="11" fill="#64748b">Farmers verified with Cooperative Letters &amp; National IDs.</text>

    <text x="14" y="96" font-size="12" font-weight="700" fill="#15803d">✓ 3-Round Structured Counter-Offers</text>
    <text x="14" y="112" font-size="11" fill="#64748b">Negotiate binding unit prices and farm-gate pickup terms.</text>

    <text x="14" y="140" font-size="12" font-weight="700" fill="#15803d">✓ Automatic Expiration Timers</text>
  </g>

  <!-- CTA Box -->
  <g transform="translate(16, 532)">
    <rect x="0" y="0" width="358" height="130" rx="12" fill="#15803d"/>
    <text x="20" y="32" font-size="16" font-weight="800" fill="#ffffff">Start Sourcing Produce</text>
    <text x="20" y="52" font-size="12" fill="#dcfce7">Filter through verified Benue agricultural batches now.</text>

    <rect x="20" y="72" width="318" height="42" rx="8" fill="#ffffff"/>
    <text x="179" y="98" font-size="13" font-weight="700" fill="#15803d" text-anchor="middle">Browse All 18 Batches</text>
  </g>
`);

// -----------------------------------------------------------------------------
// Screen 3: Marketplace Discovery
// -----------------------------------------------------------------------------
const screen03 = frame('market', 'BUYER', 'Produce Marketplace', `
  <g transform="translate(16, 12)">
    <text x="0" y="20" font-size="20" font-weight="800" fill="#0f172a">Produce Market</text>
    <text x="0" y="38" font-size="12" fill="#64748b">Direct agricultural supply from verified Benue farmers</text>
  </g>

  <!-- Structured Filter Chips -->
  <g transform="translate(16, 62)">
    <rect x="0" y="0" width="54" height="30" rx="15" fill="#15803d"/>
    <text x="27" y="19" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">All</text>

    <rect x="60" y="0" width="68" height="30" rx="15" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <text x="94" y="19" font-size="11" font-weight="600" fill="#334155" text-anchor="middle">🥔 Yam</text>

    <rect x="134" y="0" width="94" height="30" rx="15" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <text x="181" y="19" font-size="11" font-weight="600" fill="#334155" text-anchor="middle">🍅 Tomatoes</text>

    <rect x="234" y="0" width="76" height="30" rx="15" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <text x="272" y="19" font-size="11" font-weight="600" fill="#334155" text-anchor="middle">Gboko</text>

    <rect x="316" y="0" width="42" height="30" rx="15" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <text x="337" y="19" font-size="11" font-weight="600" fill="#334155" text-anchor="middle">Gr. A</text>
  </g>

  <!-- Produce Listing Card 1 -->
  <g transform="translate(16, 108)">
    <rect x="0" y="0" width="358" height="172" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    
    <!-- Thumbnail Image Mock -->
    <rect x="12" y="12" width="90" height="90" rx="8" fill="#fef3c7"/>
    <text x="57" y="62" font-size="32" text-anchor="middle">🥔</text>

    <g transform="translate(112, 16)">
      <rect x="0" y="0" width="70" height="18" rx="4" fill="#dcfce7"/>
      <text x="35" y="13" font-size="9" font-weight="700" fill="#15803d" text-anchor="middle">GRADE A</text>

      <rect x="76" y="0" width="90" height="18" rx="4" fill="#f1f5f9"/>
      <text x="121" y="13" font-size="9" font-weight="600" fill="#475569" text-anchor="middle">Gboko, Benue</text>

      <text x="0" y="38" font-size="14" font-weight="800" fill="#0f172a">Fresh Benue Yam Tubers</text>
      <text x="0" y="56" font-size="11" fill="#64748b">Farmer: Tersoo Iorfa ✓ Verified</text>

      <text x="0" y="80" font-size="16" font-weight="800" fill="#15803d">₦45,000 <tspan font-size="11" font-weight="500" fill="#64748b">/ 100kg bag</tspan></text>
      <text x="0" y="96" font-size="10" fill="#64748b">50 bags available (Est. 5,000 kg) • MOQ: 10</text>
    </g>

    <!-- Card Bottom CTA -->
    <line x1="12" y1="120" x2="346" y2="120" stroke="#f1f5f9" stroke-width="1"/>
    <rect x="12" y="130" width="334" height="32" rx="6" fill="#f0fdf4" stroke="#86efac" stroke-width="1"/>
    <text x="179" y="151" font-size="12" font-weight="700" fill="#15803d" text-anchor="middle">View Details &amp; Make Offer →</text>
  </g>

  <!-- Produce Listing Card 2 (Perishable Tomatoes) -->
  <g transform="translate(16, 292)">
    <rect x="0" y="0" width="358" height="172" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    
    <rect x="12" y="12" width="90" height="90" rx="8" fill="#fee2e2"/>
    <text x="57" y="62" font-size="32" text-anchor="middle">🍅</text>

    <g transform="translate(112, 16)">
      <rect x="0" y="0" width="70" height="18" rx="4" fill="#fee2e2"/>
      <text x="35" y="13" font-size="9" font-weight="700" fill="#b91c1c" text-anchor="middle">PERISHABLE</text>

      <rect x="76" y="0" width="86" height="18" rx="4" fill="#f1f5f9"/>
      <text x="119" y="13" font-size="9" font-weight="600" fill="#475569" text-anchor="middle">Makurdi LGA</text>

      <text x="0" y="38" font-size="14" font-weight="800" fill="#0f172a">Roma Tomatoes (Harvest Ready)</text>
      <text x="0" y="56" font-size="11" fill="#64748b">Farmer: Ngodoo Agbo ✓ Verified</text>

      <text x="0" y="80" font-size="16" font-weight="800" fill="#15803d">₦18,500 <tspan font-size="11" font-weight="500" fill="#64748b">/ 50kg crate</tspan></text>
      <text x="0" y="96" font-size="10" fill="#64748b">120 crates available • 24h Offer Expiry</text>
    </g>

    <line x1="12" y1="120" x2="346" y2="120" stroke="#f1f5f9" stroke-width="1"/>
    <rect x="12" y="130" width="334" height="32" rx="6" fill="#f0fdf4" stroke="#86efac" stroke-width="1"/>
    <text x="179" y="151" font-size="12" font-weight="700" fill="#15803d" text-anchor="middle">View Details &amp; Make Offer →</text>
  </g>

  <!-- Produce Listing Card 3 (Maize Grains) -->
  <g transform="translate(16, 476)">
    <rect x="0" y="0" width="358" height="172" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="12" y="12" width="90" height="90" rx="8" fill="#fef9c3"/>
    <text x="57" y="62" font-size="32" text-anchor="middle">🌽</text>

    <g transform="translate(112, 16)">
      <rect x="0" y="0" width="70" height="18" rx="4" fill="#fef3c7"/>
      <text x="35" y="13" font-size="9" font-weight="700" fill="#b45309" text-anchor="middle">GRADE B</text>

      <rect x="76" y="0" width="86" height="18" rx="4" fill="#f1f5f9"/>
      <text x="119" y="13" font-size="9" font-weight="600" fill="#475569" text-anchor="middle">Otukpo LGA</text>

      <text x="0" y="38" font-size="14" font-weight="800" fill="#0f172a">Dry White Grain Maize</text>
      <text x="0" y="56" font-size="11" fill="#64748b">Producer: Idoma Agro Allied</text>

      <text x="0" y="80" font-size="16" font-weight="800" fill="#15803d">₦32,000 <tspan font-size="11" font-weight="500" fill="#64748b">/ 100kg bag</tspan></text>
      <text x="0" y="96" font-size="10" fill="#64748b">80 bags available • Moisture Tested</text>
    </g>

    <line x1="12" y1="120" x2="346" y2="120" stroke="#f1f5f9" stroke-width="1"/>
    <rect x="12" y="130" width="334" height="32" rx="6" fill="#f0fdf4" stroke="#86efac" stroke-width="1"/>
    <text x="179" y="151" font-size="12" font-weight="700" fill="#15803d" text-anchor="middle">View Details &amp; Make Offer →</text>
  </g>
`);

// -----------------------------------------------------------------------------
// Screen 4: Listing Detail View (/market/[id])
// -----------------------------------------------------------------------------
const screen04 = frame('market', 'BUYER', 'Listing Detail', `
  <g transform="translate(16, 10)">
    <text x="0" y="16" font-size="12" font-weight="700" fill="#15803d">← Back to Market</text>
  </g>

  <!-- Large Image Carousel Preview -->
  <g transform="translate(16, 36)">
    <rect x="0" y="0" width="358" height="150" rx="12" fill="#fef3c7"/>
    <text x="179" y="88" font-size="54" text-anchor="middle">🥔</text>
    <rect x="14" y="14" width="94" height="22" rx="6" fill="#15803d"/>
    <text x="61" y="29" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">AVAILABLE NOW</text>
    <text x="320" y="136" font-size="11" font-weight="700" fill="#78350f">📷 1 / 3</text>
  </g>

  <!-- Title & Pricing Card -->
  <g transform="translate(16, 196)">
    <rect x="0" y="0" width="358" height="186" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <text x="14" y="28" font-size="17" font-weight="800" fill="#0f172a">Fresh Benue Yam Tubers</text>
    <text x="14" y="46" font-size="12" fill="#64748b">Harvested from Mbaakon Community, Gboko LGA</text>

    <text x="14" y="78" font-size="22" font-weight="800" fill="#15803d">₦45,000 <tspan font-size="13" font-weight="500" fill="#64748b">/ 100kg bag</tspan></text>
    <text x="14" y="96" font-size="11" fill="#475569">Total Lot Value: ₦2,250,000 (50 bags)</text>

    <!-- Specs Grid -->
    <g transform="translate(14, 110)">
      <rect x="0" y="0" width="102" height="60" rx="8" fill="#f8fafc"/>
      <text x="10" y="22" font-size="10" fill="#64748b">Grade</text>
      <text x="10" y="44" font-size="13" font-weight="800" fill="#15803d">Grade A</text>

      <rect x="114" y="0" width="102" height="60" rx="8" fill="#f8fafc"/>
      <text x="10" y="22" font-size="10" fill="#64748b">Total Weight</text>
      <text x="10" y="44" font-size="13" font-weight="800" fill="#0f172a">5,000 kg</text>

      <rect x="228" y="0" width="102" height="60" rx="8" fill="#f8fafc"/>
      <text x="10" y="22" font-size="10" fill="#64748b">Min. Order</text>
      <text x="10" y="44" font-size="13" font-weight="800" fill="#0f172a">10 bags</text>
    </g>
  </g>

  <!-- Verified Producer Card -->
  <g transform="translate(16, 392)">
    <rect x="0" y="0" width="358" height="96" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <circle cx="34" cy="48" r="20" fill="#ecfdf5"/>
    <text x="34" y="54" font-size="14" font-weight="800" fill="#065f46" text-anchor="middle">TI</text>

    <text x="64" y="38" font-size="14" font-weight="800" fill="#0f172a">Tersoo Iorfa</text>
    <rect x="156" y="25" width="84" height="18" rx="4" fill="#dcfce7"/>
    <text x="198" y="38" font-size="9" font-weight="700" fill="#15803d" text-anchor="middle">✓ VERIFIED</text>
    <text x="64" y="56" font-size="11" fill="#64748b">Mbaakon Farmers Cooperative Federation</text>
    <text x="64" y="72" font-size="11" fill="#15803d">Farm-gate collection in Gboko LGA</text>
  </g>

  <!-- Dual Action Bottom CTAs -->
  <g transform="translate(16, 498)">
    <rect x="0" y="0" width="168" height="48" rx="8" fill="#ffffff" stroke="#15803d" stroke-width="1.5"/>
    <text x="84" y="29" font-size="13" font-weight="700" fill="#15803d" text-anchor="middle">📞 Call Farmer</text>

    <rect x="178" y="0" width="180" height="48" rx="8" fill="#15803d"/>
    <text x="268" y="29" font-size="13" font-weight="700" fill="#ffffff" text-anchor="middle">Make Offer / Buy →</text>
  </g>

  <!-- Payment Disclaimer -->
  <g transform="translate(16, 560)">
    <rect x="0" y="0" width="358" height="84" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
    <text x="12" y="22" font-size="11" font-weight="700" fill="#334155">Section 19 Commercial Agreement Notice</text>
    <text x="12" y="40" font-size="10" fill="#64748b">Submitting an offer creates a transparent commercial contract.</text>
    <text x="12" y="56" font-size="10" fill="#64748b">Payment is settled directly with farmer upon produce inspection.</text>
    <text x="12" y="72" font-size="10" fill="#15803d">Zero platform custody • Immutable negotiation trail</text>
  </g>
`);

// -----------------------------------------------------------------------------
// Screen 5: Create Listing Form (/market/create)
// -----------------------------------------------------------------------------
const screen05 = frame('market', 'FARMER', 'Publish Produce', `
  <g transform="translate(16, 12)">
    <text x="0" y="20" font-size="18" font-weight="800" fill="#0f172a">Sell Produce / New Listing</text>
    <text x="0" y="38" font-size="12" fill="#64748b">List harvested agricultural produce for verified buyers</text>
  </g>

  <g transform="translate(16, 56)">
    <rect x="0" y="0" width="358" height="600" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>

    <!-- Crop Select -->
    <text x="14" y="28" font-size="11" font-weight="700" fill="#334155">CROP CATEGORY</text>
    <rect x="14" y="36" width="330" height="38" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <text x="26" y="60" font-size="13" font-weight="600" fill="#0f172a">🥔 Yam (Tubers)</text>

    <!-- Location -->
    <text x="14" y="98" font-size="11" font-weight="700" fill="#334155">FARM LOCATION (BENUE LGA)</text>
    <rect x="14" y="106" width="330" height="38" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <text x="26" y="130" font-size="13" font-weight="600" fill="#0f172a">Gboko LGA • Mbaakon Village</text>

    <!-- Grade Selection -->
    <text x="14" y="168" font-size="11" font-weight="700" fill="#334155">QUALITY GRADE</text>
    <g transform="translate(14, 176)">
      <rect x="0" y="0" width="104" height="34" rx="6" fill="#15803d"/>
      <text x="52" y="21" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">✓ Grade A</text>

      <rect x="113" y="0" width="104" height="34" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
      <text x="165" y="21" font-size="11" font-weight="600" fill="#334155" text-anchor="middle">Grade B</text>

      <rect x="226" y="0" width="104" height="34" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
      <text x="278" y="21" font-size="11" font-weight="600" fill="#334155" text-anchor="middle">Grade C</text>
    </g>

    <!-- Quantity & Unit -->
    <text x="14" y="238" font-size="11" font-weight="700" fill="#334155">QUANTITY &amp; PACKAGING UNIT</text>
    <rect x="14" y="246" width="158" height="38" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <text x="26" y="270" font-size="13" font-weight="600" fill="#0f172a">50</text>
    <rect x="186" y="246" width="158" height="38" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <text x="198" y="270" font-size="13" font-weight="600" fill="#0f172a">100kg bag</text>

    <!-- Price -->
    <text x="14" y="308" font-size="11" font-weight="700" fill="#334155">UNIT PRICE (₦ NAIRA)</text>
    <rect x="14" y="316" width="330" height="38" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <text x="26" y="340" font-size="13" font-weight="700" fill="#15803d">₦ 45,000</text>

    <!-- Compressed Photo Box -->
    <text x="14" y="378" font-size="11" font-weight="700" fill="#334155">HARVEST PHOTOS (CANVAS AUTO-COMPRESSED)</text>
    <rect x="14" y="386" width="330" height="72" rx="6" fill="#f0fdf4" stroke="#86efac" stroke-width="1.5" stroke-dasharray="4 4"/>
    <text x="179" y="416" font-size="12" font-weight="700" fill="#15803d" text-anchor="middle">📷 yam_batch_01.webp (184 KB)</text>
    <text x="179" y="436" font-size="10" fill="#065f46" text-anchor="middle">Compressed from 3.2MB • Low-Data Budget Compliant</text>

    <!-- Submit Button -->
    <rect x="14" y="480" width="330" height="46" rx="8" fill="#15803d"/>
    <text x="179" y="508" font-size="14" font-weight="700" fill="#ffffff" text-anchor="middle">Publish Produce Listing</text>

    <text x="179" y="546" font-size="10" fill="#64748b" text-anchor="middle">Visible immediately across 4 languages (EN, Tiv, Idoma, Hausa)</text>
  </g>
`);

// -----------------------------------------------------------------------------
// Screen 6: Offer Negotiation Thread (/orders/offers/[id])
// -----------------------------------------------------------------------------
const screen06 = frame('orders', 'FARMER', 'Commercial Offer Thread', `
  <g transform="translate(16, 10)">
    <text x="0" y="16" font-size="12" font-weight="700" fill="#15803d">← All Offers</text>
    <text x="0" y="38" font-size="18" font-weight="800" fill="#0f172a">Purchase Negotiation #OFF-921</text>
    <text x="0" y="54" font-size="11" fill="#64748b">Buyer: Kano Processing Mills Ltd • Fresh Benue Yam Tubers</text>
  </g>

  <!-- Expiry & Ceilings Alert -->
  <g transform="translate(16, 72)">
    <rect x="0" y="0" width="358" height="52" rx="8" fill="#fefce8" stroke="#fef08a" stroke-width="1"/>
    <text x="12" y="22" font-size="11" font-weight="700" fill="#854d0e">⏱ Expiry: 21h 30m remaining (24h perishable rule)</text>
    <text x="12" y="38" font-size="10" fill="#713f12">Negotiation Round: 2 of 3 (Structured counter ceiling DEC-031)</text>
  </g>

  <!-- Negotiation Message Trail -->
  <g transform="translate(16, 134)">
    <!-- Buyer Initial Offer -->
    <rect x="0" y="0" width="300" height="106" rx="10" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
    <text x="12" y="20" font-size="10" font-weight="700" fill="#475569">Kano Processing Mills (Buyer) • Round 1</text>
    <text x="12" y="38" font-size="12" font-weight="800" fill="#0f172a">Offered: 20 bags @ ₦42,000 / bag</text>
    <text x="12" y="56" font-size="11" fill="#15803d">Total: ₦840,000</text>
    <text x="12" y="74" font-size="10" fill="#64748b">Fulfillment: Buyer Arranges Farm-Gate Pickup</text>
    <text x="12" y="90" font-size="10" fill="#64748b">Note: We can collect with our truck on Thursday.</text>

    <!-- Farmer Counter -->
    <g transform="translate(58, 116)">
      <rect x="0" y="0" width="300" height="106" rx="10" fill="#f0fdf4" stroke="#86efac" stroke-width="1"/>
      <text x="12" y="20" font-size="10" font-weight="700" fill="#15803d">You (Farmer Counter-Offer) • Round 2</text>
      <text x="12" y="38" font-size="12" font-weight="800" fill="#065f46">Countered: 20 bags @ ₦43,500 / bag</text>
      <text x="12" y="56" font-size="11" font-weight="700" fill="#15803d">Total: ₦870,000</text>
      <text x="12" y="74" font-size="10" fill="#065f46">Terms: Grade A selected tubers ready at Gboko farm</text>
      <text x="12" y="90" font-size="10" fill="#065f46">Status: Waiting for Buyer acceptance or final counter</text>
    </g>
  </g>

  <!-- Action Controls -->
  <g transform="translate(16, 370)">
    <rect x="0" y="0" width="358" height="180" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <text x="14" y="24" font-size="12" font-weight="700" fill="#0f172a">Action Required / Response Bar</text>
    
    <rect x="14" y="40" width="330" height="42" rx="8" fill="#15803d"/>
    <text x="179" y="66" font-size="13" font-weight="700" fill="#ffffff" text-anchor="middle">Accept Terms (₦870,000)</text>

    <rect x="14" y="90" width="330" height="42" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <text x="179" y="116" font-size="13" font-weight="700" fill="#334155" text-anchor="middle">Submit Final Counter-Offer (Round 3)</text>

    <rect x="14" y="140" width="330" height="32" rx="6" fill="#fef2f2"/>
    <text x="179" y="160" font-size="11" font-weight="700" fill="#b91c1c" text-anchor="middle">Decline Offer &amp; Release Listing Quantity</text>
  </g>
`);

// -----------------------------------------------------------------------------
// Screen 7: Orders List (/orders)
// -----------------------------------------------------------------------------
const screen07 = frame('orders', 'FARMER', 'Orders Management', `
  <g transform="translate(16, 12)">
    <text x="0" y="20" font-size="20" font-weight="800" fill="#0f172a">Orders &amp; Negotiations</text>
    <text x="0" y="38" font-size="12" fill="#64748b">Active commercial contracts and trade settlements</text>
  </g>

  <!-- Tab Bar -->
  <g transform="translate(16, 56)">
    <rect x="0" y="0" width="130" height="36" rx="8" fill="#15803d"/>
    <text x="65" y="22" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">Confirmed (2)</text>

    <rect x="136" y="0" width="130" height="36" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <text x="201" y="22" font-size="11" font-weight="600" fill="#475569" text-anchor="middle">Negotiations (1)</text>

    <rect x="272" y="0" width="86" height="36" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <text x="315" y="22" font-size="11" font-weight="600" fill="#475569" text-anchor="middle">Past (4)</text>
  </g>

  <!-- Order Card 1 -->
  <g transform="translate(16, 106)">
    <rect x="0" y="0" width="358" height="178" rx="12" fill="#ffffff" stroke="#86efac" stroke-width="1.5"/>
    <rect x="14" y="14" width="138" height="22" rx="4" fill="#f0fdf4"/>
    <text x="83" y="29" font-size="10" font-weight="700" fill="#15803d" text-anchor="middle">ORD-202611-73921</text>

    <rect x="250" y="14" width="94" height="22" rx="4" fill="#dcfce7"/>
    <text x="297" y="29" font-size="10" font-weight="800" fill="#15803d" text-anchor="middle">CONFIRMED</text>

    <text x="14" y="60" font-size="15" font-weight="800" fill="#0f172a">Fresh Benue Yam Tubers (20 bags)</text>
    <text x="14" y="78" font-size="11" fill="#64748b">Buyer: Kano Processing Mills Ltd (0803 123 4567)</text>

    <text x="14" y="104" font-size="17" font-weight="800" fill="#15803d">₦870,000 <tspan font-size="11" font-weight="500" fill="#64748b">(₦43,500 / bag)</tspan></text>
    <text x="14" y="122" font-size="11" fill="#475569">Fulfillment: Buyer Self-Pickup at Gboko Farm-Gate</text>

    <line x1="14" y1="134" x2="344" y2="134" stroke="#f1f5f9" stroke-width="1"/>
    <rect x="14" y="142" width="330" height="26" rx="4" fill="#f8fafc"/>
    <text x="179" y="159" font-size="11" font-weight="700" fill="#15803d" text-anchor="middle">Track Milestones &amp; Pickup Details →</text>
  </g>

  <!-- Order Card 2 -->
  <g transform="translate(16, 298)">
    <rect x="0" y="0" width="358" height="178" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="14" y="14" width="138" height="22" rx="4" fill="#f8fafc"/>
    <text x="83" y="29" font-size="10" font-weight="700" fill="#475569" text-anchor="middle">ORD-202611-64810</text>

    <rect x="250" y="14" width="94" height="22" rx="4" fill="#e0f2fe"/>
    <text x="297" y="29" font-size="10" font-weight="800" fill="#0369a1" text-anchor="middle">COLLECTED</text>

    <text x="14" y="60" font-size="15" font-weight="800" fill="#0f172a">Roma Tomatoes (50 crates)</text>
    <text x="14" y="78" font-size="11" fill="#64748b">Buyer: Abuja Supermarket Chain</text>

    <text x="14" y="104" font-size="17" font-weight="800" fill="#15803d">₦925,000 <tspan font-size="11" font-weight="500" fill="#64748b">(₦18,500 / crate)</tspan></text>
    <text x="14" y="122" font-size="11" fill="#475569">Fulfillment: Tongric Carrier Haulage</text>

    <line x1="14" y1="134" x2="344" y2="134" stroke="#f1f5f9" stroke-width="1"/>
    <rect x="14" y="142" width="330" height="26" rx="4" fill="#f8fafc"/>
    <text x="179" y="159" font-size="11" font-weight="700" fill="#0369a1" text-anchor="middle">View Haulage Progress →</text>
  </g>
`);

// -----------------------------------------------------------------------------
// Screen 8: Order Detail & Milestone Tracking (/orders/[id])
// -----------------------------------------------------------------------------
const screen08 = frame('orders', 'FARMER', 'Milestone Tracking', `
  <g transform="translate(16, 10)">
    <text x="0" y="16" font-size="12" font-weight="700" fill="#15803d">← All Orders</text>
    <text x="0" y="38" font-size="18" font-weight="800" fill="#0f172a">Order #ORD-202611-73921</text>
    <text x="0" y="54" font-size="11" fill="#64748b">Confirmed on Nov 15, 2026 • Crockford Verifiable</text>
  </g>

  <!-- Milestone Stepper Card -->
  <g transform="translate(16, 70)">
    <rect x="0" y="0" width="358" height="190" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <text x="14" y="24" font-size="13" font-weight="700" fill="#0f172a">Order Progress Milestones</text>

    <!-- Milestone 1 -->
    <circle cx="28" cy="54" r="10" fill="#15803d"/>
    <text x="28" y="58" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">✓</text>
    <text x="50" y="52" font-size="12" font-weight="700" fill="#0f172a">1. Order Confirmed</text>
    <text x="50" y="66" font-size="10" fill="#64748b">Nov 15, 14:30 • Offer accepted and inventory decremented</text>

    <!-- Milestone 2 -->
    <circle cx="28" cy="94" r="10" fill="#dcfce7" stroke="#15803d" stroke-width="2"/>
    <text x="28" y="98" font-size="10" font-weight="700" fill="#15803d" text-anchor="middle">2</text>
    <text x="50" y="92" font-size="12" font-weight="700" fill="#0f172a">2. Produce Collected</text>
    <text x="50" y="106" font-size="10" fill="#64748b">Farm-gate handover in Gboko LGA</text>

    <!-- Milestone 3 -->
    <circle cx="28" cy="134" r="10" fill="#f1f5f9"/>
    <text x="28" y="138" font-size="10" font-weight="700" fill="#94a3b8" text-anchor="middle">3</text>
    <text x="50" y="132" font-size="12" font-weight="600" fill="#64748b">3. Delivered</text>
    <text x="50" y="146" font-size="10" fill="#94a3b8">Arrival at buyer destination</text>

    <!-- Milestone 4 -->
    <circle cx="28" cy="170" r="10" fill="#f1f5f9"/>
    <text x="28" y="174" font-size="10" font-weight="700" fill="#94a3b8" text-anchor="middle">4</text>
    <text x="50" y="168" font-size="12" font-weight="600" fill="#64748b">4. Completed</text>
  </g>

  <!-- Participant Coordination Box -->
  <g transform="translate(16, 272)">
    <rect x="0" y="0" width="358" height="110" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <text x="14" y="24" font-size="13" font-weight="700" fill="#0f172a">Direct Buyer Coordination</text>
    <text x="14" y="44" font-size="12" fill="#475569">Kano Processing Mills Ltd</text>
    <text x="14" y="60" font-size="12" font-weight="700" fill="#15803d">📞 0803 123 4567</text>

    <rect x="14" y="70" width="330" height="28" rx="6" fill="#f0fdf4" stroke="#86efac" stroke-width="1"/>
    <text x="179" y="88" font-size="11" font-weight="700" fill="#15803d" text-anchor="middle">Tap to Call Buyer for Pickup Coordination</text>
  </g>

  <!-- Milestone Actions -->
  <g transform="translate(16, 394)">
    <rect x="0" y="0" width="358" height="136" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <text x="14" y="24" font-size="12" font-weight="700" fill="#0f172a">Order Action Toolbar</text>

    <rect x="14" y="38" width="330" height="42" rx="8" fill="#15803d"/>
    <text x="179" y="64" font-size="13" font-weight="700" fill="#ffffff" text-anchor="middle">Mark as Collected at Farm</text>

    <rect x="14" y="88" width="160" height="36" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <text x="94" y="111" font-size="11" font-weight="600" fill="#475569" text-anchor="middle">Cancel Order</text>

    <rect x="184" y="88" width="160" height="36" rx="6" fill="#fef2f2" stroke="#fca5a5" stroke-width="1"/>
    <text x="264" y="111" font-size="11" font-weight="700" fill="#b91c1c" text-anchor="middle">Report Dispute</text>
  </g>

  <!-- Section 19 Notice -->
  <g transform="translate(16, 542)">
    <rect x="0" y="0" width="358" height="66" rx="8" fill="#fefce8" stroke="#fef08a" stroke-width="1"/>
    <text x="12" y="22" font-size="11" font-weight="700" fill="#854d0e">Section 19 Payment Policy Disclosure</text>
    <text x="12" y="40" font-size="10" fill="#713f12">Direct settlement between Buyer and Farmer. Zero platform fund custody.</text>
    <text x="12" y="54" font-size="10" fill="#713f12">Total Agreed Amount: ₦870,000</text>
  </g>
`);

// -----------------------------------------------------------------------------
// Screen 9: Farmer Profile & Location (/profile)
// -----------------------------------------------------------------------------
const screen09 = frame('home', 'FARMER', 'Farm Profile', `
  <g transform="translate(16, 12)">
    <text x="0" y="20" font-size="18" font-weight="800" fill="#0f172a">Farmer Profile &amp; Location</text>
    <text x="0" y="38" font-size="12" fill="#64748b">Verified farm credentials across Benue State LGAs</text>
  </g>

  <g transform="translate(16, 56)">
    <rect x="0" y="0" width="358" height="580" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>

    <!-- Verification Badge Header -->
    <rect x="14" y="14" width="330" height="42" rx="8" fill="#fefce8" stroke="#fef08a" stroke-width="1"/>
    <text x="26" y="38" font-size="12" font-weight="700" fill="#854d0e">Status: PENDING ADMIN REVIEW ⏳</text>

    <!-- State & LGA -->
    <text x="14" y="82" font-size="11" font-weight="700" fill="#334155">STATE</text>
    <rect x="14" y="90" width="330" height="38" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <text x="26" y="114" font-size="13" font-weight="600" fill="#0f172a">Benue State</text>

    <text x="14" y="148" font-size="11" font-weight="700" fill="#334155">LOCAL GOVERNMENT AREA (LGA)</text>
    <rect x="14" y="156" width="330" height="38" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <text x="26" y="180" font-size="13" font-weight="600" fill="#0f172a">Gboko LGA</text>

    <text x="14" y="214" font-size="11" font-weight="700" fill="#334155">COMMUNITY / VILLAGE</text>
    <rect x="14" y="222" width="330" height="38" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <text x="26" y="246" font-size="13" font-weight="600" fill="#0f172a">Mbaakon Community</text>

    <!-- Primary Crops -->
    <text x="14" y="280" font-size="11" font-weight="700" fill="#334155">PRIMARY CROPS FARMED</text>
    <rect x="14" y="288" width="330" height="38" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <text x="26" y="312" font-size="13" font-weight="600" fill="#0f172a">Yam, White Maize, Soybeans</text>

    <!-- Cooperative -->
    <text x="14" y="346" font-size="11" font-weight="700" fill="#334155">COOPERATIVE / ASSOCIATION</text>
    <rect x="14" y="354" width="330" height="38" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <text x="26" y="378" font-size="13" font-weight="600" fill="#0f172a">Mbaakon Farmers Cooperative Federation</text>

    <!-- Farm Size -->
    <text x="14" y="412" font-size="11" font-weight="700" fill="#334155">ESTIMATED FARM SIZE (HECTARES)</text>
    <rect x="14" y="420" width="330" height="38" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <text x="26" y="444" font-size="13" font-weight="600" fill="#0f172a">4.5 Hectares</text>

    <!-- Save Button -->
    <rect x="14" y="482" width="330" height="44" rx="8" fill="#15803d"/>
    <text x="179" y="509" font-size="14" font-weight="700" fill="#ffffff" text-anchor="middle">Save Farm Profile</text>
  </g>
`);

// -----------------------------------------------------------------------------
// Screen 10: KYC Verification Document Upload (/profile/verify)
// -----------------------------------------------------------------------------
const screen10 = frame('home', 'FARMER', 'Document Verification', `
  <g transform="translate(16, 12)">
    <text x="0" y="20" font-size="18" font-weight="800" fill="#0f172a">Identity &amp; KYC Verification</text>
    <text x="0" y="38" font-size="12" fill="#64748b">Verified badge unlocks wholesale buyers and haulage</text>
  </g>

  <g transform="translate(16, 56)">
    <rect x="0" y="0" width="358" height="580" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>

    <!-- NDPA Compliance Alert -->
    <rect x="14" y="14" width="330" height="66" rx="8" fill="#f0fdf4" stroke="#86efac" stroke-width="1"/>
    <text x="24" y="32" font-size="11" font-weight="700" fill="#15803d">🔒 NDPA 2023 Compliant Storage</text>
    <text x="24" y="50" font-size="10" fill="#166534">Your identity documents are securely encrypted in private cloud storage.</text>
    <text x="24" y="66" font-size="10" fill="#166534">Only authorized Tongric administrators can view them.</text>

    <!-- Document Type -->
    <text x="14" y="106" font-size="11" font-weight="700" fill="#334155">DOCUMENT TYPE</text>
    <rect x="14" y="114" width="330" height="38" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <text x="26" y="138" font-size="13" font-weight="600" fill="#0f172a">Voter&apos;s Card / National ID (NIN)</text>

    <!-- Document Number -->
    <text x="14" y="172" font-size="11" font-weight="700" fill="#334155">DOCUMENT IDENTIFIER NUMBER</text>
    <rect x="14" y="180" width="330" height="38" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <text x="26" y="204" font-size="13" font-weight="600" fill="#0f172a">VIN-908234-XXXX</text>

    <!-- File Attachment Box -->
    <text x="14" y="238" font-size="11" font-weight="700" fill="#334155">ATTACH DOCUMENT (IMAGE OR PDF)</text>
    <rect x="14" y="246" width="330" height="110" rx="8" fill="#f8fafc" stroke="#15803d" stroke-width="1.5" stroke-dasharray="4 4"/>
    <text x="179" y="286" font-size="28" text-anchor="middle">📄</text>
    <text x="179" y="312" font-size="12" font-weight="700" fill="#15803d" text-anchor="middle">voters_card_tersoo.webp</text>
    <text x="179" y="332" font-size="10" fill="#64748b" text-anchor="middle">142 KB • Client Canvas Compressed • Validated</text>

    <!-- Accepted Types -->
    <text x="14" y="380" font-size="10" fill="#64748b">Accepted: National ID, Voter&apos;s Card, Cooperative Letter, CAC</text>

    <!-- Submit Button -->
    <rect x="14" y="416" width="330" height="44" rx="8" fill="#15803d"/>
    <text x="179" y="443" font-size="14" font-weight="700" fill="#ffffff" text-anchor="middle">Submit for Verification</text>

    <text x="179" y="484" font-size="11" font-weight="600" fill="#854d0e" text-anchor="middle">Status: PENDING REVIEW (Queue #4)</text>
  </g>
`);

// -----------------------------------------------------------------------------
// Screen 11: Admin Verification Queue (/admin/verifications)
// -----------------------------------------------------------------------------
const screen11 = frame('home', 'FARMER', 'Admin Review Queue', `
  <g transform="translate(16, 12)">
    <text x="0" y="20" font-size="18" font-weight="800" fill="#0f172a">Admin Verification Queue</text>
    <text x="0" y="38" font-size="12" fill="#64748b">Administrative compliance &amp; participant verification</text>
  </g>

  <!-- Filter Tabs -->
  <g transform="translate(16, 56)">
    <rect x="0" y="0" width="94" height="32" rx="6" fill="#15803d"/>
    <text x="47" y="20" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">Pending (1)</text>

    <rect x="102" y="0" width="76" height="32" rx="6" fill="#f1f5f9"/>
    <text x="140" y="20" font-size="11" font-weight="600" fill="#475569" text-anchor="middle">All (4)</text>

    <rect x="186" y="0" width="86" height="32" rx="6" fill="#f1f5f9"/>
    <text x="229" y="20" font-size="11" font-weight="600" fill="#475569" text-anchor="middle">Verified (2)</text>

    <rect x="280" y="0" width="78" height="32" rx="6" fill="#f1f5f9"/>
    <text x="319" y="20" font-size="11" font-weight="600" fill="#475569" text-anchor="middle">Rejected</text>
  </g>

  <!-- Pending Review Submission Card -->
  <g transform="translate(16, 102)">
    <rect x="0" y="0" width="358" height="236" rx="12" fill="#ffffff" stroke="#86efac" stroke-width="1.5"/>

    <g transform="translate(14, 16)">
      <text x="0" y="16" font-size="15" font-weight="800" fill="#0f172a">Tersoo Iorfa</text>
      <text x="0" y="34" font-size="11" fill="#64748b">0803 123 4567 • Mbaakon, Gboko LGA</text>

      <rect x="238" y="0" width="92" height="22" rx="4" fill="#fefce8"/>
      <text x="284" y="15" font-size="10" font-weight="800" fill="#854d0e" text-anchor="middle">PENDING</text>
      <rect x="238" y="26" width="92" height="18" rx="4" fill="#f1f5f9"/>
      <text x="284" y="39" font-size="9" font-weight="700" fill="#475569" text-anchor="middle">FARMER</text>

      <!-- Document Data -->
      <line x1="0" y1="52" x2="330" y2="52" stroke="#f1f5f9" stroke-width="1"/>
      <text x="0" y="72" font-size="11" font-weight="700" fill="#334155">Document: Voter&apos;s Card / National ID</text>
      <text x="0" y="90" font-size="11" fill="#475569">ID Number: VIN-908234-XXXX</text>
      <text x="0" y="108" font-size="11" fill="#64748b">Submitted: Nov 15, 2026 • 142 KB WebP</text>

      <!-- Secure Preview Link -->
      <rect x="0" y="122" width="330" height="30" rx="6" fill="#f0fdf4" stroke="#86efac" stroke-width="1"/>
      <text x="165" y="142" font-size="11" font-weight="700" fill="#15803d" text-anchor="middle">🔍 View Encrypted Document In-Browser</text>

      <!-- Actions -->
      <g transform="translate(0, 164)">
        <rect x="0" y="0" width="160" height="40" rx="6" fill="#15803d"/>
        <text x="80" y="25" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">✓ Approve &amp; Verify</text>

        <rect x="170" y="0" width="160" height="40" rx="6" fill="#fee2e2" stroke="#fca5a5" stroke-width="1"/>
        <text x="250" y="25" font-size="12" font-weight="700" fill="#b91c1c" text-anchor="middle">✕ Reject</text>
      </g>
    </g>
  </g>

  <!-- Audit Trail Box -->
  <g transform="translate(16, 354)">
    <rect x="0" y="0" width="358" height="90" rx="10" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
    <text x="14" y="22" font-size="11" font-weight="700" fill="#0f172a">Audit &amp; Governance Trail</text>
    <text x="14" y="40" font-size="10" fill="#64748b">Every approval/rejection decision writes an immutable AuditLog</text>
    <text x="14" y="56" font-size="10" fill="#64748b">event capturing Operator ID, IP address, decision reason, and timestamp.</text>
    <text x="14" y="74" font-size="10" fill="#15803d">NDPA 2023 Compliant • Role-Guarded</text>
  </g>
`);

// -----------------------------------------------------------------------------
// Screen 12: Logistics & Transport Hub (/transport)
// -----------------------------------------------------------------------------
const screen12 = frame('transport', 'FARMER', 'Logistics Hub', `
  <g transform="translate(16, 12)">
    <text x="0" y="20" font-size="18" font-weight="800" fill="#0f172a">Logistics &amp; Transport Hub</text>
    <text x="0" y="38" font-size="12" fill="#64748b">Farm-gate produce haulage &amp; Benue transit corridors</text>
  </g>

  <!-- Transporter Fleet Card -->
  <g transform="translate(16, 56)">
    <rect x="0" y="0" width="358" height="180" rx="12" fill="#ffffff" stroke="#86efac" stroke-width="1.5"/>
    <rect x="14" y="14" width="144" height="22" rx="4" fill="#f0fdf4"/>
    <text x="86" y="29" font-size="10" font-weight="700" fill="#15803d" text-anchor="middle">TRANSPORTER HUB</text>

    <text x="14" y="62" font-size="16" font-weight="800" fill="#0f172a">Carrier Fleet Management</text>
    <text x="14" y="80" font-size="11" fill="#64748b">Operator: Benue Haulage Express (Verified Driver)</text>

    <text x="14" y="106" font-size="13" font-weight="700" fill="#15803d">Capacity: 3,000 kg (Light Truck)</text>
    <text x="14" y="124" font-size="11" fill="#475569">Routes: Makurdi ⇄ Gboko ⇄ Otukpo Corridors</text>

    <rect x="14" y="136" width="330" height="32" rx="6" fill="#15803d"/>
    <text x="179" y="157" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">Manage Fleet Capacity &amp; Rates</text>
  </g>

  <!-- Haulage Corridors -->
  <g transform="translate(16, 252)">
    <rect x="0" y="0" width="358" height="150" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <text x="14" y="24" font-size="13" font-weight="700" fill="#0f172a">Benue Agricultural Corridors</text>

    <text x="14" y="52" font-size="12" font-weight="700" fill="#15803d">Route 1: Gboko ⇄ Makurdi (Yam / Soya)</text>
    <text x="14" y="68" font-size="11" fill="#64748b">High-capacity haulage connecting rural farms to state capital.</text>

    <text x="14" y="96" font-size="12" font-weight="700" fill="#15803d">Route 2: Otukpo ⇄ Enugu / South-East</text>
    <text x="14" y="112" font-size="11" fill="#64748b">Inter-state commercial corridor for wholesale grain deliveries.</text>
    <text x="14" y="136" font-size="11" font-weight="600" fill="#0f172a">Route 3: Katsina-Ala ⇄ Calabar</text>
  </g>

  <!-- Coordinated Order Integration -->
  <g transform="translate(16, 418)">
    <rect x="0" y="0" width="358" height="110" rx="12" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
    <text x="14" y="24" font-size="12" font-weight="700" fill="#0f172a">Order Checkout Integration</text>
    <text x="14" y="44" font-size="11" fill="#64748b">When buyers choose "Tongric Logistics Request", registered</text>
    <text x="14" y="60" font-size="11" fill="#64748b">transporters receive dispatch alerts to quote per-bag haulage rates.</text>
    <text x="14" y="86" font-size="11" font-weight="700" fill="#15803d">Integrated with Phase 6 Order Milestones</text>
  </g>
`);

// -----------------------------------------------------------------------------
// Screen 13: Finance & Section 19 Policy (/finance)
// -----------------------------------------------------------------------------
const screen13 = frame('finance', 'FARMER', 'Finance & Settlement', `
  <g transform="translate(16, 12)">
    <text x="0" y="20" font-size="18" font-weight="800" fill="#0f172a">Finance &amp; Settlement Policy</text>
    <text x="0" y="38" font-size="12" fill="#64748b">Transparent commercial trade settlement (Section 19)</text>
  </g>

  <!-- Section 19 Disclosure Banner -->
  <g transform="translate(16, 56)">
    <rect x="0" y="0" width="358" height="140" rx="12" fill="#fefce8" stroke="#fef08a" stroke-width="1.5"/>
    <text x="14" y="26" font-size="13" font-weight="800" fill="#854d0e">🛡️ Direct Settlement Notice (Zero Custody)</text>
    <text x="14" y="46" font-size="11" fill="#713f12">In accordance with Central Bank &amp; regulatory guidelines, Tongric</text>
    <text x="14" y="62" font-size="11" fill="#713f12">Release 1 does NOT hold, custody, or escrow commercial funds.</text>
    <text x="14" y="84" font-size="11" font-weight="700" fill="#854d0e">Direct Settlement Terms:</text>
    <text x="14" y="100" font-size="11" fill="#713f12">All produce and logistics fees are settled directly via bank transfer</text>
    <text x="14" y="116" font-size="11" fill="#713f12">or cash upon produce inspection at collection.</text>
  </g>

  <!-- Phase 9 Pilot Demonstrations -->
  <g transform="translate(16, 212)">
    <rect x="0" y="0" width="358" height="190" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <text x="14" y="24" font-size="13" font-weight="700" fill="#0f172a">Upcoming Financial Pilots (Phase 9)</text>

    <!-- Pilot 1: Barter -->
    <g transform="translate(14, 38)">
      <rect x="0" y="0" width="330" height="62" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
      <text x="12" y="22" font-size="12" font-weight="700" fill="#15803d">🔄 Produce Barter Exchange</text>
      <text x="12" y="38" font-size="10" fill="#64748b">Enables farmers to trade surplus tubers for grain seed inputs</text>
      <text x="12" y="52" font-size="10" fill="#64748b">without cash constraints in rural Benue communities.</text>
    </g>

    <!-- Pilot 2: Micro-Credit -->
    <g transform="translate(14, 110)">
      <rect x="0" y="0" width="330" height="62" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
      <text x="12" y="22" font-size="12" font-weight="700" fill="#15803d">🪙 Input Micro-Credit Demonstration</text>
      <text x="12" y="38" font-size="10" fill="#64748b">Allows smallholders with verified sales history on Tongric</text>
      <text x="12" y="52" font-size="10" fill="#64748b">to demonstrate creditworthiness for fertilizer &amp; seeds.</text>
    </g>
  </g>

  <!-- Digital Trade History -->
  <g transform="translate(16, 418)">
    <rect x="0" y="0" width="358" height="120" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <text x="14" y="24" font-size="13" font-weight="700" fill="#0f172a">Digital Transaction History</text>
    <text x="14" y="44" font-size="11" fill="#64748b">Verifiable trade records build credit history for rural producers.</text>
    
    <rect x="14" y="62" width="330" height="42" rx="8" fill="#15803d"/>
    <text x="179" y="88" font-size="13" font-weight="700" fill="#ffffff" text-anchor="middle">View Completed Trade Invoices</text>
  </g>
`);

// List of all screens
const screens = [
  { id: '01_home_farmer_mode', name: 'Farmer Home Overview', svg: screen01 },
  { id: '02_home_buyer_mode', name: 'Buyer Sourcing Home', svg: screen02 },
  { id: '03_marketplace_discovery', name: 'Produce Marketplace Discovery', svg: screen03 },
  { id: '04_produce_listing_detail', name: 'Produce Detail & Dual CTAs', svg: screen04 },
  { id: '05_create_produce_listing', name: 'Farmer Listing Creation Form', svg: screen05 },
  { id: '06_commercial_offer_negotiation', name: 'Commercial Offer Negotiation Thread', svg: screen06 },
  { id: '07_orders_management_list', name: 'Orders & Contract Management', svg: screen07 },
  { id: '08_order_milestone_tracking', name: 'Order Milestone Tracking & Settlement', svg: screen08 },
  { id: '09_farmer_profile_location', name: 'Farmer Profile & Benue LGA Location', svg: screen09 },
  { id: '10_kyc_verification_upload', name: 'Participant KYC & ID Upload', svg: screen10 },
  { id: '11_admin_verification_queue', name: 'Admin Verification Review Queue', svg: screen11 },
  { id: '12_logistics_transport_hub', name: 'Agricultural Logistics & Transport Hub', svg: screen12 },
  { id: '13_finance_zero_custody_policy', name: 'Finance & Section 19 Direct Settlement', svg: screen13 },
];

async function run() {
  console.log(`Generating ${screens.length} professional mobile grant screenshots...`);

  for (const s of screens) {
    const svgPath = path.join(outDir, `${s.id}.svg`);
    const pngPath = path.join(outDir, `${s.id}.png`);

    fs.writeFileSync(svgPath, s.svg, 'utf8');

    // 2x Retina Resolution: 780x1688
    await sharp(Buffer.from(s.svg))
      .resize(780, 1688)
      .png({ quality: 95 })
      .toFile(pngPath);

    console.log(`✓ Generated ${s.id}.png (${s.name})`);
  }

  // Generate Submission Guide README.md
  const readmeContent = `# TONGRIC MVP — GRANT SUBMISSION SCREENSHOTS

This directory contains **submission-ready, high-resolution mobile screenshots** capturing the core agricultural commerce, negotiation, logistics, verification, and settlement features built for the **Tongric MVP** (Benue State, Nigeria pilot).

All screenshots are formatted in **2x Retina resolution (780 x 1688 px)** with a clean mobile device frame, standard smartphone status bar, dynamic island, and Tongric's solid white background (\`bg-white\`) and multi-shade green design palette.

---

## Screen Catalog

| # | Screen Name | Route / Module | Key Features Showcased | Files |
|---|---|---|---|---|
| **01** | **Farmer Home Overview** | \`/\` | Workspace switch, Benue priority crop chips (*Yam, Tomatoes, Rice*), 3-step agricultural journey stepper, 23 Benue LGAs badge | [\`PNG\`](file:///c:/Users/USER/Desktop/tongric/public/grant-screenshots/01_home_farmer_mode.png) • [\`SVG\`](file:///c:/Users/USER/Desktop/tongric/public/grant-screenshots/01_home_farmer_mode.svg) |
| **02** | **Buyer Sourcing Home** | \`/\` | Sourcing perspective, bulk produce procurement, Section 19 zero-custody transparency notice | [\`PNG\`](file:///c:/Users/USER/Desktop/tongric/public/grant-screenshots/02_home_buyer_mode.png) • [\`SVG\`](file:///c:/Users/USER/Desktop/tongric/public/grant-screenshots/02_home_buyer_mode.svg) |
| **03** | **Produce Marketplace Discovery** | \`/market\` | Filter chips (perishable tag, Benue LGAs, 3-tier quality grades), price per 100kg bag, verified farmer badge | [\`PNG\`](file:///c:/Users/USER/Desktop/tongric/public/grant-screenshots/03_marketplace_discovery.png) • [\`SVG\`](file:///c:/Users/USER/Desktop/tongric/public/grant-screenshots/03_marketplace_discovery.svg) |
| **04** | **Produce Detail & Dual CTAs** | \`/market/[id]\` | Commercial lot specifications (5,000kg), verified cooperative badge, dual CTAs (*"Call Farmer"* + *"Make Offer"*)| [\`PNG\`](file:///c:/Users/USER/Desktop/tongric/public/grant-screenshots/04_produce_listing_detail.png) • [\`SVG\`](file:///c:/Users/USER/Desktop/tongric/public/grant-screenshots/04_produce_listing_detail.svg) |
| **05** | **Farmer Listing Creation Form** | \`/market/create\` | Benue LGA selector, Grade A/B/C quality picker, unit price, Canvas compressed photo attachment (184 KB) | [\`PNG\`](file:///c:/Users/USER/Desktop/tongric/public/grant-screenshots/05_create_produce_listing.png) • [\`SVG\`](file:///c:/Users/USER/Desktop/tongric/public/grant-screenshots/05_create_produce_listing.svg) |
| **06** | **Offer Negotiation Thread** | \`/orders/offers/[id]\` | 3-round counter-offer ceiling, 24h perishable countdown timer, farm-gate pickup mode, response toolbar | [\`PNG\`](file:///c:/Users/USER/Desktop/tongric/public/grant-screenshots/06_commercial_offer_negotiation.png) • [\`SVG\`](file:///c:/Users/USER/Desktop/tongric/public/grant-screenshots/06_commercial_offer_negotiation.svg) |
| **07** | **Orders & Contract Management** | \`/orders\` | Confirmed orders tab, Crockford-safe order code (\`ORD-202611-73921\`), direct phone dialer, agreed amounts | [\`PNG\`](file:///c:/Users/USER/Desktop/tongric/public/grant-screenshots/07_orders_management_list.png) • [\`SVG\`](file:///c:/Users/USER/Desktop/tongric/public/grant-screenshots/07_orders_management_list.svg) |
| **08** | **Order Milestone Tracking** | \`/orders/[id]\` | Stepper (*Confirmed → Collected → Delivered → Completed*), action toolbar, Section 19 zero-custody notice | [\`PNG\`](file:///c:/Users/USER/Desktop/tongric/public/grant-screenshots/08_order_milestone_tracking.png) • [\`SVG\`](file:///c:/Users/USER/Desktop/tongric/public/grant-screenshots/08_order_milestone_tracking.svg) |
| **09** | **Farmer Profile & Location** | \`/profile\` | 23 Benue LGAs, community village, primary crops farmed, cooperative federation affiliation, farm size | [\`PNG\`](file:///c:/Users/USER/Desktop/tongric/public/grant-screenshots/09_farmer_profile_location.png) • [\`SVG\`](file:///c:/Users/USER/Desktop/tongric/public/grant-screenshots/09_farmer_profile_location.svg) |
| **10** | **Participant KYC & ID Upload** | \`/profile/verify\` | Document type selector, client-side Canvas compression, NDPA 2023 private storage compliance | [\`PNG\`](file:///c:/Users/USER/Desktop/tongric/public/grant-screenshots/10_kyc_verification_upload.png) • [\`SVG\`](file:///c:/Users/USER/Desktop/tongric/public/grant-screenshots/10_kyc_verification_upload.svg) |
| **11** | **Admin Verification Queue** | \`/admin/verifications\` | Administrative queue, review pending documents with in-browser preview, one-click *"Approve"* & *"Reject"* | [\`PNG\`](file:///c:/Users/USER/Desktop/tongric/public/grant-screenshots/11_admin_verification_queue.png) • [\`SVG\`](file:///c:/Users/USER/Desktop/tongric/public/grant-screenshots/11_admin_verification_queue.svg) |
| **12** | **Logistics & Transport Hub** | \`/transport\` | Transporter carrier fleet hub, carrying capacity in kg/tonnes, Benue transit corridors (*Gboko ⇄ Makurdi*) | [\`PNG\`](file:///c:/Users/USER/Desktop/tongric/public/grant-screenshots/12_logistics_transport_hub.png) • [\`SVG\`](file:///c:/Users/USER/Desktop/tongric/public/grant-screenshots/12_logistics_transport_hub.svg) |
| **13** | **Finance & Settlement Policy** | \`/finance\` | Section 19 regulatory direct settlement policy, preview of Phase 9 barter exchange & micro-credit pilots | [\`PNG\`](file:///c:/Users/USER/Desktop/tongric/public/grant-screenshots/13_finance_zero_custody_policy.png) • [\`SVG\`](file:///c:/Users/USER/Desktop/tongric/public/grant-screenshots/13_finance_zero_custody_policy.svg) |

---

## Technical Specifications
- **Design Standard:** WCAG AA accessible contrast, solid white background (\`#ffffff\`), primary agricultural green (\`#15803d\`), 44px+ minimum touch targets.
- **Image Resolution:** 780 x 1688 pixels (2x High-DPI Retina standard).
- **Format:** Both PNG (for direct insertion into Word/PDF grant applications) and vector SVG (for lossless scaling in pitch decks).
`;

  fs.writeFileSync(path.join(outDir, 'README.md'), readmeContent, 'utf8');
  console.log('✓ Generated README.md catalog.');
}

run().catch(console.error);
