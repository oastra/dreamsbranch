import FacebookColorIcon from "@/components/icons/FacebookIcon-color";
import InstagramColorIcon from "@/components/icons/InstagramIcon-color";
import WhatsAppFillIcon from "@/components/icons/WhatsAppFillIcon";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { CopyLinkButton } from "./CopyLinkButton";

type Props = {
  copyLinkLabel: string;
  copiedLabel: string;
  shareViaLabel: string;
};

/**
 * Mobile / tablet share card. Light blue rounded card with a centered "Копіювати
 * посилання" pill, then a nested white sub-card with "Поділитись через:" + the
 * 4 socials. Desktop renders an equivalent UI inline inside the unified
 * sidebar card (see [slug]/page.tsx).
 */
export function CampaignShareCard({
  copyLinkLabel,
  copiedLabel,
  shareViaLabel,
}: Props) {
  return (
    <div className="rounded-[24px] bg-secondary-10 p-5 sm:p-6">
      <div className="flex justify-center">
        <CopyLinkButton label={copyLinkLabel} copiedLabel={copiedLabel} />
      </div>
      <div className="mt-5 rounded-[20px] bg-white p-4 sm:p-5">
        <p className="text-body mb-3 text-center font-semibold text-text-strong">
          {shareViaLabel}
        </p>
        <div className="flex items-center justify-center gap-4">
          <ShareSocials />
        </div>
      </div>
    </div>
  );
}

/** The 4-icon social row reused on mobile + desktop variants. */
export function ShareSocials({ size = 36 }: { size?: number }) {
  return (
    <>
      <a
        href="#"
        className="transition-opacity hover:opacity-70"
        aria-label="Facebook"
      >
        <FacebookColorIcon size={size} />
      </a>
      <a
        href="#"
        className="transition-opacity hover:opacity-70"
        aria-label="WhatsApp"
      >
        <WhatsAppFillIcon size={size} />
      </a>
      <a
        href="#"
        className="transition-opacity hover:opacity-70"
        aria-label="Instagram"
      >
        <InstagramColorIcon size={size} />
      </a>
      <a
        href="#"
        className="transition-opacity hover:opacity-70"
        aria-label="TikTok"
      >
        <TikTokIcon size={size} />
      </a>
    </>
  );
}
