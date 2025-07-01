// script.js

// Converts hex color (#RRGGBB) to RGBA string
function hexToRgba(hex, alpha = 1) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Converts RGB to HSL
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch(max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h /= 6;
  }
  return [h,s,l];
}

// Converts HSL to RGB
function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    function hue2rgb(p, q, t) {
      if(t < 0) t += 1;
      if(t > 1) t -= 1;
      if(t < 1/6) return p + (q - p)*6*t;
      if(t < 1/2) return q;
      if(t < 2/3) return p + (q - p)*(2/3 - t)*6;
      return p;
    }
    const q = l < 0.5 ? l*(1+s) : l + s - l*s;
    const p = 2*l - q;
    r = hue2rgb(p, q, h+1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h-1/3);
  }
  return [ Math.round(r*255), Math.round(g*255), Math.round(b*255) ];
}

// hex string to RGB object {r,g,b}
function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c+c).join('');
  }
  const bigint = parseInt(hex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

// converts r,g,b (0-255) to hex string #RRGGBB
function rgbToHex(r, g, b) {
  const hex = c => c.toString(16).padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

// Convert hue (0-1), saturation(0-1), lightness(0-1) into HSL string format "hsl(h, s%, l%)"
function hslToString(h, s, l) {
  const hue = Math.round(h * 360);
  const sat = Math.round(s * 100);
  const light = Math.round(l * 100);
  return `hsl(${hue}, ${sat}%, ${light}%)`;
}

// Generate palette for primary, 3 usage colors, and optional secondary color
// Dark theme flag chooses alternate generation logic
function generateFunctionalPalette(baseHex, darkMode = false) {
  // Convert base color to HSL
  const baseRgb = hexToRgb(baseHex);
  let [h, s, l] = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);

  // Helper to fix hue within [0,1]
  function fixHue(hue) {
    if (hue < 0) return hue + 1;
    if (hue > 1) return hue - 1;
    return hue;
  }

  // For light theme:
  if (!darkMode) {
    // PRIMARY: base color adjusted slightly for highlight effect
    const primaryS = Math.min(1, Math.max(s, 0.6));
    let primaryL = l;
    if(primaryL < 0.3) primaryL = 0.35; else if(primaryL > 0.7) primaryL = 0.65;
    const primaryRGB = hslToRgb(h, primaryS, primaryL);
    const primaryHex = rgbToHex(...primaryRGB);

    // TEXT: choose a color for text: usually dark color
    const textL = Math.min(0.25, l * 0.4);
    const textS = s > 0.1 ? Math.min(0.5, s * 0.6) : 0;
    const textRGB = hslToRgb(h, textS, textL);
    const textHex = rgbToHex(...textRGB);

    // BACKGROUND: light color with fixed lightness at 0.95, saturation reduced
    const backgroundL = 0.95;
    let backgroundS = s * 0.15;
    if(backgroundS < 0.05) backgroundS = 0;
    const backgroundRGB = hslToRgb(h, backgroundS, backgroundL);
    const backgroundHex = rgbToHex(...backgroundRGB);

    // SECONDARY BACKGROUND: a light version of primary color
    // Use same hue and saturation as primary, but very light (around 92-95% lightness)
    const secBgL = 0.9;
    const secBgS = primaryS * 0.69;
    const secondaryBgRGB = hslToRgb(h, secBgS, secBgL);
    const secondaryBackgroundHex = rgbToHex(...secondaryBgRGB);

    // SECONDARY COLOR: contrast accent with distinct hue, lower saturation, moderate lightness
    // We'll do a complementary-ish hue (base h + 0.4) with lower saturation and medium lightness (~40%)
    const secondaryHue = fixHue(h + 0.4);
    const secondaryS = 0.2;
    const secondaryL = 0.4;
    const secondaryRGB = hslToRgb(secondaryHue, secondaryS, secondaryL);
    const secondaryHex = rgbToHex(...secondaryRGB);

    return {
      primary: primaryHex,
      primaryHSL: hslToString(h, primaryS, primaryL),
      text: textHex,
      textHSL: hslToString(h, textS, textL),
      background: backgroundHex,
      backgroundHSL: hslToString(h, backgroundS, backgroundL),
      secondaryBackground: secondaryBackgroundHex,
      secondaryBackgroundHSL: hslToString(h, secBgS, secBgL),
      secondary: secondaryHex,
      secondaryHSL: hslToString(secondaryHue, secondaryS, secondaryL),
      // also return H, S, L of primary for setting CSS variables easily
      primaryH: Math.round(h*360),
      primaryS: Math.round(primaryS*100),
      primaryL: Math.round(primaryL*100),
      secondaryBgH: Math.round(h*360),
      secondaryBgS: Math.round(secBgS*100),
      secondaryBgL: Math.round(secBgL*100)
    };
  } else {
    // DARK MODE palette generation

    // For dark theme - mostly Dark backgrounds, bright text

    // PRIMARY: Attempt a brighter and more saturated version, but keep lightness moderate-high (~0.7)
    let primaryS = Math.min(1, Math.max(s, 0.7));
    let primaryL = l;
    if(primaryL < 0.4) primaryL = 0.7;
    else if (primaryL > 0.8) primaryL = 0.65;
    const primaryRGB = hslToRgb(h, primaryS, primaryL);
    const primaryHex = rgbToHex(...primaryRGB);

    // TEXT: mostly light color for good contrast on dark bg
    // Use very light lightness with moderate saturation
    const textL = 0.85;
    const textS = 0.4;
    const textRGB = hslToRgb(h, textS, textL);
    const textHex = rgbToHex(...textRGB);

    // BACKGROUND: dark color with low saturation and lightness about 0.12 to 0.18
    let backgroundL = 0.14;
    let backgroundS = s * 0.10;
    if (backgroundS < 0.05) backgroundS = 0;
    const backgroundRGB = hslToRgb(h, backgroundS, backgroundL);
    const backgroundHex = rgbToHex(...backgroundRGB);

    // SECONDARY BACKGROUND: slightly lighter dark background (about 20-23% lightness)
    const secBgL = 0.22;
    const secBgS = primaryS * 0.2;
    const secondaryBgRGB = hslToRgb(h, secBgS, secBgL);
    const secondaryBackgroundHex = rgbToHex(...secondaryBgRGB);

    // SECONDARY COLOR: distinct accent: complementary-ish hue, higher saturation and lightness than background but less than primary
    const secondaryHue = fixHue(h + 0.4);
    const secondaryS = 0.5;
    const secondaryL = 0.55;
    const secondaryRGB = hslToRgb(secondaryHue, secondaryS, secondaryL);
    const secondaryHex = rgbToHex(...secondaryRGB);

    return {
      primary: primaryHex,
      primaryHSL: hslToString(h, primaryS, primaryL),
      text: textHex,
      textHSL: hslToString(h, textS, textL),
      background: backgroundHex,
      backgroundHSL: hslToString(h, backgroundS, backgroundL),
      secondaryBackground: secondaryBackgroundHex,
      secondaryBackgroundHSL: hslToString(h, secBgS, secBgL),
      secondary: secondaryHex,
      secondaryHSL: hslToString(secondaryHue, secondaryS, secondaryL),
      // also return H, S, L of primary for setting CSS variables easily
      primaryH: Math.round(h*360),
      primaryS: Math.round(primaryS*100),
      primaryL: Math.round(primaryL*100),
      secondaryBgH: Math.round(h*360),
      secondaryBgS: Math.round(secBgS*100),
      secondaryBgL: Math.round(secBgL*100)
    };
  }
}

// Copy text to clipboard and show tooltip on element
function copyText(e) {
  const el = e.currentTarget;
  const text = el.textContent.trim();
  navigator.clipboard.writeText(text).then(() => {
    showTooltip(el, 'Copied!');
  }, () => {
    showTooltip(el, 'Failed to copy');
  });
}

// Show a small tooltip near the element that fades out
function showTooltip(el, message) {
  let tooltip = el.parentElement.querySelector('.copy-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('span');
    tooltip.className = 'copy-tooltip';
    el.parentElement.appendChild(tooltip);
    tooltip.style.position = 'absolute';
    tooltip.style.left = '50%';
    tooltip.style.top = '0';
    tooltip.style.transform = 'translate(-50%, -150%)';
    tooltip.style.pointerEvents = 'none';
  }
  tooltip.textContent = message;
  tooltip.classList.add('visible');
  setTimeout(() => {
    tooltip.classList.remove('visible');
  }, 1200);
}

// Creates a single color card element from a hex color and a descriptive purpose
function createColorCard(hex, purpose, hsl) {
  const template = document.getElementById('colorCardTemplate');
  const card = template.content.firstElementChild.cloneNode(true);
  const swatch = card.querySelector('.color-swatch');
  const hexDiv = card.querySelector('.color-hex');
  const rgbaDiv = card.querySelector('.color-rgba');
  const purposeDiv = card.querySelector('.color-purpose');
  const hslDiv = card.querySelector('.color-hsl');

  swatch.style.backgroundColor = hex;

  hexDiv.textContent = hex.toUpperCase();
  hexDiv.setAttribute('aria-label', `HEX color code ${hex.toUpperCase()}, click to copy`);

  rgbaDiv.textContent = hexToRgba(hex);
  rgbaDiv.setAttribute('aria-label', `RGBA color code ${rgbaDiv.textContent}, click to copy`);

  hslDiv.textContent = hsl;
  hslDiv.setAttribute('aria-label', `HSL color code ${hsl}, click to copy`);

  purposeDiv.textContent = purpose;

  hexDiv.addEventListener('click', copyText);
  hexDiv.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      copyText(e);
    }
  });

  rgbaDiv.addEventListener('click', copyText);
  rgbaDiv.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      copyText(e);
    }
  });

  hslDiv.addEventListener('click', copyText);
  hslDiv.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      copyText(e);
    }
  });

  // Position tooltip container relative
  card.style.position = 'relative';

  return card;
}

