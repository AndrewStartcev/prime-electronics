"use client";

import { PhoneIcon } from "@/shared/ui/Icons";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
} from "@/shared/lib/contactInfo";

export const MobileMenuContacts = () => {
  return (
    <div className="flex flex-col gap-[11px]">
      <a
        href={`tel:${CONTACT_PHONE_TEL}`}
        className="flex items-center gap-[10px]"
      >
        <PhoneIcon />
        <span className="text-[18px] font-medium leading-[1.1] text-[#131314]">
          {CONTACT_PHONE_DISPLAY}
        </span>
      </a>
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="text-[14px] font-normal leading-[1.3] text-[#131314]"
      >
        {CONTACT_EMAIL}
      </a>
    </div>
  );
};
