import brMatchImg from '../assets/images/ff_br_match_1787743504248.jpg';
import brSurvivalImg from '../assets/images/ff_br_survival_1787743527330.jpg';
import clashSquadImg from '../assets/images/ff_clash_squad_1787743547043.jpg';
import cs2v2Img from '../assets/images/ff_cs_2v2_1787743564062.jpg';
import loneWolfImg from '../assets/images/ff_lone_wolf_1787743592051.jpg';
import freeMatchImg from '../assets/images/ff_free_match_1787743614766.jpg';
import headshotImg from '../assets/images/ff_headshot_art_1788308873284.jpg';
import lostToWinImg from '../assets/images/ff_losttowin_art_1788308895706.jpg';
import extremeTourImg from '../assets/images/ff_extreme_art_1788308920802.jpg';
import categoriesArtImg from '../assets/images/ff_categories_art_1788308850273.jpg';

import idcodeImg from '../assets/images/idcode_gold_warrior_1788215023138.jpg';
import indonesiaImg from '../assets/images/indonesia_cyan_aura_1788215035805.jpg';
import airdropImg from '../assets/images/airdrop_red_robot_1788215048784.jpg';
import levelupImg from '../assets/images/levelup_purple_dragon_1788215062589.jpg';
import weeklyLiteImg from '../assets/images/weekly_lite_gold_gun_1788215078801.jpg';
import weeklyImg from '../assets/images/weekly_purple_cyber_1788215091319.jpg';
import monthlyImg from '../assets/images/monthly_fire_samurai_1788215105045.jpg';
import weeklyMonthlyComboImg from '../assets/images/weekly_monthly_lightning_samurai_1788215117009.jpg';

// Preset Avatars / Characters for quick selection in admin
import hiphopGoldImg from '../assets/images/ff_hiphop_gold_1788213531609.jpg';
import neonPurpleImg from '../assets/images/ff_neon_purple_1788213551027.jpg';
import oniDemonImg from '../assets/images/ff_oni_demon_1788213563439.jpg';
import blueAuraImg from '../assets/images/ff_blue_aura_1788213578026.jpg';
import foxMaskImg from '../assets/images/ff_fox_mask_1788213590719.jpg';
import magentaWarriorImg from '../assets/images/ff_magenta_warrior_1788213606501.jpg';
import oniLightningImg from '../assets/images/ff_oni_lightning_1788213620310.jpg';
import snowSamuraiImg from '../assets/images/ff_snow_samurai_1788213632721.jpg';

export interface CategoryImageMeta {
  id: string;
  name: string;
  bengaliName: string;
  group: 'tournament' | 'topup';
  defaultImage: string;
  description: string;
}

export const DEFAULT_TOURNAMENT_IMAGES: Record<string, string> = {
  br_match: brMatchImg,
  br_solo: brMatchImg,
  br_pro_league: categoriesArtImg,
  br_survival: brSurvivalImg,
  lone_wolf: loneWolfImg,
  lw_head_host: headshotImg,
  clash_squad: clashSquadImg,
  cs_2v2: cs2v2Img,
  lone_wolf_1v1: loneWolfImg,
  lost_to_win: lostToWinImg,
  extreme_tour: extremeTourImg,
  free_match: freeMatchImg,
};

export const DEFAULT_TOPUP_IMAGES: Record<string, string> = {
  weekly_offer: weeklyImg,
  monthly_offer: monthlyImg,
  idcode_bd: idcodeImg,
  idcode: idcodeImg,
  indonesia_uid: indonesiaImg,
  indonesia: indonesiaImg,
  ff_ingame_airdrop: airdropImg,
  airdrop: airdropImg,
  levelup_pass_bd: levelupImg,
  levelup_pass: levelupImg,
  levelup: levelupImg,
  weekly_lite_bd: weeklyLiteImg,
  weekly_lite: weeklyLiteImg,
  weekly_bd: weeklyImg,
  weekly: weeklyImg,
  monthly_bd: monthlyImg,
  monthly: monthlyImg,
  weekly_monthly_combo: weeklyMonthlyComboImg,
  weekly_monthly: weeklyMonthlyComboImg,
};