// Utility function for luminance (WCAG)
function getLuminance(r,g,b) {
  const a = [r,g,b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4);
  });
  return 0.2126*a[0] + 0.7152*a[1] + 0.0722*a[2];
}

// Update CSS variables on root for colors dynamically, with darkMode flag
function updateCssVariables(paletteObj, darkMode=false) {
  const root = document.documentElement;

  root.style.setProperty('--color-primary', paletteObj.primary);
  root.style.setProperty('--color-text', paletteObj.text);
  root.style.setProperty('--color-background', paletteObj.background);
  root.style.setProperty('--color-secondary-background', paletteObj.secondaryBackground);
  root.style.setProperty('--color-secondary', paletteObj.secondary);

  // Set HSL parts for primary and secondary background for tooltip and hover uses
  root.style.setProperty('--color-primary-h', paletteObj.primaryH);
  root.style.setProperty('--color-primary-s', `${paletteObj.primaryS}%`);
  root.style.setProperty('--color-primary-l', `${paletteObj.primaryL}%`);

  root.style.setProperty('--color-secondary-background-h', paletteObj.secondaryBgH);
  root.style.setProperty('--color-secondary-background-s', `${paletteObj.secondaryBgS}%`);
  root.style.setProperty('--color-secondary-background-l', `${paletteObj.secondaryBgL}%`);

  // Button colors
  root.style.setProperty('--btn-bg', paletteObj.primary);
  root.style.setProperty('--btn-text', paletteObj.background);

  // Calculate shadows color using rgba and luminance for accessibility
  // Base shadow color derived from primary
  const primaryRgb = hexToRgb(paletteObj.primary);
  const backgroundRgb = hexToRgb(paletteObj.background);

  // Compute luminance for bg & primary to decide text color for buttons
  const bgLum = getLuminance(backgroundRgb.r, backgroundRgb.g, backgroundRgb.b);
  const primaryLum = getLuminance(primaryRgb.r, primaryRgb.g, primaryRgb.b);

  // Shadow colors with alpha for softer effect
  root.style.setProperty('--btn-shadow', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.3)`);
  
  let btnHoverColor = shadeColor(paletteObj.primary, -20);
  // In dark mode, if shadeColor goes too dark, lighten instead to maintain better contrast
  if(darkMode){
    const hoverRgbTest = hexToRgb(btnHoverColor);
    const lumTest = getLuminance(hoverRgbTest.r, hoverRgbTest.g, hoverRgbTest.b);
    if(lumTest < 0.05) {
      btnHoverColor = shadeColor(paletteObj.primary, 20); // lighten instead
    }
  }
  root.style.setProperty('--btn-hover-bg', btnHoverColor);
  
  const hoverRgb = hexToRgb(btnHoverColor);
  root.style.setProperty('--btn-hover-shadow', `rgba(${hoverRgb.r}, ${hoverRgb.g}, ${hoverRgb.b}, 0.5)`);

  // Button text color contrast: if bg is very light use dark text, else use background color
  if (bgLum > 0.9) {
    root.style.setProperty('--btn-text', '#222');
  } else {
    root.style.setProperty('--btn-text', paletteObj.background);
  }

  // Controls label color adjust to text color for contrast
  document.querySelector('#controls label').style.color = paletteObj.text;

  // Also update box-shadow custom property for the main container, lighter or darker as per theme
  if (darkMode) {
    // Darker box-shadow for dark background
    root.style.setProperty('--box-shadow', `0 2px 2px rgba(0,0,0,0.1), 0 4px 4px rgba(0,0,0,0.05)`);
  } else {
    root.style.setProperty('--box-shadow', `0 2px 2px hsla(${paletteObj.primaryH}, 50%, 10%, .1), 0 4px 4px hsla(${paletteObj.primaryH}, 50%, 10%, .05)`);
  }
}

// Helper to shade color by a percent (-20 = 20% darker, 20 = 20% lighter)
function shadeColor(hex, percent) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c+c).join('');
  }
  let r = parseInt(hex.substring(0,2),16);
  let g = parseInt(hex.substring(2,4),16);
  let b = parseInt(hex.substring(4,6),16);

  r = Math.min(255, Math.max(0, Math.round(r * (100 + percent) / 100)));
  g = Math.min(255, Math.max(0, Math.round(g * (100 + percent) / 100)));
  b = Math.min(255, Math.max(0, Math.round(b * (100 + percent) / 100)));

  const toHex = v => v.toString(16).padStart(2,'0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

document.addEventListener('DOMContentLoaded', () => {
  const baseColorInput = document.getElementById('baseColor');
  const generateBtn = document.getElementById('generateBtn');
  const paletteContainer = document.getElementById('palette');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  let darkMode = false;

  function generateAndShow() {
    const baseColor = baseColorInput.value;
    const paletteObj = generateFunctionalPalette(baseColor, darkMode);
    paletteContainer.innerHTML = '';
    const entries = [
      {hex: paletteObj.primary, label: 'Primary (Highlight)', hsl: paletteObj.primaryHSL},
      {hex: paletteObj.text, label: 'Text', hsl: paletteObj.textHSL},
      {hex: paletteObj.background, label: 'Background', hsl: paletteObj.backgroundHSL},
      {hex: paletteObj.secondaryBackground, label: 'Secondary Background', hsl: paletteObj.secondaryBackgroundHSL},
      {hex: paletteObj.secondary, label: 'Secondary (Accent)', hsl: paletteObj.secondaryHSL},
    ];
    entries.forEach(({hex, label, hsl}) => {
      const card = createColorCard(hex, label, hsl);
      paletteContainer.appendChild(card);
    });

    updateCssVariables(paletteObj, darkMode);

    // Update body class according to dark mode
    if(darkMode){
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  generateBtn.addEventListener('click', generateAndShow);
  baseColorInput.addEventListener('change', generateAndShow);
  baseColorInput.addEventListener('input', generateAndShow);

  themeToggleBtn.addEventListener('click', () => {
    darkMode = !darkMode;
    themeToggleBtn.textContent = darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    themeToggleBtn.setAttribute('aria-pressed', darkMode.toString());
    generateAndShow();
  });

  // Generate initial palette on load
  generateAndShow();
});