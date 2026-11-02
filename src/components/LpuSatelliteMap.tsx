import React from 'react';

interface LpuSatelliteMapProps {
  width: number;
  height: number;
  mode: 'satellite' | 'thermal' | 'blueprint';
}

export const LpuSatelliteMap: React.FC<LpuSatelliteMapProps> = ({ width, height, mode }) => {
  if (mode === 'blueprint') {
    return (
      <rect width={width} height={height} fill="#0b0f19" />
    );
  }

  const isThermal = mode === 'thermal';

  return (
    <g className="transition-opacity duration-500">
      <defs>
        {/* Lawn & Tree Canopy Texture */}
        <pattern id="campusLawn" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect width="60" height="60" fill={isThermal ? '#2c0b2b' : '#1e3a24'} />
          <circle cx="15" cy="15" r="7" fill={isThermal ? '#4c1143' : '#142c1b'} opacity="0.6" />
          <circle cx="45" cy="40" r="9" fill={isThermal ? '#671854' : '#274b30'} opacity="0.7" />
          <circle cx="40" cy="15" r="5" fill={isThermal ? '#531349' : '#1a3520'} opacity="0.5" />
        </pattern>

        {/* Asphalt Tarmac Texture */}
        <pattern id="asphaltTarmac" width="30" height="30" patternUnits="userSpaceOnUse">
          <rect width="30" height="30" fill={isThermal ? '#0f051d' : '#222831'} />
          <line x1="0" y1="15" x2="30" y2="15" stroke={isThermal ? '#30144d' : '#2b323d'} strokeWidth="1" strokeDasharray="3 3" />
        </pattern>

        {/* Rooftop Solar Grid */}
        <pattern id="solarRoof" width="16" height="12" patternUnits="userSpaceOnUse">
          <rect width="16" height="12" fill={isThermal ? '#e11d48' : '#0369a1'} />
          <rect x="1" y="1" width="14" height="10" fill={isThermal ? '#fb7185' : '#0284c7'} stroke={isThermal ? '#ffe4e6' : '#38bdf8'} strokeWidth="0.5" />
        </pattern>
      </defs>

      {/* 1. SATELLITE TERRAIN BASE (LPU Countryside & Punjab Plains) */}
      <rect 
        width={width} 
        height={height} 
        fill={isThermal ? '#130420' : '#192419'} 
      />

      {/* 2. GRAND TRUNK ROAD (GT ROAD / NH-1) - High-Speed National Highway along LPU Boundary */}
      {/* Highway Green Belt Buffer */}
      <polygon
        points={`0,320 0,440 260,680 180,720 0,540`}
        fill={isThermal ? '#1c0828' : '#1d331f'}
      />
      {/* GT Road Highway Asphalt Dual Carriageway */}
      <path
        d="M -20,290 L 160,520 L 320,760"
        stroke={isThermal ? '#3b0764' : '#1e242d'}
        strokeWidth="38"
        strokeLinecap="square"
      />
      {/* Highway Median & Road Markings */}
      <path
        d="M -20,290 L 160,520 L 320,760"
        stroke={isThermal ? '#f59e0b' : '#39414d'}
        strokeWidth="4"
      />
      <path
        d="M -20,282 L 160,512 L 320,752"
        stroke={isThermal ? '#e2e8f0' : '#ffffff'}
        strokeWidth="1.5"
        strokeDasharray="14 10"
        opacity="0.45"
      />
      <path
        d="M -20,298 L 160,528 L 320,768"
        stroke={isThermal ? '#e2e8f0' : '#ffffff'}
        strokeWidth="1.5"
        strokeDasharray="14 10"
        opacity="0.45"
      />
      {/* Highway Annotation */}
      <text
        x="60"
        y="420"
        fill={isThermal ? '#c084fc' : '#64748b'}
        fontSize="11"
        fontWeight="bold"
        fontFamily="sans-serif"
        transform="rotate(54 60 420)"
        letterSpacing="0.1em"
      >
        GT ROAD (NH-1) JALANDHAR-DELHI HIGHWAY
      </text>

      {/* 3. LPU INTERNAL BOULEVARDS & ARTERIAL NETWORK */}
      {/* Main Gateway Boulevard */}
      <path
        d="M 100,380 L 360,310 L 740,350 L 960,390"
        stroke={isThermal ? '#2e1065' : '#2d3748'}
        strokeWidth="24"
        strokeLinecap="round"
      />
      {/* North-South Academic Spine */}
      <path
        d="M 480,140 L 360,310 L 230,520 L 370,650"
        stroke={isThermal ? '#2e1065' : '#2d3748'}
        strokeWidth="20"
        strokeLinecap="round"
      />
      {/* Hostel Loop Ring */}
      <path
        d="M 620,220 L 940,170 L 960,390 L 820,540 L 550,440"
        stroke={isThermal ? '#2e1065' : '#2d3748'}
        strokeWidth="18"
        strokeLinecap="round"
      />

      {/* 4. LANDSCAPED CAMPUS PARKS & BOTANICAL LAWNS */}
      {/* Central Knowledge Park */}
      <ellipse
        cx="440"
        cy="380"
        rx="90"
        ry="60"
        fill="url(#campusLawn)"
        stroke={isThermal ? '#4a044e' : '#142c1a'}
        strokeWidth="2"
      />
      {/* Botanical Garden behind Food Court */}
      <path
        d="M 650,290 Q 720,260 790,300 T 780,410 Q 690,420 650,290 Z"
        fill="url(#campusLawn)"
      />
      {/* Girls Hostels Courtyard Green */}
      <rect
        x="890"
        y="420"
        width="110"
        height="80"
        rx="14"
        fill="url(#campusLawn)"
      />

      {/* 5. PHOTOREALISTIC 3D ROOFTOPS OF ICONIC LPU BUILDINGS */}
      
      {/* (A) UNIPOLIS - Iconic Circular Multi-Tiered Dome Amphitheater */}
      <g transform="translate(550, 440)">
        {/* Outer Circular Grand Dome Rim */}
        <circle r="46" fill={isThermal ? '#dc2626' : '#cbd5e1'} stroke={isThermal ? '#f87171' : '#94a3b8'} strokeWidth="2" />
        {/* Tiered Concentric Radial Roof Segments */}
        <circle r="36" fill={isThermal ? '#f97316' : '#e2e8f0'} stroke={isThermal ? '#fb923c' : '#cbd5e1'} strokeWidth="1.5" />
        <circle r="26" fill={isThermal ? '#ea580c' : '#f1f5f9'} stroke={isThermal ? '#fdba74' : '#e2e8f0'} strokeWidth="1.2" />
        <circle r="14" fill={isThermal ? '#facc15' : '#38bdf8'} />
        {/* Radial Truss Spoke Lines */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
          <line
            key={deg}
            x1="0"
            y1="0"
            x2={Math.cos((deg * Math.PI) / 180) * 44}
            y2={Math.sin((deg * Math.PI) / 180) * 44}
            stroke={isThermal ? '#7c2d12' : '#94a3b8'}
            strokeWidth="1"
          />
        ))}
      </g>

      {/* (B) CENTRAL LIBRARY - 9-Story Distinctive Multi-Wing Complex */}
      <g transform="translate(360, 310)">
        <polygon
          points="-42,-28 42,-28 32,28 -32,28"
          fill={isThermal ? '#831843' : '#475569'}
          stroke={isThermal ? '#be185d' : '#64748b'}
          strokeWidth="2"
        />
        <rect x="-24" y="-18" width="48" height="36" fill="url(#solarRoof)" />
      </g>

      {/* (C) CSE BLOCK & ENGINEERING QUAD */}
      <g transform="translate(480, 140)">
        <rect x="-44" y="-24" width="88" height="48" rx="4" fill={isThermal ? '#701a75' : '#334155'} stroke={isThermal ? '#a21caf' : '#475569'} strokeWidth="2" />
        <rect x="-36" y="-18" width="72" height="36" fill="url(#solarRoof)" />
      </g>

      {/* (D) UNIHOSPITAL & TRAUMA CENTER */}
      <g transform="translate(370, 650)">
        {/* Hospital Wing */}
        <polygon
          points="-40,-20 40,-20 40,24 -40,24"
          fill={isThermal ? '#991b1b' : '#e2e8f0'}
          stroke={isThermal ? '#ef4444' : '#cbd5e1'}
          strokeWidth="2"
        />
        {/* Helipad Red Cross */}
        <rect x="-18" y="-4" width="36" height="8" fill="#ef4444" rx="2" />
        <rect x="-4" y="-18" width="8" height="36" fill="#ef4444" rx="2" />
      </g>

      {/* (E) UNIMALL & LIFESTYLE SHOPPING COMPLEX */}
      <g transform="translate(820, 540)">
        <polygon
          points="-38,-28 44,-20 36,32 -42,24"
          fill={isThermal ? '#581c87' : '#64748b'}
          stroke={isThermal ? '#7e22ce' : '#94a3b8'}
          strokeWidth="2"
        />
        <rect x="-26" y="-14" width="52" height="28" fill="url(#solarRoof)" opacity="0.8" />
      </g>

      {/* (F) BOYS HOSTELS (BH1 - BH7 Grid Towers) */}
      <g transform="translate(940, 170)">
        {/* Block A */}
        <rect x="-48" y="-32" width="38" height="24" rx="3" fill={isThermal ? '#431407' : '#475569'} />
        {/* Block B */}
        <rect x="6" y="-32" width="38" height="24" rx="3" fill={isThermal ? '#431407' : '#475569'} />
        {/* Block C */}
        <rect x="-48" y="4" width="38" height="24" rx="3" fill={isThermal ? '#431407' : '#475569'} />
        {/* Block D */}
        <rect x="6" y="4" width="38" height="24" rx="3" fill={isThermal ? '#431407' : '#475569'} />
      </g>

      {/* (G) GIRLS HOSTELS (GH Complex) */}
      <g transform="translate(960, 390)">
        <rect x="-44" y="-34" width="40" height="26" rx="3" fill={isThermal ? '#500724' : '#475569'} />
        <rect x="4" y="-34" width="40" height="26" rx="3" fill={isThermal ? '#500724' : '#475569'} />
        <rect x="-24" y="2" width="48" height="26" rx="3" fill={isThermal ? '#500724' : '#475569'} />
      </g>

      {/* (H) MAIN FOOD COURT (Pedestrian Plaza with Umbrellas) */}
      <g transform="translate(740, 350)">
        <circle r="34" fill={isThermal ? '#7c2d12' : '#334155'} />
        <rect x="-22" y="-14" width="44" height="28" rx="4" fill={isThermal ? '#c2410c' : '#f97316'} opacity="0.6" />
        {/* Patio Umbrella Dots */}
        {[-14, 0, 14].map(x => (
          [-10, 10].map(y => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="#ffffff" opacity="0.8" />
          ))
        ))}
      </g>

      {/* (I) PARKING ZONE (Tarmac with Marked Parking Bays) */}
      <g transform="translate(140, 170)">
        <rect x="-42" y="-32" width="84" height="64" rx="6" fill="url(#asphaltTarmac)" stroke={isThermal ? '#38bdf8' : '#64748b'} strokeWidth="1.5" />
        {/* Parked Cars Dots */}
        {[-26, -10, 6, 22].map((x, i) => (
          <React.Fragment key={x}>
            <rect x={x} y="-22" width="9" height="15" rx="2" fill={['#38bdf8', '#f8fafc', '#ef4444', '#cbd5e1'][i % 4]} />
            <rect x={x} y="6" width="9" height="15" rx="2" fill={['#f8fafc', '#38bdf8', '#e2e8f0', '#fbbf24'][i % 4]} />
          </React.Fragment>
        ))}
      </g>

      {/* 6. SHANTI DEVI MITTAL OLYMPIC SPORTS STADIUM & ATHLETIC RUNNING TRACK */}
      <g transform="translate(560, 630)">
        {/* Oval Running Track (Red Tartan Surface) */}
        <ellipse cx="0" cy="0" rx="68" ry="42" fill={isThermal ? '#7f1d1d' : '#991b1b'} />
        {/* Lane Lines */}
        <ellipse cx="0" cy="0" rx="62" ry="36" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
        <ellipse cx="0" cy="0" rx="56" ry="30" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
        {/* Football Turf Infield */}
        <ellipse cx="0" cy="0" rx="48" ry="24" fill={isThermal ? '#14532d' : '#15803d'} />
        {/* Field Markings */}
        <circle cx="0" cy="0" r="8" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.8" />
        <line x1="0" y1="-24" x2="0" y2="24" stroke="#ffffff" strokeWidth="0.8" opacity="0.8" />
      </g>

      {/* 7. CAMPUS TREE LINES & CANOPY HEDGEROWS (Photorealistic Overhead Greenery) */}
      {[
        [200, 340], [220, 360], [240, 380], [260, 400], [280, 420],
        [400, 200], [420, 220], [440, 240], [460, 260],
        [680, 160], [700, 170], [720, 180], [740, 190], [760, 200],
        [880, 280], [890, 310], [900, 340], [910, 370],
        [320, 440], [340, 460], [360, 480], [380, 500]
      ].map(([x, y], idx) => (
        <circle
          key={idx}
          cx={x}
          cy={y}
          r={7 + (idx % 4)}
          fill={isThermal ? '#3b0764' : '#1b4324'}
          opacity="0.8"
        />
      ))}
    </g>
  );
};

