const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const outDir = path.resolve(process.cwd(), 'public/grant-screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Load real crop and hero images as base64
function getBase64Image(relPath) {
  const fullPath = path.resolve(process.cwd(), relPath);
  if (fs.existsSync(fullPath)) {
    return 'data:image/jpeg;base64,' + fs.readFileSync(fullPath).toString('base64');
  }
  return '';
}

const heroFarmerImg = getBase64Image('public/images/hero/farmer-hero.jpg');
const yamImg = getBase64Image('public/images/crops/yam.jpg');
const soybeansImg = getBase64Image('public/images/crops/soybeans.jpg');
const tomatoesImg = getBase64Image('public/images/crops/tomatoes.jpg');
const pepperImg = getBase64Image('public/images/crops/pepper.jpg');
const maizeImg = getBase64Image('public/images/crops/maize.jpg');
const riceImg = getBase64Image('public/images/crops/rice.jpg');
const cassavaImg = getBase64Image('public/images/crops/cassava.jpg');
const carrierTruckImg = getBase64Image('public/images/transport/carrier-truck.jpg');

const W = 390;
const H = 844;

function frame(tab, options, content) {
  const {
    showSubNav = false,
    activeSubTab = 'harvests',
    title = 'Tongric',
    unreadCount = 2,
    hideBottomNav = false,
  } = options || {};

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
    <clipPath id="heroClip">
      <rect x="0" y="0" width="112" height="112" rx="10" />
    </clipPath>
    <clipPath id="cropThumbClip">
      <rect x="0" y="0" width="104" height="68" rx="8" />
    </clipPath>
    <clipPath id="marketCardClip">
      <rect x="0" y="0" width="96" height="84" rx="8" />
    </clipPath>
    <clipPath id="detailHeroClip">
      <rect x="0" y="0" width="358" height="160" rx="12" />
    </clipPath>
    <clipPath id="carrierTruckClip">
      <rect x="0" y="0" width="358" height="92" rx="10" />
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

    <!-- Top Navigation Bar -->
    <rect x="0" y="44" width="${W}" height="52" fill="#ffffff" stroke="#f1f5f9" stroke-width="1"/>
    
    <!-- Logo & Brand -->
    <g transform="translate(16, 56)">
      <rect x="0" y="0" width="28" height="28" rx="6" fill="#15803d"/>
      <path d="M7 20V9l7-4 7 4v11" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
      <circle cx="14" cy="14" r="3" fill="#ffffff"/>
      <text x="36" y="20" font-size="17" font-weight="800" fill="#15803d" letter-spacing="-0.3">Tongric</text>
    </g>

    <!-- Right Navbar Controls: Muted Language, Icon-Only Notifications, Icon-Only Profile -->
    <g transform="translate(232, 54)">
      <!-- Muted Language Switcher (opacity 75%) -->
      <g opacity="0.75" transform="translate(0, 0)">
        <rect x="0" y="0" width="46" height="30" rx="6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
        <text x="23" y="19" font-size="11" font-weight="600" fill="#475569" text-anchor="middle">🌐 EN</text>
      </g>

      <!-- Icon-Only Notifications (no text) with Badge -->
      <g transform="translate(52, 0)">
        <rect x="0" y="0" width="30" height="30" rx="6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
        <path d="M15 8a4 4 0 0 0-4 4v3l-2 2h12l-2-2v-3a4 4 0 0 0-4-4z" fill="none" stroke="#334155" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="M13.5 20a1.5 1.5 0 0 0 3 0" fill="none" stroke="#334155" stroke-width="1.6"/>
        ${unreadCount > 0 ? `
          <circle cx="23" cy="7" r="5" fill="#dc2626"/>
          <text x="23" y="10" font-size="8" font-weight="700" fill="#ffffff" text-anchor="middle">${unreadCount}</text>
        ` : ''}
      </g>

      <!-- Icon-Only Profile Button (no text) -->
      <g transform="translate(88, 0)">
        <circle cx="15" cy="15" r="15" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1"/>
        <circle cx="15" cy="11" r="4.5" fill="#15803d"/>
        <path d="M8.5 22c0-3.5 3-5 6.5-5s6.5 1.5 6.5 5" fill="#15803d"/>
      </g>
    </g>

    ${showSubNav ? `
    <!-- Sub-Navbar Quick Action Tabs -->
    <g transform="translate(0, 96)">
      <rect x="0" y="0" width="${W}" height="36" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
      <g transform="translate(16, 5)">
        <rect x="0" y="0" width="102" height="26" rx="6" fill="${activeSubTab === 'harvests' ? '#15803d' : 'transparent'}"/>
        <text x="51" y="17" font-size="11" font-weight="700" fill="${activeSubTab === 'harvests' ? '#ffffff' : '#64748b'}" text-anchor="middle">My Harvests</text>

        <rect x="108" y="0" width="102" height="26" rx="6" fill="${activeSubTab === 'trades' ? '#15803d' : 'transparent'}"/>
        <text x="159" y="17" font-size="11" font-weight="600" fill="${activeSubTab === 'trades' ? '#ffffff' : '#64748b'}" text-anchor="middle">Pending Trades</text>

        <rect x="216" y="0" width="102" height="26" rx="6" fill="${activeSubTab === 'freight' ? '#15803d' : 'transparent'}"/>
        <text x="267" y="17" font-size="11" font-weight="600" fill="${activeSubTab === 'freight' ? '#ffffff' : '#64748b'}" text-anchor="middle">Corridor Freight</text>
      </g>
    </g>
    ` : ''}

    <!-- Body Content Area -->
    <g transform="translate(0, ${showSubNav ? 134 : 98})">
      ${content}
    </g>

    ${!hideBottomNav ? `
    <!-- Bottom Navigation Bar (5 Active Functional Tabs) -->
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
    ` : ''}
  </g>
</svg>`;
}

// -----------------------------------------------------------------------------
// Screen 01: Streamlined Homepage (Farmer View)
// Features: Real Hero Farmer photo, NO tags above welcome, Horizontal Produce Scroll
// -----------------------------------------------------------------------------
const screen01 = frame('home', { showSubNav: true, activeSubTab: 'harvests' }, `
  <!-- Split Hero Card with Real Farmer Photo (NO tags above welcome!) -->
  <g transform="translate(16, 12)">
    <rect x="0" y="0" width="358" height="154" rx="14" fill="#ffffff" stroke="#86efac" stroke-width="1.5"/>
    
    <!-- Left Hero Content -->
    <g transform="translate(14, 16)">
      <text x="0" y="16" font-size="19" font-weight="800" fill="#0f172a" letter-spacing="-0.3">Welcome back, Tersoo!</text>
      <text x="0" y="34" font-size="11" fill="#475569">Direct farm-gate commerce &amp; verified</text>
      <text x="0" y="48" font-size="11" fill="#475569">freight for Benue State smallholders.</text>

      <!-- Primary Action CTA Buttons -->
      <g transform="translate(0, 64)">
        <rect x="0" y="0" width="194" height="38" rx="8" fill="#15803d"/>
        <text x="97" y="24" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">+ List Produce for Sale</text>
      </g>

      <text x="0" y="122" font-size="10" font-weight="600" fill="#15803d">⚡ 2 Active Lots • ₦1.8M In Negotiation</text>
    </g>

    <!-- Right Hero Image: Real Farmer in Field -->
    <g transform="translate(230, 21)" clip-path="url(#heroClip)">
      <image href="${heroFarmerImg}" x="0" y="0" width="112" height="112" preserveAspectRatio="xMidYMid slice"/>
      <rect x="0" y="88" width="112" height="24" fill="#0f172a" opacity="0.6"/>
      <text x="56" y="104" font-size="9" font-weight="700" fill="#ffffff" text-anchor="middle">Gboko Smallholder</text>
    </g>
  </g>

  <!-- Benue State Agricultural Produce (Horizontal Scroll Container with Real Photos) -->
  <g transform="translate(16, 182)">
    <rect x="0" y="0" width="358" height="210" rx="14" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    
    <g transform="translate(14, 18)">
      <text x="0" y="0" font-size="14" font-weight="800" fill="#0f172a">Benue Agricultural Produce</text>
      <text x="0" y="16" font-size="11" fill="#64748b">Browse active regional harvests (swipe horizontally)</text>
    </g>

    <!-- Horizontal Produce Cards Carousel -->
    <g transform="translate(14, 46)">
      <!-- Card 1: Yam -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="104" height="136" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
        <g clip-path="url(#cropThumbClip)">
          <image href="${yamImg}" x="0" y="0" width="104" height="68" preserveAspectRatio="xMidYMid slice"/>
        </g>
        <text x="8" y="84" font-size="11" font-weight="700" fill="#0f172a">Benue Yam</text>
        <text x="8" y="98" font-size="10" font-weight="700" fill="#15803d">₦32,000</text>
        <text x="8" y="110" font-size="9" fill="#64748b">per 100kg bag</text>
        <rect x="8" y="116" width="88" height="14" rx="3" fill="#dcfce7"/>
        <text x="52" y="127" font-size="8" font-weight="700" fill="#15803d" text-anchor="middle">Gboko Harvest</text>
      </g>

      <!-- Card 2: Soybeans -->
      <g transform="translate(112, 0)">
        <rect x="0" y="0" width="104" height="136" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
        <g clip-path="url(#cropThumbClip)">
          <image href="${soybeansImg}" x="0" y="0" width="104" height="68" preserveAspectRatio="xMidYMid slice"/>
        </g>
        <text x="8" y="84" font-size="11" font-weight="700" fill="#0f172a">Soybeans</text>
        <text x="8" y="98" font-size="10" font-weight="700" fill="#15803d">₦45,000</text>
        <text x="8" y="110" font-size="9" fill="#64748b">per 100kg bag</text>
        <rect x="8" y="116" width="88" height="14" rx="3" fill="#fef3c7"/>
        <text x="52" y="127" font-size="8" font-weight="700" fill="#b45309" text-anchor="middle">High Protein</text>
      </g>

      <!-- Card 3: Tomatoes (24h) -->
      <g transform="translate(224, 0)">
        <rect x="0" y="0" width="104" height="136" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
        <g clip-path="url(#cropThumbClip)">
          <image href="${tomatoesImg}" x="0" y="0" width="104" height="68" preserveAspectRatio="xMidYMid slice"/>
        </g>
        <text x="8" y="84" font-size="11" font-weight="700" fill="#0f172a">Tomatoes</text>
        <text x="8" y="98" font-size="10" font-weight="700" fill="#b91c1c">₦18,000</text>
        <text x="8" y="110" font-size="9" fill="#64748b">per 50kg crate</text>
        <rect x="8" y="116" width="88" height="14" rx="3" fill="#fee2e2"/>
        <text x="52" y="127" font-size="8" font-weight="700" fill="#b91c1c" text-anchor="middle">24h Perishable</text>
      </g>
    </g>
  </g>

  <!-- Quick Operational Overview Card -->
  <g transform="translate(16, 408)">
    <rect x="0" y="0" width="358" height="196" rx="14" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    
    <text x="14" y="24" font-size="13" font-weight="700" fill="#0f172a">Active Harvest Batches</text>
    
    <!-- Batch Row 1 -->
    <g transform="translate(14, 40)">
      <rect x="0" y="0" width="330" height="64" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
      <circle cx="28" cy="32" r="16" fill="#ecfdf5"/>
      <text x="28" y="36" font-size="12" font-weight="800" fill="#15803d" text-anchor="middle">YAM</text>
      <text x="54" y="26" font-size="12" font-weight="700" fill="#0f172a">Benue White Yam (Grade A)</text>
      <text x="54" y="42" font-size="11" fill="#64748b">5,000 kg • Gboko Farm-Gate • ₦32k/bag</text>
      <rect x="250" y="18" width="68" height="26" rx="6" fill="#15803d"/>
      <text x="284" y="35" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">Active</text>
    </g>

    <!-- Batch Row 2 -->
    <g transform="translate(14, 114)">
      <rect x="0" y="0" width="330" height="64" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
      <circle cx="28" cy="32" r="16" fill="#fef3c7"/>
      <text x="28" y="36" font-size="12" font-weight="800" fill="#b45309" text-anchor="middle">SOY</text>
      <text x="54" y="26" font-size="12" font-weight="700" fill="#0f172a">Soybeans Non-GMO Batch #2</text>
      <text x="54" y="42" font-size="11" fill="#64748b">8,500 kg • Vandeikya Hub • ₦45k/bag</text>
      <rect x="250" y="18" width="68" height="26" rx="6" fill="#2563eb"/>
      <text x="284" y="35" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">2 Offers</text>
    </g>
  </g>
`);

// -----------------------------------------------------------------------------
// Screen 02: Simplified Produce Marketplace Discovery (/market)
// Features: Clean 6-field cards (Image, Name, Price, Quantity, Location, Farmer Name)
// -----------------------------------------------------------------------------
const screen02 = frame('market', { showSubNav: false }, `
  <!-- Filter & Search Bar -->
  <g transform="translate(16, 12)">
    <rect x="0" y="0" width="358" height="42" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <text x="14" y="26" font-size="13" fill="#64748b">🔍 Search Benue yam, soybeans, pepper...</text>
    <rect x="306" y="6" width="44" height="30" rx="6" fill="#f1f5f9"/>
    <text x="328" y="25" font-size="11" font-weight="700" fill="#334155" text-anchor="middle">Filter</text>
  </g>

  <!-- Section Header -->
  <g transform="translate(16, 66)">
    <text x="0" y="16" font-size="16" font-weight="800" fill="#0f172a">Verified Benue Farm-Gate Listings</text>
    <text x="0" y="32" font-size="11" fill="#64748b">Direct from smallholder farms with verified origin</text>
  </g>

  <!-- Simplified 6-Field Listing Cards (No clutter!) -->
  <g transform="translate(16, 108)">
    <!-- Card 1: Benue White Yam -->
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="358" height="106" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
      <g transform="translate(10, 11)" clip-path="url(#marketCardClip)">
        <image href="${yamImg}" x="0" y="0" width="96" height="84" preserveAspectRatio="xMidYMid slice"/>
      </g>
      <g transform="translate(118, 16)">
        <text x="0" y="13" font-size="14" font-weight="800" fill="#0f172a">Benue White Yam</text>
        <text x="0" y="31" font-size="13" font-weight="800" fill="#15803d">₦32,000 / 100kg bag</text>
        <text x="0" y="48" font-size="11" fill="#334155">📦 Quantity: <tspan font-weight="700">5,000 kg</tspan></text>
        <text x="0" y="64" font-size="11" fill="#64748b">📍 Gboko, Benue State</text>
        <text x="0" y="78" font-size="11" font-weight="600" fill="#15803d">👨‍🌾 Farmer: Terna Aondover</text>
      </g>
    </g>

    <!-- Card 2: Soybeans -->
    <g transform="translate(0, 118)">
      <rect x="0" y="0" width="358" height="106" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
      <g transform="translate(10, 11)" clip-path="url(#marketCardClip)">
        <image href="${soybeansImg}" x="0" y="0" width="96" height="84" preserveAspectRatio="xMidYMid slice"/>
      </g>
      <g transform="translate(118, 16)">
        <text x="0" y="13" font-size="14" font-weight="800" fill="#0f172a">Soybeans (Non-GMO)</text>
        <text x="0" y="31" font-size="13" font-weight="800" fill="#15803d">₦45,000 / 100kg bag</text>
        <text x="0" y="48" font-size="11" fill="#334155">📦 Quantity: <tspan font-weight="700">8,500 kg</tspan></text>
        <text x="0" y="64" font-size="11" fill="#64748b">📍 Vandeikya, Benue State</text>
        <text x="0" y="78" font-size="11" font-weight="600" fill="#15803d">👨‍🌾 Farmer: Aver Kuma</text>
      </g>
    </g>

    <!-- Card 3: Tomatoes -->
    <g transform="translate(0, 236)">
      <rect x="0" y="0" width="358" height="106" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
      <g transform="translate(10, 11)" clip-path="url(#marketCardClip)">
        <image href="${tomatoesImg}" x="0" y="0" width="96" height="84" preserveAspectRatio="xMidYMid slice"/>
      </g>
      <g transform="translate(118, 16)">
        <text x="0" y="13" font-size="14" font-weight="800" fill="#0f172a">Ripe Roma Tomatoes</text>
        <text x="0" y="31" font-size="13" font-weight="800" fill="#b91c1c">₦18,000 / 50kg crate</text>
        <text x="0" y="48" font-size="11" fill="#334155">📦 Quantity: <tspan font-weight="700">1,200 kg</tspan></text>
        <text x="0" y="64" font-size="11" fill="#64748b">📍 Makurdi, Benue State</text>
        <text x="0" y="78" font-size="11" font-weight="600" fill="#15803d">👨‍🌾 Farmer: Moses Iorfa</text>
      </g>
    </g>

    <!-- Card 4: Hot Pepper -->
    <g transform="translate(0, 354)">
      <rect x="0" y="0" width="358" height="106" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
      <g transform="translate(10, 11)" clip-path="url(#marketCardClip)">
        <image href="${pepperImg}" x="0" y="0" width="96" height="84" preserveAspectRatio="xMidYMid slice"/>
      </g>
      <g transform="translate(118, 16)">
        <text x="0" y="13" font-size="14" font-weight="800" fill="#0f172a">Red Habanero Hot Pepper</text>
        <text x="0" y="31" font-size="13" font-weight="800" fill="#15803d">₦22,000 / 50kg bag</text>
        <text x="0" y="48" font-size="11" fill="#334155">📦 Quantity: <tspan font-weight="700">900 kg</tspan></text>
        <text x="0" y="64" font-size="11" fill="#64748b">📍 Katsina-Ala, Benue State</text>
        <text x="0" y="78" font-size="11" font-weight="600" fill="#15803d">👨‍🌾 Farmer: Comfort Terfa</text>
      </g>
    </g>
  </g>
`);

// -----------------------------------------------------------------------------
// Screen 03: Produce Listing Detail (/market/[id])
// Features: Full high-res crop photo, price breakdown, verified specs, dual CTAs
// -----------------------------------------------------------------------------
const screen03 = frame('market', { showSubNav: false }, `
  <!-- Back Link & Action -->
  <g transform="translate(16, 10)">
    <text x="0" y="16" font-size="12" font-weight="700" fill="#15803d">← Back to Marketplace</text>
  </g>

  <!-- Crop Hero Image Banner -->
  <g transform="translate(16, 32)" clip-path="url(#detailHeroClip)">
    <image href="${yamImg}" x="0" y="0" width="358" height="160" preserveAspectRatio="xMidYMid slice"/>
    <rect x="0" y="126" width="358" height="34" fill="#0f172a" opacity="0.75"/>
    <text x="14" y="148" font-size="12" font-weight="700" fill="#ffffff">Gboko Central Barn • Harvested 2 Days Ago</text>
    <rect x="264" y="132" width="80" height="22" rx="4" fill="#15803d"/>
    <text x="304" y="147" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">Grade A</text>
  </g>

  <!-- Listing Detail Specs Card -->
  <g transform="translate(16, 204)">
    <rect x="0" y="0" width="358" height="248" rx="14" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    
    <g transform="translate(14, 18)">
      <text x="0" y="0" font-size="18" font-weight="800" fill="#0f172a">Benue White Yam (Commercial Lot)</text>
      
      <!-- Price & Total -->
      <g transform="translate(0, 16)">
        <text x="0" y="18" font-size="20" font-weight="800" fill="#15803d">₦32,000 <tspan font-size="12" font-weight="500" fill="#64748b">/ 100kg bag</tspan></text>
        <text x="0" y="34" font-size="12" font-weight="600" fill="#0f172a">Total Lot Value: ₦1,600,000 (50 bags / 5,000 kg)</text>
      </g>

      <!-- Key Specifications Grid -->
      <g transform="translate(0, 68)">
        <rect x="0" y="0" width="158" height="52" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
        <text x="10" y="18" font-size="10" fill="#64748b">Quality Grade</text>
        <text x="10" y="36" font-size="12" font-weight="700" fill="#0f172a">Grade A Export</text>

        <rect x="170" y="0" width="158" height="52" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
        <text x="10" y="18" font-size="10" fill="#64748b">Dispatch Readiness</text>
        <text x="10" y="36" font-size="12" font-weight="700" fill="#15803d">Immediate (24h)</text>
      </g>

      <!-- Farmer Trust & Cooperative Profile -->
      <g transform="translate(0, 134)">
        <rect x="0" y="0" width="328" height="54" rx="8" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1"/>
        <circle cx="26" cy="27" r="14" fill="#15803d"/>
        <text x="26" y="32" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">TA</text>
        <text x="48" y="22" font-size="12" font-weight="700" fill="#065f46">Terna Aondover • Verified Farmer</text>
        <text x="48" y="38" font-size="10" fill="#047857">Gboko Yam Producers Cooperative • 100% On-Time</text>
      </g>
    </g>
  </g>

  <!-- Dual CTAs: Direct Call & Structured Offer -->
  <g transform="translate(16, 466)">
    <rect x="0" y="0" width="170" height="46" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
    <text x="85" y="28" font-size="13" font-weight="700" fill="#0f172a" text-anchor="middle">📞 Direct Call Farmer</text>

    <rect x="186" y="0" width="172" height="46" rx="10" fill="#15803d"/>
    <text x="272" y="28" font-size="13" font-weight="700" fill="#ffffff" text-anchor="middle">🤝 Make Trade Offer</text>
  </g>
`);

// -----------------------------------------------------------------------------
// Screen 04: Confirmed Order & Official Waybill (/orders/[id]/waybill)
// Features: 4-digit handover PIN (#8492), official waybill, carrier details
// -----------------------------------------------------------------------------
const screen04 = frame('orders', { showSubNav: false }, `
  <!-- Waybill Header Card -->
  <g transform="translate(16, 12)">
    <rect x="0" y="0" width="358" height="92" rx="12" fill="#ffffff" stroke="#86efac" stroke-width="1.5"/>
    <g transform="translate(14, 16)">
      <rect x="0" y="0" width="94" height="20" rx="4" fill="#dcfce7"/>
      <text x="47" y="14" font-size="9" font-weight="700" fill="#15803d" text-anchor="middle">OFFICIAL WAYBILL</text>
      <text x="108" y="14" font-size="11" font-weight="600" fill="#64748b">ORD-202611-73921</text>
      
      <text x="0" y="42" font-size="16" font-weight="800" fill="#0f172a">Dispatch &amp; Handover Manifest</text>
      <text x="0" y="60" font-size="11" fill="#475569">Gboko Farm-Gate ➔ Abuja Wholesale Terminal</text>
    </g>
  </g>

  <!-- 4-Digit Handover PIN Highlight Card -->
  <g transform="translate(16, 116)">
    <rect x="0" y="0" width="358" height="88" rx="12" fill="#0f172a"/>
    <g transform="translate(16, 18)">
      <text x="0" y="14" font-size="11" font-weight="600" fill="#94a3b8">CARGO HANDOVER VERIFICATION PIN</text>
      <text x="0" y="48" font-size="32" font-weight="900" fill="#4ade80" letter-spacing="6">#8492</text>
      <text x="160" y="44" font-size="10" fill="#cbd5e1">Show this 4-digit PIN to carrier</text>
      <text x="160" y="56" font-size="10" fill="#cbd5e1">upon physical loading inspection.</text>
    </g>
  </g>

  <!-- Waybill Consignor / Consignee / Carrier Grid -->
  <g transform="translate(16, 216)">
    <rect x="0" y="0" width="358" height="236" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    
    <g transform="translate(14, 18)">
      <!-- Consignor (Farmer) -->
      <text x="0" y="12" font-size="11" font-weight="700" fill="#15803d">1. CONSIGNOR (FARMER ORIGIN)</text>
      <text x="0" y="28" font-size="13" font-weight="800" fill="#0f172a">Terna Aondover (Gboko Smallholder)</text>
      <text x="0" y="42" font-size="11" fill="#64748b">Central Yam Barn, Gboko LGA • Tel: 08011111111</text>

      <line x1="0" y1="52" x2="330" y2="52" stroke="#f1f5f9" stroke-width="1"/>

      <!-- Consignee (Buyer) -->
      <g transform="translate(0, 64)">
        <text x="0" y="12" font-size="11" font-weight="700" fill="#2563eb">2. CONSIGNEE (DESTINATION BUYER)</text>
        <text x="0" y="28" font-size="13" font-weight="800" fill="#0f172a">AgroVentures Ltd (Emeka Okonkwo)</text>
        <text x="0" y="42" font-size="11" fill="#64748b">Abuja Central Grain Hub • Tel: 08022222222</text>
      </g>

      <line x1="0" y1="118" x2="330" y2="118" stroke="#f1f5f9" stroke-width="1"/>

      <!-- Carrier / Transporter -->
      <g transform="translate(0, 130)">
        <text x="0" y="12" font-size="11" font-weight="700" fill="#b45309">3. ASSIGNED CARRIER (LOGISTICS)</text>
        <text x="0" y="28" font-size="13" font-weight="800" fill="#0f172a">Danladi Ibrahim • Benue Express</text>
        <text x="0" y="42" font-size="11" fill="#64748b">Bedford 15-Ton Heavy Truck • Plate: MKD-882-XA</text>
      </g>
    </g>
  </g>

  <!-- Handover Verification Stepper -->
  <g transform="translate(16, 464)">
    <rect x="0" y="0" width="358" height="74" rx="12" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
    <g transform="translate(18, 22)">
      <circle cx="16" cy="14" r="10" fill="#15803d"/>
      <text x="16" y="18" font-size="10" font-weight="800" fill="#ffffff" text-anchor="middle">✓</text>
      <text x="34" y="18" font-size="11" font-weight="700" fill="#15803d">Trade Confirmed</text>

      <line x1="126" y1="14" x2="154" y2="14" stroke="#15803d" stroke-width="2"/>

      <circle cx="170" cy="14" r="10" fill="#2563eb"/>
      <text x="170" y="18" font-size="10" font-weight="800" fill="#ffffff" text-anchor="middle">2</text>
      <text x="188" y="18" font-size="11" font-weight="700" fill="#2563eb">At Farm-Gate</text>
    </g>
  </g>
`);

// -----------------------------------------------------------------------------
// Screen 05: Logistics & Corridor Transport Hub (/transport)
// Features: Short top description, no rate card tab, carriage fleet with image,
// prominent phone number, and capacity sorting selector
// -----------------------------------------------------------------------------
const screen05 = frame('transport', { showSubNav: false }, `
  <!-- Short & Simple Top Description Card -->
  <g transform="translate(16, 12)">
    <rect x="0" y="0" width="358" height="66" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2"/>
    <g transform="translate(14, 14)">
      <circle cx="16" cy="19" r="16" fill="#dcfce7"/>
      <path d="M10 19v-4l4-3 4 3v4" fill="none" stroke="#15803d" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="12" cy="22" r="2" fill="#15803d"/>
      <circle cx="20" cy="22" r="2" fill="#15803d"/>
      <text x="42" y="16" font-size="14" font-weight="800" fill="#0f172a">Agricultural Logistics &amp; Transport</text>
      <text x="42" y="32" font-size="10" fill="#64748b">Find verified transport carriers for farm-gate produce pickup.</text>
    </g>
  </g>

  <!-- Filter & Capacity Sort Controls (No Corridor Rate Card Tab!) -->
  <g transform="translate(16, 88)">
    <rect x="0" y="0" width="172" height="34" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <text x="12" y="22" font-size="11" fill="#334155">LGA: <tspan font-weight="700">All Benue LGAs</tspan></text>
    <text x="154" y="22" font-size="10" fill="#64748b">▼</text>

    <rect x="186" y="0" width="172" height="34" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <text x="198" y="22" font-size="11" fill="#334155">Sort: <tspan font-weight="700">Capacity (High)</tspan></text>
    <text x="342" y="22" font-size="10" fill="#64748b">▼</text>
  </g>

  <!-- Verified Carrier Fleet Directory -->
  <g transform="translate(16, 134)">
    <text x="0" y="14" font-size="14" font-weight="800" fill="#0f172a">Verified Carrier Fleet Directory (6)</text>
    
    <!-- Carrier Card 1: Heavy Truck -->
    <g transform="translate(0, 24)">
      <rect x="0" y="0" width="358" height="232" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
      
      <!-- Fleet Vehicle Image -->
      <g transform="translate(10, 10)" clip-path="url(#carrierTruckClip)">
        <image href="${carrierTruckImg}" x="0" y="0" width="338" height="92" preserveAspectRatio="xMidYMid slice"/>
        <rect x="250" y="8" width="80" height="20" rx="4" fill="#15803d"/>
        <text x="290" y="22" font-size="9" font-weight="700" fill="#ffffff" text-anchor="middle">VERIFIED</text>
      </g>

      <g transform="translate(14, 116)">
        <div style="display:flex;">
          <text x="0" y="14" font-size="14" font-weight="800" fill="#0f172a">Danladi Ibrahim • Benue Express</text>
          <text x="250" y="14" font-size="11" font-weight="700" fill="#b45309">★ 4.9 (24)</text>
        </div>

        <!-- Prominently Visible Phone Number -->
        <g transform="translate(0, 24)">
          <rect x="0" y="0" width="174" height="24" rx="4" fill="#dcfce7" stroke="#86efac" stroke-width="1"/>
          <text x="8" y="16" font-size="11" font-weight="700" fill="#15803d">📞 Phone: 08033333333</text>
        </g>

        <!-- Capacity & LGAs -->
        <text x="0" y="66" font-size="11" fill="#334155">Max Capacity: <tspan font-weight="700">~15,000 kg (15-Ton Bedford)</tspan></text>
        <text x="0" y="80" font-size="10" fill="#64748b">Operating LGAs: Gboko, Makurdi, Otukpo, Katsina-Ala</text>

        <!-- Call Carrier Action Button -->
        <g transform="translate(204, 60)">
          <rect x="0" y="0" width="126" height="34" rx="6" fill="#15803d"/>
          <text x="63" y="22" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">Call Carrier</text>
        </g>
      </g>
    </g>

    <!-- Carrier Card 2: Light Truck -->
    <g transform="translate(0, 268)">
      <rect x="0" y="0" width="358" height="152" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
      <g transform="translate(14, 14)">
        <text x="0" y="14" font-size="14" font-weight="800" fill="#0f172a">Gboko Central Haulage Cooperative</text>
        
        <!-- Prominently Visible Phone Number -->
        <g transform="translate(0, 24)">
          <rect x="0" y="0" width="174" height="24" rx="4" fill="#dcfce7" stroke="#86efac" stroke-width="1"/>
          <text x="8" y="16" font-size="11" font-weight="700" fill="#15803d">📞 Phone: 08011112233</text>
        </g>

        <text x="0" y="66" font-size="11" fill="#334155">Max Capacity: <tspan font-weight="700">~5,000 kg (Canter Truck)</tspan></text>
        <text x="0" y="80" font-size="10" fill="#64748b">Operating LGAs: Gboko, Vandeikya, Buruku</text>

        <g transform="translate(204, 52)">
          <rect x="0" y="0" width="126" height="34" rx="6" fill="#15803d"/>
          <text x="63" y="22" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">Call Carrier</text>
        </g>
      </g>
    </g>
  </g>
`);

// -----------------------------------------------------------------------------
// Screen 06: Barter Commodity Exchange (/exchange)
// Features: Calculator hidden, buttons disabled (as requested by user)
// -----------------------------------------------------------------------------
const screen06 = frame('home', { showSubNav: false }, `
  <!-- Barter Header Banner -->
  <g transform="translate(16, 12)">
    <rect x="0" y="0" width="358" height="96" rx="14" fill="#ffffff" stroke="#86efac" stroke-width="1.5"/>
    <g transform="translate(14, 16)">
      <rect x="0" y="0" width="128" height="20" rx="4" fill="#dcfce7"/>
      <text x="64" y="14" font-size="9" font-weight="700" fill="#15803d" text-anchor="middle">NON-CASH COMMERCE</text>
      
      <text x="0" y="42" font-size="17" font-weight="800" fill="#0f172a">Agricultural Barter Exchange</text>
      <text x="0" y="60" font-size="11" fill="#64748b">Swap agricultural commodities without cash dependency</text>
    </g>
  </g>

  <!-- Commodity Swap Item 1 -->
  <g transform="translate(16, 120)">
    <rect x="0" y="0" width="358" height="152" rx="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
    <g transform="translate(14, 16)">
      <text x="0" y="14" font-size="14" font-weight="800" fill="#0f172a">Benue Yam ⇋ NPK 15-15-15 Fertilizer</text>
      
      <!-- Swap Visual Representation -->
      <g transform="translate(0, 28)">
        <rect x="0" y="0" width="144" height="42" rx="6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
        <text x="72" y="25" font-size="11" font-weight="700" fill="#15803d" text-anchor="middle">10 Bags Yam</text>

        <text x="164" y="27" font-size="16" font-weight="800" fill="#64748b" text-anchor="middle">⇌</text>

        <rect x="184" y="0" width="144" height="42" rx="6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
        <text x="256" y="25" font-size="11" font-weight="700" fill="#2563eb" text-anchor="middle">14 Bags Fertilizer</text>
      </g>

      <text x="0" y="92" font-size="10" fill="#64748b">Location: Gboko Central • Exchange Fair Ratio: 1 : 1.4</text>

      <!-- Disabled Action Button (as user insisted) -->
      <g transform="translate(0, 102)">
        <rect x="0" y="0" width="328" height="32" rx="6" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
        <text x="164" y="21" font-size="11" font-weight="600" fill="#94a3b8" text-anchor="middle">View Listing &amp; Swap Offers (Preview Locked)</text>
      </g>
    </g>
  </g>

  <!-- Commodity Swap Item 2 -->
  <g transform="translate(16, 284)">
    <rect x="0" y="0" width="358" height="152" rx="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
    <g transform="translate(14, 16)">
      <text x="0" y="14" font-size="14" font-weight="800" fill="#0f172a">Yellow Maize ⇋ Cassava Starch Flour</text>
      
      <!-- Swap Visual Representation -->
      <g transform="translate(0, 28)">
        <rect x="0" y="0" width="144" height="42" rx="6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
        <text x="72" y="25" font-size="11" font-weight="700" fill="#b45309" text-anchor="middle">20 Bags Maize</text>

        <text x="164" y="27" font-size="16" font-weight="800" fill="#64748b" text-anchor="middle">⇌</text>

        <rect x="184" y="0" width="144" height="42" rx="6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
        <text x="256" y="25" font-size="11" font-weight="700" fill="#15803d" text-anchor="middle">15 Bags Starch</text>
      </g>

      <text x="0" y="92" font-size="10" fill="#64748b">Location: Katsina-Ala • Verified Farmer Cooperative</text>

      <!-- Disabled Action Button -->
      <g transform="translate(0, 102)">
        <rect x="0" y="0" width="328" height="32" rx="6" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
        <text x="164" y="21" font-size="11" font-weight="600" fill="#94a3b8" text-anchor="middle">Propose Swap Offer (Disabled for Pilot)</text>
      </g>
    </g>
  </g>
`);

// -----------------------------------------------------------------------------
// Screen 07: Agricultural Finance & Credit (/finance)
// Features: Single cooperative product, short description, muted apply button,
// Direct Settlement Notice removed, credit score & barter tabs hidden
// -----------------------------------------------------------------------------
const screen07 = frame('finance', { showSubNav: false }, `
  <!-- Top Header Banner -->
  <g transform="translate(16, 12)">
    <rect x="0" y="0" width="358" height="74" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2"/>
    <g transform="translate(14, 16)">
      <circle cx="16" cy="20" r="16" fill="#dcfce7"/>
      <text x="16" y="25" font-size="14" font-weight="900" fill="#15803d" text-anchor="middle">₦</text>
      <text x="42" y="18" font-size="15" font-weight="800" fill="#0f172a">Agricultural Finance &amp; Credit</text>
      <text x="42" y="34" font-size="10" fill="#64748b">Accredited cooperative lending directory &amp; inputs.</text>
    </g>
  </g>

  <!-- Tab Bar: Single Cooperative Tab (Readiness & Barter Hidden!) -->
  <g transform="translate(16, 98)">
    <rect x="0" y="0" width="160" height="32" rx="6" fill="#dcfce7" stroke="#86efac" stroke-width="1"/>
    <text x="80" y="21" font-size="11" font-weight="700" fill="#15803d" text-anchor="middle">Cooperative Financing</text>
  </g>

  <!-- Single Cooperative Product Card (Short description & muted apply button) -->
  <g transform="translate(16, 142)">
    <text x="0" y="14" font-size="14" font-weight="800" fill="#0f172a">Accredited Cooperative Financing</text>
    
    <g transform="translate(0, 24)">
      <rect x="0" y="0" width="358" height="258" rx="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
      <g transform="translate(16, 18)">
        <rect x="0" y="0" width="124" height="20" rx="4" fill="#dcfce7"/>
        <text x="62" y="14" font-size="9" font-weight="700" fill="#15803d" text-anchor="middle">COOPERATIVE FACILITY</text>
        
        <text x="0" y="44" font-size="14" font-weight="800" fill="#0f172a">Seasonal Grain &amp; Tuber Working Capital</text>
        <text x="0" y="60" font-size="11" font-weight="600" fill="#15803d">Partner: Benue Agricultural Development Corp (BADC)</text>

        <!-- Short and Concise Description -->
        <text x="0" y="84" font-size="11" fill="#475569">Seasonal input financing for certified seeds and fertilizer</text>
        <text x="0" y="98" font-size="11" fill="#475569">with flexible harvest-linked repayment.</text>

        <!-- Product Financial Metrics Grid -->
        <g transform="translate(0, 112)">
          <rect x="0" y="0" width="326" height="66" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
          
          <g transform="translate(12, 18)">
            <text x="0" y="0" font-size="10" fill="#64748b">Facility Limit:</text>
            <text x="110" y="0" font-size="11" font-weight="800" fill="#0f172a">₦30,000 – ₦150,000</text>

            <text x="0" y="18" font-size="10" fill="#64748b">Indicative Rate:</text>
            <text x="110" y="18" font-size="11" font-weight="800" fill="#15803d">5% per harvest cycle</text>

            <text x="0" y="36" font-size="10" fill="#64748b">Repayment Terms:</text>
            <text x="110" y="36" font-size="11" font-weight="700" fill="#0f172a">120 days post-harvest</text>
          </g>
        </g>

        <!-- Muted Apply Button -->
        <g transform="translate(0, 192)">
          <rect x="0" y="0" width="326" height="38" rx="8" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
          <text x="163" y="24" font-size="12" font-weight="600" fill="#475569" text-anchor="middle">Apply with Cooperative →</text>
        </g>
      </g>
    </g>
  </g>
`);

// -----------------------------------------------------------------------------
// Screen 08: Grant Reviewer & Admin Quick Login (/register or /login)
// Features: Dropdown with pre-registered Reviewer, Admin, Farmer, Buyer, Carrier
// -----------------------------------------------------------------------------
const screen08 = frame('home', { showSubNav: false, hideBottomNav: true }, `
  <!-- Reviewer Instant Access Card (Dropdown Highlight) -->
  <g transform="translate(16, 12)">
    <rect x="0" y="0" width="358" height="186" rx="14" fill="#ffffff" stroke="#86efac" stroke-width="2"/>
    <g transform="translate(14, 16)">
      <rect x="0" y="0" width="180" height="22" rx="4" fill="#dcfce7"/>
      <text x="90" y="15" font-size="10" font-weight="800" fill="#15803d" text-anchor="middle">⚡ GRANT REVIEWER QUICK ACCESS</text>
      
      <text x="0" y="44" font-size="15" font-weight="800" fill="#0f172a">One-Click Demonstration Login</text>
      <text x="0" y="60" font-size="11" fill="#475569">Judges can log in directly without filling out registration forms.</text>

      <!-- Preset Dropdown Selector -->
      <g transform="translate(0, 72)">
        <rect x="0" y="0" width="330" height="42" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <text x="12" y="26" font-size="12" font-weight="700" fill="#0f172a">Grant Reviewer / Judge (08088888888)</text>
        <text x="306" y="26" font-size="12" fill="#64748b">▼</text>
      </g>

      <!-- One-Click Login Button -->
      <g transform="translate(0, 124)">
        <rect x="0" y="0" width="330" height="38" rx="8" fill="#15803d"/>
        <text x="165" y="24" font-size="13" font-weight="700" fill="#ffffff" text-anchor="middle">Log In as Grant Reviewer → Admin Portal</text>
      </g>
    </g>
  </g>

  <!-- Standard Registration Form (Below Dropdown) -->
  <g transform="translate(16, 214)">
    <rect x="0" y="0" width="358" height="360" rx="14" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <g transform="translate(14, 18)">
      <text x="0" y="14" font-size="16" font-weight="800" fill="#0f172a">Or Create a Pilot Account</text>
      <text x="0" y="30" font-size="11" fill="#64748b">Registered under Nigerian Data Protection Act (NDPA 2023)</text>

      <!-- Full Name Field -->
      <g transform="translate(0, 44)">
        <text x="0" y="12" font-size="11" font-weight="600" fill="#334155">Full Name</text>
        <rect x="0" y="18" width="330" height="36" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
        <text x="10" y="41" font-size="12" fill="#0f172a">Terna Aondover</text>
      </g>

      <!-- Phone Number Field -->
      <g transform="translate(0, 108)">
        <text x="0" y="12" font-size="11" font-weight="600" fill="#334155">Nigerian Phone Number</text>
        <rect x="0" y="18" width="330" height="36" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
        <text x="10" y="41" font-size="12" fill="#0f172a">08011111111</text>
      </g>

      <!-- Role Radios -->
      <g transform="translate(0, 172)">
        <text x="0" y="12" font-size="11" font-weight="600" fill="#334155">Account Role</text>
        <g transform="translate(0, 18)">
          <rect x="0" y="0" width="102" height="32" rx="6" fill="#ecfdf5" stroke="#15803d" stroke-width="1.5"/>
          <text x="51" y="20" font-size="11" font-weight="700" fill="#15803d" text-anchor="middle">Farmer</text>

          <rect x="114" y="0" width="102" height="32" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
          <text x="165" y="20" font-size="11" font-weight="600" fill="#475569" text-anchor="middle">Buyer</text>

          <rect x="228" y="0" width="102" height="32" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
          <text x="279" y="20" font-size="11" font-weight="600" fill="#475569" text-anchor="middle">Carrier</text>
        </g>
      </g>

      <!-- Password Field -->
      <g transform="translate(0, 236)">
        <text x="0" y="12" font-size="11" font-weight="600" fill="#334155">Password</text>
        <rect x="0" y="18" width="330" height="36" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
        <text x="10" y="41" font-size="12" fill="#0f172a">••••••••••••</text>
      </g>
    </g>
  </g>
`);

// -----------------------------------------------------------------------------
// Screen 09: Platform Administration & Pilot Audit Console (/admin)
// Features: Verification queue, dispute log, trade volume KPIs, audit trail
// -----------------------------------------------------------------------------
const screen09 = frame('home', { showSubNav: false, hideBottomNav: true }, `
  <!-- Top Admin Overview KPIs -->
  <g transform="translate(16, 12)">
    <rect x="0" y="0" width="358" height="98" rx="14" fill="#0f172a"/>
    <g transform="translate(14, 16)">
      <rect x="0" y="0" width="134" height="20" rx="4" fill="#1e293b"/>
      <text x="67" y="14" font-size="9" font-weight="700" fill="#4ade80" text-anchor="middle">ADMIN &amp; AUDIT CONSOLE</text>
      
      <!-- Metrics Grid -->
      <g transform="translate(0, 32)">
        <text x="0" y="16" font-size="18" font-weight="900" fill="#ffffff">142</text>
        <text x="0" y="32" font-size="10" fill="#94a3b8">Verified Farmers</text>

        <text x="110" y="16" font-size="18" font-weight="900" fill="#4ade80">₦18.4M</text>
        <text x="110" y="32" font-size="10" fill="#94a3b8">Trade Volume</text>

        <text x="230" y="16" font-size="18" font-weight="900" fill="#38bdf8">0</text>
        <text x="230" y="32" font-size="10" fill="#94a3b8">Open Disputes</text>
      </g>
    </g>
  </g>

  <!-- Farmer KYC Verification Queue -->
  <g transform="translate(16, 122)">
    <text x="0" y="16" font-size="14" font-weight="800" fill="#0f172a">Pending Farmer Verifications (2)</text>
    
    <g transform="translate(0, 26)">
      <rect x="0" y="0" width="358" height="114" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
      <g transform="translate(14, 14)">
        <text x="0" y="14" font-size="13" font-weight="800" fill="#0f172a">Aondover Kuma • Gboko LGA</text>
        <text x="0" y="30" font-size="11" fill="#475569">Document: Cooperative Membership Card (184 KB)</text>
        <text x="0" y="44" font-size="10" fill="#15803d">Status: Quality Check Passed • Farm Location Verified</text>
        
        <g transform="translate(0, 58)">
          <rect x="0" y="0" width="158" height="28" rx="6" fill="#15803d"/>
          <text x="79" y="18" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">✓ Approve Farmer</text>

          <rect x="170" y="0" width="158" height="28" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
          <text x="249" y="18" font-size="11" font-weight="600" fill="#64748b" text-anchor="middle">Review Document</text>
        </g>
      </g>
    </g>
  </g>

  <!-- Real-Time Audit Log Feed -->
  <g transform="translate(16, 280)">
    <text x="0" y="16" font-size="14" font-weight="800" fill="#0f172a">Immutable Audit Trail (Cryptographic)</text>
    
    <g transform="translate(0, 26)">
      <rect x="0" y="0" width="358" height="172" rx="12" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
      <g transform="translate(14, 16)">
        <!-- Entry 1 -->
        <text x="0" y="12" font-size="10" font-weight="700" fill="#15803d">10:42:15 • ORDER HANDOVER CONFIRMED</text>
        <text x="0" y="26" font-size="11" fill="#0f172a">Order ORD-202611-73921 handover PIN verified by driver.</text>
        
        <line x1="0" y1="36" x2="330" y2="36" stroke="#e2e8f0" stroke-width="1"/>

        <!-- Entry 2 -->
        <g transform="translate(0, 48)">
          <text x="0" y="12" font-size="10" font-weight="700" fill="#2563eb">10:15:02 • COUNTER-OFFER ACCEPTED</text>
          <text x="0" y="26" font-size="11" fill="#0f172a">Farmer accepted ₦32k/bag offer for 5,000kg Benue Yam.</text>
        </g>

        <line x1="0" y1="88" x2="330" y2="88" stroke="#e2e8f0" stroke-width="1"/>

        <!-- Entry 3 -->
        <g transform="translate(0, 100)">
          <text x="0" y="12" font-size="10" font-weight="700" fill="#475569">09:30:18 • REVIEWER LOGIN SUCCESS</text>
          <text x="0" y="26" font-size="11" fill="#0f172a">Grant reviewer session authenticated from 08088888888.</text>
        </g>
      </g>
    </g>
  </g>
`);

// -----------------------------------------------------------------------------
// Screen 10: Strategic Product Roadmap & Grant Timeline
// Features: Phased milestone execution for grant funding deployment
// -----------------------------------------------------------------------------
const screen10 = frame('home', { showSubNav: false, hideBottomNav: true }, `
  <!-- Roadmap Banner Card -->
  <g transform="translate(16, 12)">
    <rect x="0" y="0" width="358" height="96" rx="14" fill="#0f172a"/>
    <g transform="translate(14, 16)">
      <rect x="0" y="0" width="124" height="20" rx="4" fill="#1e293b"/>
      <text x="62" y="14" font-size="9" font-weight="700" fill="#4ade80" text-anchor="middle">GRANT MILESTONES</text>
      
      <text x="0" y="42" font-size="17" font-weight="800" fill="#ffffff">Strategic Product Roadmap</text>
      <text x="0" y="60" font-size="11" fill="#94a3b8">Post-grant technical milestones &amp; scale execution</text>
    </g>
  </g>

  <!-- Timeline Cards -->
  <g transform="translate(16, 120)">
    <!-- Phase 1: Completed MVP -->
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="358" height="98" rx="12" fill="#ffffff" stroke="#86efac" stroke-width="1.5"/>
      <g transform="translate(14, 14)">
        <rect x="0" y="0" width="80" height="18" rx="4" fill="#dcfce7"/>
        <text x="40" y="13" font-size="9" font-weight="700" fill="#15803d" text-anchor="middle">CURRENT MVP</text>
        <text x="90" y="13" font-size="11" font-weight="800" fill="#0f172a">Phase 1: Benue Direct Trade Pilot</text>
        <text x="0" y="38" font-size="11" fill="#334155">• Farm-gate listing &amp; structured offer negotiation</text>
        <text x="0" y="52" font-size="11" fill="#334155">• Official dispatch waybill &amp; 4-digit handover PIN</text>
        <text x="0" y="66" font-size="11" fill="#15803d" font-weight="700">✓ Production ready &amp; fully verified</text>
      </g>
    </g>

    <!-- Phase 2: USSD / Offline Integration -->
    <g transform="translate(0, 110)">
      <rect x="0" y="0" width="358" height="98" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <g transform="translate(14, 14)">
        <rect x="0" y="0" width="70" height="18" rx="4" fill="#f1f5f9"/>
        <text x="35" y="13" font-size="9" font-weight="700" fill="#475569" text-anchor="middle">Q1 2027</text>
        <text x="80" y="13" font-size="11" font-weight="800" fill="#0f172a">Phase 2: USSD &amp; SMS Trade Fallback</text>
        <text x="0" y="38" font-size="11" fill="#334155">• Non-smartphone USSD channel (*384*44#)</text>
        <text x="0" y="52" font-size="11" fill="#334155">• Tiv, Idoma, and Hausa interactive voice response</text>
        <text x="0" y="66" font-size="11" fill="#2563eb" font-weight="700">Grant Target: Cooperative USSD Gateway</text>
      </g>
    </g>

    <!-- Phase 3: Barter Clearinghouse & Credit -->
    <g transform="translate(0, 220)">
      <rect x="0" y="0" width="358" height="98" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <g transform="translate(14, 14)">
        <rect x="0" y="0" width="70" height="18" rx="4" fill="#f1f5f9"/>
        <text x="35" y="13" font-size="9" font-weight="700" fill="#475569" text-anchor="middle">Q2 2027</text>
        <text x="80" y="13" font-size="11" font-weight="800" fill="#0f172a">Phase 3: Barter Clearing &amp; Input Credit</text>
        <text x="0" y="38" font-size="11" fill="#334155">• Automated algorithmic commodity exchange ratios</text>
        <text x="0" y="52" font-size="11" fill="#334155">• Cooperative input lending with direct harvest clearing</text>
        <text x="0" y="66" font-size="11" fill="#b45309" font-weight="700">Grant Target: Zero-Custody Credit Pilot</text>
      </g>
    </g>

    <!-- Phase 4: State-wide Expansion -->
    <g transform="translate(0, 330)">
      <rect x="0" y="0" width="358" height="98" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <g transform="translate(14, 14)">
        <rect x="0" y="0" width="70" height="18" rx="4" fill="#f1f5f9"/>
        <text x="35" y="13" font-size="9" font-weight="700" fill="#475569" text-anchor="middle">Q3-Q4 2027</text>
        <text x="80" y="13" font-size="11" font-weight="800" fill="#0f172a">Phase 4: North-Central State Expansion</text>
        <text x="0" y="38" font-size="11" fill="#334155">• Scale across 23 Benue LGAs + Nasarawa &amp; Plateau</text>
        <text x="0" y="52" font-size="11" fill="#334155">• Perishable cold-chain logistics telematics tracking</text>
        <text x="0" y="66" font-size="11" fill="#15803d" font-weight="700">Grant Target: 10,000+ Onboarded Smallholders</text>
      </g>
    </g>
  </g>
`);

// List of screens to render
const screens = [
  { id: '01_home_farmer_mode', svg: screen01, title: 'Farmer Home Overview' },
  { id: '02_marketplace_discovery', svg: screen02, title: 'Produce Marketplace Discovery' },
  { id: '03_produce_listing_detail', svg: screen03, title: 'Produce Listing Detail' },
  { id: '04_orders_handover_waybill', svg: screen04, title: 'Confirmed Order & Handover Waybill' },
  { id: '05_logistics_transport_hub', svg: screen05, title: 'Logistics Corridor Hub' },
  { id: '06_barter_commodity_exchange', svg: screen06, title: 'Barter Commodity Exchange' },
  { id: '07_agricultural_finance', svg: screen07, title: 'Agricultural Finance & Policy' },
  { id: '08_reviewer_admin_quick_login', svg: screen08, title: 'Grant Reviewer Quick Login' },
  { id: '09_admin_audit_console', svg: screen09, title: 'Admin & Audit Console' },
  { id: '10_product_roadmap_timeline', svg: screen10, title: 'Product Roadmap Timeline' },
];

async function renderAll() {
  console.log(`Starting generation of ${screens.length} submission-ready grant screens...`);
  for (const s of screens) {
    const svgPath = path.join(outDir, `${s.id}.svg`);
    const pngPath = path.join(outDir, `${s.id}.png`);
    
    // Save SVG
    fs.writeFileSync(svgPath, s.svg, 'utf8');

    // Render 2x Retina PNG (780 x 1688 px)
    await sharp(Buffer.from(s.svg), { density: 144 })
      .png({ quality: 100 })
      .toFile(pngPath);

    console.log(`✓ Rendered: ${s.id}.png (2x Retina 780x1688)`);
  }
  console.log('All grant screenshots successfully rendered!');
}

renderAll().catch(err => {
  console.error('Fatal error generating grant screenshots:', err);
  process.exit(1);
});

