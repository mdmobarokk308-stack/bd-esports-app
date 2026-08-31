export const formatTelegramUrl = (rawUrl?: string, fallback = 'https://t.me/esportsclubbd'): string => {
  if (!rawUrl || !rawUrl.trim()) {
    return fallback;
  }
  let link = rawUrl.trim();
  if (link.startsWith('@')) {
    return `https://t.me/${link.substring(1)}`;
  }
  if (link.startsWith('t.me/')) {
    return `https://${link}`;
  }
  if (link.startsWith('telegram.me/')) {
    return `https://${link}`;
  }
  if (!link.startsWith('http://') && !link.startsWith('https://') && !link.startsWith('tg://')) {
    return `https://t.me/${link}`;
  }
  return link;
};

export const formatWhatsAppUrl = (rawPhoneOrUrl?: string, defaultMsg = 'Hello Admin, I need help regarding BD Esports MS'): string => {
  if (!rawPhoneOrUrl || !rawPhoneOrUrl.trim()) {
    return `https://wa.me/8801612456053?text=${encodeURIComponent(defaultMsg)}`;
  }
  let num = rawPhoneOrUrl.trim();
  if (num.startsWith('http://') || num.startsWith('https://') || num.startsWith('whatsapp://')) {
    return num;
  }
  const cleanDigits = num.replace(/\D/g, '');
  if (cleanDigits.startsWith('01') && cleanDigits.length === 11) {
    num = '88' + cleanDigits;
  } else if (cleanDigits.startsWith('8801')) {
    num = cleanDigits;
  } else if (cleanDigits.length > 0) {
    num = cleanDigits;
  } else {
    num = '8801612456053';
  }
  return `https://wa.me/${num}?text=${encodeURIComponent(defaultMsg)}`;
};

/**
 * Safely opens an external URL in a new tab / mobile app
 * CRITICAL: NEVER replaces window.location.href, preventing "refused to connect" iframe errors.
 */
export const openExternalUrl = (rawUrl: string) => {
  if (!rawUrl) return;
  const url = rawUrl.trim();
  if (!url) return;

  try {
    // 1. Try standard anchor tag click with _blank
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 100);
  } catch (err) {
    console.warn('Anchor click failed, trying window.open:', err);
  }

  try {
    window.open(url, '_blank', 'noopener,noreferrer');
  } catch (err) {
    console.warn('window.open failed:', err);
  }
};
