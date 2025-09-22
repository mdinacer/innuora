import { APP_CONFIG, EMAIL_ADDRESSES } from "@/config/app";

export default {
  ageEligibility: APP_CONFIG.legal.ageRequirement,
  legalEntity: APP_CONFIG.company.legalName,
  emails: {
    support: EMAIL_ADDRESSES.support,
    privacy: EMAIL_ADDRESSES.privacy,
  },
} as const;
