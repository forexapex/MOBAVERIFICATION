import sharp from 'sharp';
import fs from 'fs';

interface AccountDetails {
  gameId: string;
  server: string;
  gameName: string;
  region: string;
  rank: string;
  level: string;
  status: string;
}

export async function generateAccountDetailsCard(
  characterImagePath: string,
  details: AccountDetails
): Promise<Buffer> {
  try {
    // Card dimensions - wider for better layout
    const cardWidth = 1200;
    const cardHeight = 600;
    const backgroundColor = '#0a1428'; // Dark blue MLBB style

    // SVG with futuristic design
    const svg = `
      <svg width="${cardWidth}" height="${cardHeight}" xmlns="http://www.w3.org/2000/svg">
        <!-- Main background -->
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0a1428;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1a2a3a;stop-opacity:1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <rect width="${cardWidth}" height="${cardHeight}" fill="url(#bgGradient)"/>
        
        <!-- LEFT SIDE: Circular frame with character image -->
        <!-- Outer decorative circles -->
        <circle cx="200" cy="300" r="165" fill="none" stroke="#FFA500" stroke-width="3" opacity="0.6" filter="url(#glow)"/>
        <circle cx="200" cy="300" r="160" fill="none" stroke="#00D4FF" stroke-width="2" opacity="0.8" filter="url(#glow)"/>
        <circle cx="200" cy="300" r="155" fill="none" stroke="#FFA500" stroke-width="1" opacity="0.4"/>
        
        <!-- Inner dark circle for image -->
        <circle cx="200" cy="300" r="145" fill="#0a0f1a" stroke="#00D4FF" stroke-width="2" opacity="0.6"/>
        
        <!-- Decorative corner elements -->
        <g opacity="0.8">
          <circle cx="65" cy="165" r="8" fill="#FFA500" filter="url(#glow)"/>
          <circle cx="335" cy="165" r="8" fill="#FFA500" filter="url(#glow)"/>
          <circle cx="65" cy="435" r="8" fill="#00D4FF" filter="url(#glow)"/>
          <circle cx="335" cy="435" r="8" fill="#00D4FF" filter="url(#glow)"/>
        </g>
        
        <!-- Decorative lines -->
        <line x1="200" y1="120" x2="200" y2="100" stroke="#00D4FF" stroke-width="2" opacity="0.6"/>
        <line x1="200" y1="500" x2="200" y2="520" stroke="#FFA500" stroke-width="2" opacity="0.6"/>
        <line x1="80" y1="300" x2="60" y2="300" stroke="#00D4FF" stroke-width="2" opacity="0.6"/>
        <line x1="320" y1="300" x2="340" y2="300" stroke="#FFA500" stroke-width="2" opacity="0.6"/>
        
        <!-- RIGHT SIDE: Account Details Panel -->
        <!-- Main panel border and background -->
        <rect x="420" y="40" width="750" height="520" fill="none" stroke="#00D4FF" stroke-width="3" opacity="0.7" filter="url(#glow)"/>
        <rect x="425" y="45" width="740" height="510" fill="none" stroke="#FFA500" stroke-width="1" opacity="0.5"/>
        
        <!-- Header section -->
        <rect x="420" y="40" width="750" height="70" fill="#00D4FF" opacity="0.1"/>
        <text x="450" y="85" font-size="36" font-weight="bold" fill="#00D4FF" font-family="Arial, sans-serif" filter="url(#glow)">ACCOUNT DETAILS</text>
        
        <!-- Divider line -->
        <line x1="420" y1="115" x2="1170" y2="115" stroke="#FFA500" stroke-width="2" opacity="0.7"/>
        
        <!-- Field labels and values -->
        <!-- Game ID -->
        <text x="450" y="155" font-size="14" fill="#999999" font-family="Arial, sans-serif" font-weight="bold">Game ID</text>
        <rect x="450" y="165" width="680" height="32" fill="none" stroke="#00D4FF" stroke-width="1" opacity="0.4" rx="2"/>
        <text x="465" y="190" font-size="16" fill="#FFFFFF" font-family="Arial, sans-serif">${details.gameId}</text>
        
        <!-- Server -->
        <text x="450" y="230" font-size="14" fill="#999999" font-family="Arial, sans-serif" font-weight="bold">Server</text>
        <rect x="450" y="240" width="680" height="32" fill="none" stroke="#00D4FF" stroke-width="1" opacity="0.4" rx="2"/>
        <text x="465" y="265" font-size="16" fill="#FFFFFF" font-family="Arial, sans-serif">${details.server}</text>
        
        <!-- In Game Name -->
        <text x="450" y="305" font-size="14" fill="#999999" font-family="Arial, sans-serif" font-weight="bold">In Game Name</text>
        <rect x="450" y="315" width="680" height="32" fill="none" stroke="#00D4FF" stroke-width="1" opacity="0.4" rx="2"/>
        <text x="465" y="340" font-size="16" fill="#FFFFFF" font-family="Arial, sans-serif">${details.gameName}</text>
        
        <!-- Region -->
        <text x="450" y="380" font-size="14" fill="#999999" font-family="Arial, sans-serif" font-weight="bold">Region</text>
        <rect x="450" y="390" width="680" height="32" fill="none" stroke="#00D4FF" stroke-width="1" opacity="0.4" rx="2"/>
        <text x="465" y="415" font-size="16" fill="#FFFFFF" font-family="Arial, sans-serif">${details.region}</text>
        
        <!-- Stats row -->
        <line x1="420" y1="460" x2="1170" y2="460" stroke="#FFA500" stroke-width="1" opacity="0.5"/>
        
        <text x="450" y="495" font-size="13" fill="#FFA500" font-family="Arial, sans-serif" font-weight="bold">⭐ Rank</text>
        <text x="450" y="520" font-size="15" fill="#FFFFFF" font-family="Arial, sans-serif">${details.rank}</text>
        
        <text x="680" y="495" font-size="13" fill="#FFA500" font-family="Arial, sans-serif" font-weight="bold">📊 Level</text>
        <text x="680" y="520" font-size="15" fill="#FFFFFF" font-family="Arial, sans-serif">${details.level}</text>
        
        <text x="910" y="495" font-size="13" fill="#FFA500" font-family="Arial, sans-serif" font-weight="bold">✓ Status</text>
        <text x="910" y="520" font-size="15" fill="#FFFFFF" font-family="Arial, sans-serif">${details.status}</text>
        
        <!-- Corner decorations -->
        <g opacity="0.6" filter="url(#glow)">
          <rect x="410" y="30" width="15" height="15" fill="none" stroke="#FFA500" stroke-width="2"/>
          <rect x="1165" y="30" width="15" height="15" fill="none" stroke="#FFA500" stroke-width="2"/>
          <rect x="410" y="555" width="15" height="15" fill="none" stroke="#00D4FF" stroke-width="2"/>
          <rect x="1165" y="555" width="15" height="15" fill="none" stroke="#00D4FF" stroke-width="2"/>
        </g>
      </svg>
    `;

    // Read character image from file
    let characterBuffer: Buffer;
    if (fs.existsSync(characterImagePath)) {
      characterBuffer = fs.readFileSync(characterImagePath);
    } else {
      // Create placeholder
      characterBuffer = await sharp({
        create: {
          width: 300,
          height: 300,
          channels: 3,
          background: { r: 10, g: 15, b: 26 }
        }
      }).png().toBuffer();
    }

    // Resize character image for circular mask
    const resizedCharacter = await sharp(characterBuffer)
      .resize(280, 280, {
        fit: 'cover',
        position: 'center'
      })
      .png()
      .toBuffer();

    // Create circular mask
    const circleMask = await sharp({
      create: {
        width: 280,
        height: 280,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([
        {
          input: await sharp({
            create: {
              width: 280,
              height: 280,
              channels: 3,
              background: { r: 255, g: 255, b: 255 }
            }
          })
            .png()
            .toBuffer(),
          blend: 'dest-in'
        }
      ])
      .png()
      .toBuffer();

    // Apply circular mask to character
    const maskedCharacter = await sharp(resizedCharacter)
      .composite([{
        input: circleMask,
        blend: 'dest-in'
      }])
      .png()
      .toBuffer();

    // Composite everything
    const finalImage = await sharp({
      create: {
        width: cardWidth,
        height: cardHeight,
        channels: 3,
        background: '#0a1428'
      }
    })
      .composite([
        {
          input: Buffer.from(svg),
          gravity: 'northwest'
        },
        {
          input: maskedCharacter,
          left: 60,
          top: 160
        }
      ])
      .png()
      .toBuffer();

    return finalImage;
  } catch (error) {
    console.error('[Image Generator] Error generating card:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}
