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
  performanceScores?: { stat: string; score: number }[];
}

export async function generateAccountDetailsCard(
  characterImagePath: string,
  details: AccountDetails
): Promise<Buffer> {
  try {
    // Card dimensions
    const cardWidth = 1024;
    const cardHeight = 576;
    
    // Performance stats display
    const statsX = 450;
    const statsYStart = 250;
    const statsRows = details.performanceScores ? details.performanceScores.map((s, i) => `
      <text x="${statsX}" y="${statsYStart + (i * 35)}" font-size="24" fill="#000000" font-family="Arial, sans-serif">${s.stat}: ${s.score}</text>
    `).join('') : '';

    // Radar chart points calculation (simplified pentagon for visualization)
    const centerX = 600;
    const centerY = 650;
    const radius = 180; // Bigger radar chart

    const svg = `
      <svg width="${cardWidth}" height="${cardHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <!-- Player Name and ID (Far Right Side, White Text, Font 50, Bold) -->
        <text x="850" y="140" font-size="50" font-weight="900" fill="#ffffff" font-family="Arial, sans-serif" text-anchor="middle" filter="url(#glow)" style="text-shadow: 2px 2px 4px #000;">${details.gameName}</text>
        <text x="850" y="200" font-size="30" font-weight="bold" fill="#ffffff" font-family="Arial, sans-serif" text-anchor="middle" filter="url(#glow)" style="text-shadow: 2px 2px 4px #000;">ID: ${details.gameId}</text>

        <!-- Radar Chart Bottom Right (Big Size, Lower Right Corner) -->
        <g transform="translate(850, 400)">
          <!-- Base Radar Pentagon -->
          <polygon points="${details.performanceScores ? details.performanceScores.map((_, i) => {
            const angle = (i * 2 * Math.PI / (details.performanceScores?.length || 5)) - Math.PI / 2;
            return `${radius * Math.cos(angle)},${radius * Math.sin(angle)}`;
          }).join(' ') : ''}" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.3"/>
          
          <!-- Performance Area -->
          <polygon points="${details.performanceScores ? details.performanceScores.map((s, i) => {
            const angle = (i * 2 * Math.PI / (details.performanceScores?.length || 5)) - Math.PI / 2;
            const r = (s.score / 100) * radius;
            return `${r * Math.cos(angle)},${r * Math.sin(angle)}`;
          }).join(' ') : ''}" fill="#3b82f6" fill-opacity="0.6" stroke="#00D4FF" stroke-width="3"/>
          
          <!-- Labels (Bold) -->
          ${details.performanceScores ? details.performanceScores.map((s, i) => {
            const angle = (i * 2 * Math.PI / (details.performanceScores?.length || 5)) - Math.PI / 2;
            const labelRadius = radius + 35;
            const x = labelRadius * Math.cos(angle);
            const y = labelRadius * Math.sin(angle);
            return `
              <text x="${x}" y="${y}" 
                    font-size="16" font-weight="900" text-anchor="middle" fill="#ffffff"
                    filter="url(#glow)">${s.stat}</text>
              <text x="${x}" y="${y + 18}" 
                    font-size="14" font-weight="bold" text-anchor="middle" fill="#00D4FF"
                    filter="url(#glow)">${s.score}</text>
            `;
          }).join('') : ''}
        </g>
      </svg>
    `;

    // Use the provided background image
    const bgPath = 'attached_assets/Character_Only_-_Left_Side_1766680552533.png';
    const backgroundBuffer = fs.readFileSync(bgPath);
    const bgMetadata = await sharp(backgroundBuffer).metadata();

    const finalImage = await sharp(backgroundBuffer)
      .composite([
        { input: Buffer.from(svg), top: 0, left: 0 }
      ])
      .png()
      .toBuffer();

    return finalImage;
  } catch (error) {
    console.error('[Image Generator] Error generating card:', error);
    throw error;
  }
}