export const TOURNAMENT_CATEGORY_ITEMS: CategoryImageMeta[] = [
  {
    id: 'br_match',
    name: 'BR DUO MATCH',
    bengaliName: 'বিআর ডুয়ো ফুল ম্যাপ ম্যাচ',
    group: 'tournament',
    defaultImage: brMatchImg,
    description: 'Tournament Page: BR DUO Match Card',
  },
  {
    id: 'br_solo',
    name: 'BR SOLO MATCH',
    bengaliName: 'বিআর সোলো ফুল ম্যাপ ম্যাচ',
    group: 'tournament',
    defaultImage: brMatchImg,
    description: 'Tournament Page: BR SOLO Match Card',
  },
  {
    id: 'br_pro_league',
    name: 'BR PRO LEAGUE (BPL)',
    bengaliName: 'বিআর প্রো লীগ টুর্নামেন্ট',
    group: 'tournament',
    defaultImage: categoriesArtImg,
    description: 'Tournament Page: BR Pro League Tournament Card',
  },
  {
    id: 'br_survival',
    name: 'SOLO SURVIVAL (BSS)',
    bengaliName: 'সোলো সারভাইভাল টুর্নামেন্ট',
    group: 'tournament',
    defaultImage: brSurvivalImg,
    description: 'Tournament Page: Solo Survival Tournament Card',
  },
  {
    id: 'lone_wolf',
    name: 'LONE WOLF (LW)',
    bengaliName: 'লোন উলফ ২ বনাম ২ ম্যাচ',
    group: 'tournament',
    defaultImage: loneWolfImg,
    description: 'Tournament Page: Lone Wolf Match Card',
  },
  {
    id: 'lw_head_host',
    name: 'LW HEAD HOST',
    bengaliName: 'লোন উলফ হেডশট ওয়ানলি',
    group: 'tournament',
    defaultImage: headshotImg,
    description: 'Tournament Page: Headshot Only Match Card',
  },
  {
    id: 'clash_squad',
    name: 'CLASH SQUAD (CS)',
    bengaliName: '৪ বনাম ৪ ক্ল্যাশ স্কোয়াড',
    group: 'tournament',
    defaultImage: clashSquadImg,
    description: 'Tournament Page: 4 vs 4 Intense Clash Squad Card',
  },
  {
    id: 'cs_2v2',
    name: 'CS 1v1...2v2',
    bengaliName: 'ক্ল্যাশ স্কোয়াড ১v১ / ২v২',
    group: 'tournament',
    defaultImage: cs2v2Img,
    description: 'Tournament Page: CS 1v1 / 2v2 Match Card',
  },
  {
    id: 'lone_wolf_1v1',
    name: 'LONE WOLF 1vs1',
    bengaliName: '১ বনাম ১ লোন উলফ স্কিল',
    group: 'tournament',
    defaultImage: loneWolfImg,
    description: 'Tournament Page: Lone Wolf 1v1 Match Card',
  },
  {
    id: 'lost_to_win',
    name: 'LOST TO WIN (LTW)',
    bengaliName: 'লস্ট টু উইন স্পেশাল ম্যাচ',
    group: 'tournament',
    defaultImage: lostToWinImg,
    description: 'Tournament Page: Lost To Win Match Card',
  },
  {
    id: 'extreme_tour',
    name: 'EXTREME TOUR SPECIAL MODE',
    bengaliName: 'এক্সট্রিম ট্যুর স্পেশাল ম্যাচ',
    group: 'tournament',
    defaultImage: extremeTourImg,
    description: 'Tournament Page: Extreme Tour Special Mode Card',
  },
  {
    id: 'free_match',
    name: 'FREE MATCH GIVEAWAY',
    bengaliName: 'ফ্রি গিভঅ্যাওয়ে কাস্টম ম্যাচ',
    group: 'tournament',
    defaultImage: freeMatchImg,
    description: 'Tournament Page: Daily Free Giveaway Match Card',
  },
];

export const TOPUP_CATEGORY_ITEMS: CategoryImageMeta[] = [
  {
    id: 'weekly_offer',
    name: 'WEEKLY OFFER (Top Card)',
    bengaliName: 'উইকলি অফার ব্যানার কার্ড ⚡',
    group: 'topup',
    defaultImage: weeklyImg,
    description: 'Topup Page: Top Featured Weekly Offer Card',
  },
  {
    id: 'monthly_offer',
    name: 'MONTHLY OFFER (Top Card)',
    bengaliName: 'মান্থলি অফার ব্যানার কার্ড 👑',
    group: 'topup',
    defaultImage: monthlyImg,
    description: 'Topup Page: Top Featured Monthly Offer Card',
  },
  {
    id: 'idcode_bd',
    name: 'IDCODE Topup [BD SERVER]',
    bengaliName: 'আইডি কোড টপআপ 🇧🇩',
    group: 'topup',
    defaultImage: idcodeImg,
    description: 'Topup Page: Free Fire BD Server UID Topup Card',
  },
  {
    id: 'indonesia_uid',
    name: 'Indonesia Server [UID]',
    bengaliName: 'ইন্দোনেশিয়া সার্ভার [UID] 🇮🇩',
    group: 'topup',
    defaultImage: indonesiaImg,
    description: 'Topup Page: Indonesia Server UID Topup Card',
  },
  {
    id: 'ff_ingame_airdrop',
    name: 'FF Ingame [Airdrop]',
    bengaliName: 'ইনগেম এয়ারড্রপ 🎁',
    group: 'topup',
    defaultImage: airdropImg,
    description: 'Topup Page: Special Airdrop ID/Password Card',
  },
  {
    id: 'levelup_pass_bd',
    name: 'Level Up Pass (BD Server)',
    bengaliName: 'লেভেল আপ পাস 🇧🇩',
    group: 'topup',
    defaultImage: levelupImg,
    description: 'Topup Page: Level Up Pass Package Card',
  },
  {
    id: 'weekly_lite_bd',
    name: 'Weekly Lite (Bd Server)',
    bengaliName: 'উইকলি লাইট 🇧🇩',
    group: 'topup',
    defaultImage: weeklyLiteImg,
    description: 'Topup Page: Weekly Lite Membership Card',
  },
  {
    id: 'weekly_bd',
    name: 'Weekly [BD SERVER]',
    bengaliName: 'উইকলি মেম্বারশিপ 🇧🇩',
    group: 'topup',
    defaultImage: weeklyImg,
    description: 'Topup Page: Weekly Membership Card',
  },
  {
    id: 'monthly_bd',
    name: 'Monthly [BD SERVER]',
    bengaliName: 'মান্থলি মেম্বারশিপ 🇧🇩',
    group: 'topup',
    defaultImage: monthlyImg,
    description: 'Topup Page: Monthly Membership Card',
  },
  {
    id: 'weekly_monthly_combo',
    name: 'Weekly + Monthly Combo',
    bengaliName: 'উইকলি + মান্থলি কম্বো 🇧🇩',
    group: 'topup',
    defaultImage: weeklyMonthlyComboImg,
    description: 'Topup Page: Weekly + Monthly Super Combo Card',
  },
];

