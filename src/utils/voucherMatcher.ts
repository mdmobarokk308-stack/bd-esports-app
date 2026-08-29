import { VoucherVaultItem } from '../types';

export interface PackageRequirement {
  name: string;
  diamonds?: number;
  minShellMY: number;
  minUC: number;
  aliases: string[];
  description: string;
}

// Cost & Requirement Mapping Table (Lowest Shell / UC calculation)
export const PACKAGE_REQUIREMENTS: PackageRequirement[] = [
  {
    name: '25 Diamond',
    diamonds: 25,
    minShellMY: 0,
    minUC: 20,
    aliases: ['25', '25 diamond', '25 diamonds', 'bd_25', '20 uc'],
    description: 'সর্বনিম্ন ২০ UC বা ২৫ ডায়মন্ড ভাউচার প্রয়োজন',
  },
  {
    name: '50 Diamond',
    diamonds: 50,
    minShellMY: 25,
    minUC: 36,
    aliases: ['50', '50 diamond', '50 diamonds', 'bd_50', '36 uc', 'indo_50'],
    description: 'সর্বনিম্ন ৩৬ UC বা ২৫ শেল প্রয়োজন',
  },
  {
    name: '115 Diamond',
    diamonds: 115,
    minShellMY: 50,
    minUC: 80,
    aliases: ['115', '115 diamond', '115 diamonds', 'bd_115', '50 shell', '80 uc'],
    description: 'সর্বনিম্ন ৫০ MY Shell বা ৮০ UC বা ১১৫ ডায়মন্ড ভাউচার',
  },
  {
    name: '240 Diamond',
    diamonds: 240,
    minShellMY: 100,
    minUC: 160,
    aliases: ['240', '240 diamond', '240 diamonds', 'bd_240', '100 shell', '160 uc'],
    description: 'সর্বনিম্ন ১০০ MY Shell বা ১৬০ UC বা ২৪০ ডায়মন্ড ভাউচার',
  },
  {
    name: '355 Diamond',
    diamonds: 355,
    minShellMY: 150,
    minUC: 240,
    aliases: ['355', '355 diamond', '355 diamonds', 'bd_355', '150 shell'],
    description: 'সর্বনিম্ন ১৫০ MY Shell বা ২৪০ UC প্রয়োজন',
  },
  {
    name: '480 Diamond',
    diamonds: 480,
    minShellMY: 200,
    minUC: 320,
    aliases: ['480', '480 diamond', '480 diamonds', 'bd_480', '200 shell'],
    description: 'সর্বনিম্ন ২০০ MY Shell বা ৩২০ UC প্রয়োজন',
  },
  {
    name: '505 Diamond',
    diamonds: 505,
    minShellMY: 200,
    minUC: 340,
    aliases: ['505', '505 diamond', '505 diamonds', 'bd_505'],
    description: 'সর্বনিম্ন ২০০ MY Shell বা ৩৪০ UC প্রয়োজন',
  },
  {
    name: '610 Diamond',
    diamonds: 610,
    minShellMY: 250,
    minUC: 405,
    aliases: ['610', '610 diamond', '610 diamonds', 'bd_610', '250 shell', '405 uc'],
    description: 'সর্বনিম্ন ২৫০ MY Shell বা ৪০৫ UC বা ৬১০ ডায়মন্ড ভাউচার',
  },
  {
    name: '850 Diamond',
    diamonds: 850,
    minShellMY: 350,
    minUC: 560,
    aliases: ['850', '850 diamond', '850 diamonds', 'bd_850', '350 shell'],
    description: 'সর্বনিম্ন ৩৫০ MY Shell বা ৫৬০ UC প্রয়োজন',
  },
  {
    name: '1090 Diamond',
    diamonds: 1090,
    minShellMY: 450,
    minUC: 720,
    aliases: ['1090', '1090 diamond', '1090 diamonds', 'bd_1090', '450 shell'],
    description: 'সর্বনিম্ন ৪৫০ MY Shell বা ৭২০ UC প্রয়োজন',
  },
  {
    name: '1240 Diamond',
    diamonds: 1240,
    minShellMY: 500,
    minUC: 800,
    aliases: ['1240', '1240 diamond', '1240 diamonds', 'bd_1240', '500 shell', '800 uc'],
    description: 'সর্বনিম্ন ৫০০ MY Shell বা ৮০০ UC বা ১২৪০ ডায়মন্ড ভাউচার',
  },
  {
    name: '2530 Diamond',
    diamonds: 2530,
    minShellMY: 1000,
    minUC: 1625,
    aliases: ['2530', '2530 diamond', '2530 diamonds', 'bd_2530', '1000 shell', '1625 uc'],
    description: 'সর্বনিম্ন ১০০০ MY Shell বা ১৬২৫ UC প্রয়োজন',
  },
  {
    name: 'Weekly',
    diamonds: 450,
    minShellMY: 100,
    minUC: 160,
    aliases: ['weekly', 'weekly pass', 'weekly membership', 'bd_weekly', 'indo_weekly', '100 shell', '160 uc'],
    description: '১টি উইকলির জন্য সর্বনিম্ন ১০০ MY Shell বা ১৬০ UC বা উইকলি ভাউচার প্রয়োজন',
  },
  {
    name: 'Weekly Lite',
    diamonds: 100,
    minShellMY: 50,
    minUC: 80,
    aliases: ['weekly lite', 'lite weekly', '50 shell', '80 uc'],
    description: 'উইকলি লাইটের জন্য সর্বনিম্ন ৫০ MY Shell বা ৮০ UC প্রয়োজন',
  },
  {
    name: 'Monthly',
    diamonds: 2600,
    minShellMY: 500,
    minUC: 800,
    aliases: ['monthly', 'monthly pass', 'monthly membership', 'bd_monthly', 'indo_monthly', '500 shell', '800 uc'],
    description: '১টি মান্থলির জন্য সর্বনিম্ন ৫০০ MY Shell বা ৮০০ UC বা মান্থলি ভাউচার প্রয়োজন',
  },
  {
    name: 'Level Up Pass',
    diamonds: 1270,
    minShellMY: 200,
    minUC: 320,
    aliases: ['level up', 'levelup', 'lvl_full', 'level up pass', 'indo_bp', 'bp card'],
    description: 'লেভেল আপ পাসের জন্য সর্বনিম্ন ২০০ MY Shell বা ৩২০ UC প্রয়োজন',
  },
];

