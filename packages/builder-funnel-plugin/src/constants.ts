export const pluginId = '@goldenhippo/hippo-funnel-builder-plugin';

// Golden hippo head silhouette with funnel — inline SVG data URI so it never breaks
export const pluginIcon = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <!-- Funnel body -->
  <path d="M8 12h48l-14 20v16l-4 4h-12l-4-4V32Z" fill="#C8A951" opacity="0.15"/>
  <path d="M8 12h48l-14 20v16l-4 4h-12l-4-4V32Z" stroke="#C8A951" stroke-width="2.5" stroke-linejoin="round" fill="none"/>
  <!-- Funnel liquid lines -->
  <path d="M16 18h32" stroke="#C8A951" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
  <path d="M20 24h24" stroke="#C8A951" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>
  <!-- Hippo head -->
  <g transform="translate(18, 2) scale(0.44)">
    <!-- Head shape -->
    <ellipse cx="32" cy="34" rx="22" ry="18" fill="#C8A951"/>
    <!-- Snout -->
    <ellipse cx="32" cy="46" rx="14" ry="10" fill="#B8993D"/>
    <!-- Nostrils -->
    <ellipse cx="26" cy="46" rx="3" ry="2.5" fill="#2A2A2A"/>
    <ellipse cx="38" cy="46" rx="3" ry="2.5" fill="#2A2A2A"/>
    <!-- Eyes -->
    <circle cx="22" cy="28" r="4" fill="#2A2A2A"/>
    <circle cx="42" cy="28" r="4" fill="#2A2A2A"/>
    <circle cx="23" cy="27" r="1.5" fill="#FFFFFF"/>
    <circle cx="43" cy="27" r="1.5" fill="#FFFFFF"/>
    <!-- Ears -->
    <ellipse cx="12" cy="20" rx="6" ry="8" fill="#C8A951" transform="rotate(-15 12 20)"/>
    <ellipse cx="52" cy="20" rx="6" ry="8" fill="#C8A951" transform="rotate(15 52 20)"/>
    <ellipse cx="12" cy="20" rx="3.5" ry="5" fill="#B8993D" transform="rotate(-15 12 20)"/>
    <ellipse cx="52" cy="20" rx="3.5" ry="5" fill="#B8993D" transform="rotate(15 52 20)"/>
  </g>
  <!-- Drops coming out of funnel bottom -->
  <circle cx="32" cy="56" r="2" fill="#C8A951" opacity="0.6"/>
  <circle cx="32" cy="61" r="1.5" fill="#C8A951" opacity="0.4"/>
</svg>`)}`;
