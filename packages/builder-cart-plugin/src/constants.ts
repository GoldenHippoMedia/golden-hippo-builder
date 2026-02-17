export const pluginId = '@goldenhippo/hippo-commerce-builder-cart-plugin';

// Golden hippo head with shopping cart — inline SVG data URI so it never breaks
export const pluginIcon = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <!-- Cart body -->
  <path d="M12 20h4l6 22h24l6-16H22" stroke="#C8A951" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M22 42h24l6-16H18Z" fill="#C8A951" opacity="0.15"/>
  <!-- Cart wheels -->
  <circle cx="26" cy="48" r="3.5" stroke="#C8A951" stroke-width="2" fill="#B8993D"/>
  <circle cx="46" cy="48" r="3.5" stroke="#C8A951" stroke-width="2" fill="#B8993D"/>
  <!-- Hippo head (in cart) -->
  <g transform="translate(24, 6) scale(0.38)">
    <ellipse cx="32" cy="34" rx="22" ry="18" fill="#C8A951"/>
    <ellipse cx="32" cy="46" rx="14" ry="10" fill="#B8993D"/>
    <ellipse cx="26" cy="46" rx="3" ry="2.5" fill="#2A2A2A"/>
    <ellipse cx="38" cy="46" rx="3" ry="2.5" fill="#2A2A2A"/>
    <circle cx="22" cy="28" r="4" fill="#2A2A2A"/>
    <circle cx="42" cy="28" r="4" fill="#2A2A2A"/>
    <circle cx="23" cy="27" r="1.5" fill="#FFFFFF"/>
    <circle cx="43" cy="27" r="1.5" fill="#FFFFFF"/>
    <ellipse cx="12" cy="20" rx="6" ry="8" fill="#C8A951" transform="rotate(-15 12 20)"/>
    <ellipse cx="52" cy="20" rx="6" ry="8" fill="#C8A951" transform="rotate(15 52 20)"/>
    <ellipse cx="12" cy="20" rx="3.5" ry="5" fill="#B8993D" transform="rotate(-15 12 20)"/>
    <ellipse cx="52" cy="20" rx="3.5" ry="5" fill="#B8993D" transform="rotate(15 52 20)"/>
  </g>
</svg>`)}`;