export const PRESET_GALLERY_IMAGES = [
  { name: 'Gold Hip-Hop', url: hiphopGoldImg },
  { name: 'Neon Purple Cyber', url: neonPurpleImg },
  { name: 'Oni Demon Red', url: oniDemonImg },
  { name: 'Cyan Blue Aura', url: blueAuraImg },
  { name: 'Fox Mask Ninja', url: foxMaskImg },
  { name: 'Magenta Cyber', url: magentaWarriorImg },
  { name: 'Lightning Samurai', url: oniLightningImg },
  { name: 'Snow Ice Samurai', url: snowSamuraiImg },
];

export function isValidImageSource(src?: string): boolean {
  if (!src || typeof src !== 'string') return false;
  const s = src.trim();
  if (s.length < 5) return false;
  if (s.startsWith('data:image/') || s.startsWith('http://') || s.startsWith('https://') || s.startsWith('blob:')) {
    return true;
  }
  if (s.startsWith('/assets/') || s.startsWith('/images/') || s.endsWith('.jpg') || s.endsWith('.png') || s.endsWith('.webp')) {
    return true;
  }
  return false;
}

export function getTournamentImage(categoryId: string, customMap?: Record<string, string>): string {
  if (customMap && customMap[categoryId] && isValidImageSource(customMap[categoryId])) {
    return customMap[categoryId].trim();
  }
  return DEFAULT_TOURNAMENT_IMAGES[categoryId] || brMatchImg;
}

export function getTopupImage(iconOrId: string, customMap?: Record<string, string>): string {
  if (customMap) {
    if (customMap[iconOrId] && isValidImageSource(customMap[iconOrId])) {
      return customMap[iconOrId].trim();
    }
    // Normalize aliases
    const aliases: Record<string, string[]> = {
      idcode: ['idcode_bd', 'idcode'],
      idcode_bd: ['idcode', 'idcode_bd'],
      indonesia: ['indonesia_uid', 'indonesia'],
      indonesia_uid: ['indonesia', 'indonesia_uid'],
      airdrop: ['ff_ingame_airdrop', 'airdrop', 'special_airdrop'],
      ff_ingame_airdrop: ['airdrop', 'ff_ingame_airdrop', 'special_airdrop'],
      special_airdrop: ['ff_ingame_airdrop', 'airdrop'],
      levelup: ['levelup_pass_bd', 'levelup_bd', 'levelup_pass', 'levelup'],
      levelup_pass_bd: ['levelup', 'levelup_bd', 'levelup_pass'],
      levelup_bd: ['levelup_pass_bd', 'levelup', 'levelup_pass'],
      levelup_pass: ['levelup_pass_bd', 'levelup', 'levelup_bd'],
      weekly_lite: ['weekly_lite_bd', 'weekly_lite'],
      weekly_lite_bd: ['weekly_lite', 'weekly_lite_bd'],
      weekly: ['weekly_bd', 'weekly_offer', 'weekly'],
      weekly_bd: ['weekly', 'weekly_offer', 'weekly_bd'],
      weekly_offer: ['weekly_bd', 'weekly', 'weekly_offer'],
      monthly: ['monthly_bd', 'monthly_offer', 'monthly'],
      monthly_bd: ['monthly', 'monthly_offer', 'monthly_bd'],
      monthly_offer: ['monthly_bd', 'monthly', 'monthly_offer'],
      weekly_monthly: ['weekly_monthly_combo', 'weekly_monthly_offer', 'weekly_monthly'],
      weekly_monthly_combo: ['weekly_monthly_offer', 'weekly_monthly', 'weekly_monthly_combo'],
      weekly_monthly_offer: ['weekly_monthly_combo', 'weekly_monthly', 'weekly_monthly_offer'],
    };

    const searchList = aliases[iconOrId] || [];
    for (const altKey of searchList) {
      if (customMap[altKey] && isValidImageSource(customMap[altKey])) {
        return customMap[altKey].trim();
      }
    }
  }
  return DEFAULT_TOPUP_IMAGES[iconOrId] || idcodeImg;
}
