import brMatchImg from '../assets/images/ff_br_match_1787743504248.jpg';
import brSurvivalImg from '../assets/images/ff_br_survival_1787743527330.jpg';
import clashSquadImg from '../assets/images/ff_clash_squad_1787743547043.jpg';
import cs2v2Img from '../assets/images/ff_cs_2v2_1787743564062.jpg';
import loneWolfImg from '../assets/images/ff_lone_wolf_1787743592051.jpg';
import freeMatchImg from '../assets/images/ff_free_match_1787743614766.jpg';

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
  br_survival: brSurvivalImg,
  clash_squad: clashSquadImg,
  cs_2v2: cs2v2Img,
  lone_wolf: loneWolfImg,
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
    name: 'BR MATCH',
    bengaliName: 'ব্যাটল রয়্যাল ফুল ম্যাপ',
    group: 'tournament',
    defaultImage: brMatchImg,
    description: 'Tournament Page: Battle Royale Full Map Card',
  },
  {
    id: 'br_survival',
    name: 'BR SURVIVAL',
    bengaliName: 'সোলো সারভাইভাল টুর্নামেন্ট',
    group: 'tournament',
    defaultImage: brSurvivalImg,
    description: 'Tournament Page: Solo Survival Tournament Card',
  },
  {
    id: 'clash_squad',
    name: 'CLASH SQUAD',
    bengaliName: '৪ বনাম ৪ ক্ল্যাশ স্কোয়াড',
    group: 'tournament',
    defaultImage: clashSquadImg,
    description: 'Tournament Page: 4 vs 4 Intense Clash Squad Card',
  },
  {
    id: 'cs_2v2',
    name: 'CS 2 VS 2',
    bengaliName: '২ বনাম ২ ডুয়ো ক্ল্যাশ',
    group: 'tournament',
    defaultImage: cs2v2Img,
    description: 'Tournament Page: Duo vs Duo Fast Action Card',
  },
  {
    id: 'lone_wolf',
    name: 'LONE WOLF',
    bengaliName: '১ বনাম ১ লোন উলফ',
    group: 'tournament',
    defaultImage: loneWolfImg,
    description: 'Tournament Page: 1 vs 1 Pure Skill Match Card',
  },
  {
    id: 'free_match',
    name: 'FREE MATCH',
    bengaliName: 'ফ্রি গিভঅ্যাওয়ে ম্যাচ',
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

export function getTournamentImage(categoryId: string, customMap?: Record<string, string>): string {
  if (customMap && customMap[categoryId] && customMap[categoryId].trim()) {
    return customMap[categoryId].trim();
  }
  return DEFAULT_TOURNAMENT_IMAGES[categoryId] || brMatchImg;
}

export function getTopupImage(iconOrId: string, customMap?: Record<string, string>): string {
  if (customMap) {
    if (customMap[iconOrId] && customMap[iconOrId].trim()) {
      return customMap[iconOrId].trim();
    }
    // Normalize aliases
    if (iconOrId === 'idcode' && customMap['idcode_bd']) return customMap['idcode_bd'];
    if (iconOrId === 'idcode_bd' && customMap['idcode']) return customMap['idcode'];
    if (iconOrId === 'indonesia' && customMap['indonesia_uid']) return customMap['indonesia_uid'];
    if (iconOrId === 'indonesia_uid' && customMap['indonesia']) return customMap['indonesia'];
    if (iconOrId === 'airdrop' && customMap['ff_ingame_airdrop']) return customMap['ff_ingame_airdrop'];
    if (iconOrId === 'ff_ingame_airdrop' && customMap['airdrop']) return customMap['airdrop'];
    if (iconOrId === 'levelup' && customMap['levelup_pass_bd']) return customMap['levelup_pass_bd'];
    if (iconOrId === 'levelup_pass_bd' && customMap['levelup']) return customMap['levelup'];
    if (iconOrId === 'weekly_lite' && customMap['weekly_lite_bd']) return customMap['weekly_lite_bd'];
    if (iconOrId === 'weekly_lite_bd' && customMap['weekly_lite']) return customMap['weekly_lite'];
    if (iconOrId === 'weekly' && customMap['weekly_bd']) return customMap['weekly_bd'];
    if (iconOrId === 'weekly_bd' && customMap['weekly']) return customMap['weekly'];
    if (iconOrId === 'monthly' && customMap['monthly_bd']) return customMap['monthly_bd'];
    if (iconOrId === 'monthly_bd' && customMap['monthly']) return customMap['monthly'];
    if (iconOrId === 'weekly_monthly' && customMap['weekly_monthly_combo']) return customMap['weekly_monthly_combo'];
    if (iconOrId === 'weekly_monthly_combo' && customMap['weekly_monthly']) return customMap['weekly_monthly'];
    if (iconOrId === 'weekly_offer' && customMap['weekly_offer']) return customMap['weekly_offer'];
    if (iconOrId === 'monthly_offer' && customMap['monthly_offer']) return customMap['monthly_offer'];
  }
  return DEFAULT_TOPUP_IMAGES[iconOrId] || idcodeImg;
}
