export function mapMissionIdToPlanet(missionId: string): string | null {
  if (!missionId) return null;
  const mid = missionId.toLowerCase();
  
  if (mid.startsWith('moon-') || mid.includes('-moon') || mid === 'moon') return 'moon';

  if (mid.startsWith('mars-') || mid.startsWith('html-')) return 'mars';
  if (mid.startsWith('venus-') || mid.startsWith('css-')) return 'venus';
  if (mid.startsWith('mercury-') || mid.startsWith('js-') || mid.startsWith('javascript-')) return 'mercury';
  if (mid.startsWith('jupiter-') || mid.startsWith('java-')) return 'jupiter';
  if (mid.startsWith('saturn-') || mid.startsWith('cpp-') || mid.startsWith('c++-')) return 'saturn';
  if (mid.startsWith('earth-') || mid.startsWith('python-')) return 'earth';
  
  return null; // Unknown
}