/**
 * Finds requirement info based on package name
 */
export function getPackageRequirement(packageName: string): PackageRequirement | null {
  if (!packageName) return null;
  const lower = packageName.toLowerCase().trim();

  // Exact or alias match
  for (const req of PACKAGE_REQUIREMENTS) {
    if (req.aliases.some((alias) => lower.includes(alias) || alias.includes(lower))) {
      return req;
    }
  }

  // Number extract match (e.g. "115 Diamonds")
  const numMatch = lower.match(/(\d+)/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    const found = PACKAGE_REQUIREMENTS.find((r) => r.diamonds === num);
    if (found) return found;
  }

  return null;
}

/**
 * 100% Smart Auto-Matcher:
 * Finds the most cost-efficient, optimal unused voucher or shell code from the vault
 */
export function matchOptimalVoucher(
  packageName: string,
  vault: VoucherVaultItem[]
): {
  voucher: VoucherVaultItem | null;
  costInfo: string;
  isExactMatch: boolean;
} {
  const unusedVouchers = vault.filter((v) => !v.isUsed);
  if (unusedVouchers.length === 0) {
    return {
      voucher: null,
      costInfo: 'স্টকে কোনো ভাউচার কোড নেই',
      isExactMatch: false,
    };
  }

  const req = getPackageRequirement(packageName);
  const pkgLower = packageName.toLowerCase();

  // 1. Check exact package category match in unused vouchers
  const exactMatch = unusedVouchers.find((v) => {
    const catLower = v.packageCategory.toLowerCase();
    if (req) {
      return req.aliases.some((alias) => catLower.includes(alias));
    }
    return catLower.includes(pkgLower) || pkgLower.includes(catLower);
  });

  if (exactMatch) {
    return {
      voucher: exactMatch,
      costInfo: req
        ? `সর্বনিম্ন প্রয়োজনীয়তা: ${req.minShellMY > 0 ? `${req.minShellMY} MY Shell` : ''} ${req.minUC > 0 ? `/ ${req.minUC} UC` : ''}`
        : 'সরাসরি পারফেক্ট ক্যাটাগরি ম্যাচ',
      isExactMatch: true,
    };
  }

  // 2. Check by Shell / UC quantity in category name
  if (req) {
    const shellMatch = unusedVouchers.find((v) => {
      const catLower = v.packageCategory.toLowerCase();
      if (req.minShellMY > 0 && catLower.includes(`${req.minShellMY} shell`)) return true;
      if (req.minUC > 0 && catLower.includes(`${req.minUC} uc`)) return true;
      return false;
    });

    if (shellMatch) {
      return {
        voucher: shellMatch,
        costInfo: `স্বয়ংক্রিয় সাশ্রয়ী নির্বাচন: ${req.minShellMY > 0 ? `${req.minShellMY} MY Shell` : `${req.minUC} UC`}`,
        isExactMatch: true,
      };
    }
  }

  // 3. Fallback to General / Any unused voucher so order NEVER fails
  const fallbackVoucher = unusedVouchers[0];
  return {
    voucher: fallbackVoucher,
    costInfo: `ভল্ট ব্যাকআপ স্টক কোড (${fallbackVoucher.packageCategory})`,
    isExactMatch: false,
  };
}

/**
 * Auto Fulfill Order:
 * Marks voucher as used, returns updated vault & delivered voucher info
 */
export function autoFulfillOrderFromVault(
  packageName: string,
  uid: string,
  orderId: string,
  currentVault: VoucherVaultItem[]
): {
  updatedVault: VoucherVaultItem[];
  deliveredVoucher: VoucherVaultItem | null;
  costInfo: string;
} {
  const { voucher, costInfo } = matchOptimalVoucher(packageName, currentVault);

  if (!voucher) {
    return {
      updatedVault: currentVault,
      deliveredVoucher: null,
      costInfo,
    };
  }

  const updatedVault = currentVault.map((item) => {
    if (item.id === voucher.id) {
      return {
        ...item,
        isUsed: true,
        usedForUid: uid,
        usedForOrderId: orderId,
        usedDate: new Date().toLocaleString(),
      };
    }
    return item;
  });

  // Save to localStorage immediately
  try {
    localStorage.setItem('admin_voucher_vault', JSON.stringify(updatedVault));
  } catch (e) {
    console.error('Error saving voucher vault:', e);
  }

  return {
    updatedVault,
    deliveredVoucher: {
      ...voucher,
      isUsed: true,
      usedForUid: uid,
      usedForOrderId: orderId,
      usedDate: new Date().toLocaleString(),
    },
    costInfo,
  };
}
