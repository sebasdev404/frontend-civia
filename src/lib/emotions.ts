/**
 * RUEDA DE SENTIMIENTOS CIVIA - ALCALDÍA DE NEIVA
 * 1. Tristeza: soledad, culpa, vergüenza, aburrimiento, desánimo, apatía.
 * 2. Enojo o ira: rabia, frustración, celos, irritación, furia, resentimiento.
 * 3. Miedo: ansiedad, inseguridad, confusión, rechazo, debilidad, impotencia.
 * 4. Alegría: entusiasmo, diversión, emoción, creatividad, orgullo, energía.
 * 5. Poder o fortaleza: confianza, seguridad en sí mismo, satisfacción, valoración personal, reconocimiento.
 * 6. Paz o tranquilidad: serenidad, gratitud, amor, confianza, relajación, bienestar.
 */

export interface EmotionInfo {
  primary: 'Tristeza' | 'Enojo o ira' | 'Miedo' | 'Alegría' | 'Poder o fortaleza' | 'Paz o tranquilidad';
  sub: string;
  emoji: string;
  color: string;
  bg: string;
  border: string;
  full: string;
}

export function getEmotionConfig(sentiment?: string | null): EmotionInfo {
  if (!sentiment) {
    return {
      primary: 'Paz o tranquilidad',
      sub: 'Serenidad',
      emoji: '🕊️',
      color: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.15)',
      border: 'rgba(6, 182, 212, 0.35)',
      full: 'Paz o tranquilidad: Serenidad'
    };
  }

  const parts = sentiment.split(':');
  const primaryRaw = (parts[0] || '').trim();
  const subRaw = (parts[1] || '').trim();
  const low = primaryRaw.toLowerCase();

  // 2. Enojo o ira
  if (
    low.includes('enojo') ||
    low.includes('ira') ||
    low.includes('indignación') ||
    low.includes('indignacion') ||
    low.includes('crítico') ||
    low.includes('critico') ||
    low.includes('ataque')
  ) {
    return {
      primary: 'Enojo o ira',
      sub: subRaw || 'Frustración',
      emoji: '😡',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.35)',
      full: sentiment.includes(':') ? sentiment : `Enojo o ira: ${subRaw || 'Frustración'}`
    };
  }

  // 3. Miedo
  if (low.includes('miedo') || low.includes('preocupado') || low.includes('insegur') || low.includes('alerta')) {
    return {
      primary: 'Miedo',
      sub: subRaw || 'Inseguridad',
      emoji: '😨',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.35)',
      full: sentiment.includes(':') ? sentiment : `Miedo: ${subRaw || 'Inseguridad'}`
    };
  }

  // 1. Tristeza
  if (low.includes('tristeza') || low.includes('desánimo') || low.includes('desanimo') || low.includes('pesar')) {
    return {
      primary: 'Tristeza',
      sub: subRaw || 'Desánimo',
      emoji: '😢',
      color: '#818cf8',
      bg: 'rgba(99, 102, 241, 0.15)',
      border: 'rgba(99, 102, 241, 0.35)',
      full: sentiment.includes(':') ? sentiment : `Tristeza: ${subRaw || 'Desánimo'}`
    };
  }

  // 4. Alegría
  if (low.includes('alegría') || low.includes('alegria') || low.includes('positivo') || low.includes('aprobación') || low.includes('aprobacion')) {
    return {
      primary: 'Alegría',
      sub: subRaw || 'Entusiasmo',
      emoji: '😊',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.35)',
      full: sentiment.includes(':') ? sentiment : `Alegría: ${subRaw || 'Entusiasmo'}`
    };
  }

  // 5. Poder o fortaleza
  if (low.includes('poder') || low.includes('fortaleza')) {
    return {
      primary: 'Poder o fortaleza',
      sub: subRaw || 'Confianza',
      emoji: '💪',
      color: '#a855f7',
      bg: 'rgba(168, 85, 247, 0.15)',
      border: 'rgba(168, 85, 247, 0.35)',
      full: sentiment.includes(':') ? sentiment : `Poder o fortaleza: ${subRaw || 'Confianza'}`
    };
  }

  // 6. Paz o tranquilidad (default)
  return {
    primary: 'Paz o tranquilidad',
    sub: subRaw || 'Serenidad',
    emoji: '🕊️',
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.15)',
    border: 'rgba(6, 182, 212, 0.35)',
    full: sentiment.includes(':') ? sentiment : `Paz o tranquilidad: ${subRaw || 'Serenidad'}`
  };
}
