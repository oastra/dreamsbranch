import FacebookColorIcon from '@/components/icons/FacebookIcon-color';
import InstagramColorIcon from '@/components/icons/InstagramIcon-color';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import XTwitterIcon from '@/components/icons/XTwitterIcon';
import LinkIcon from '@/components/icons/LinkIcon';

interface ShareSectionProps {
  copyLinkLabel: string;
  shareLabel: string;
}

export function ShareSection({ copyLinkLabel, shareLabel }: ShareSectionProps) {
  return (
    <div className="mt-12 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
      <button className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-2.5 text-body-sm font-medium text-text-strong transition-colors hover:bg-grey-40">
        <LinkIcon size={16} />
        {copyLinkLabel}
      </button>

      <div className="flex items-center gap-3">
        <span className="text-body-sm text-text-secondary">{shareLabel}</span>
        <a href="#" className="transition-opacity hover:opacity-70" aria-label="Facebook">
          <FacebookColorIcon size={36} />
        </a>
        <a href="#" className="transition-opacity hover:opacity-70" aria-label="Instagram">
          <InstagramColorIcon size={36} />
        </a>
        <a href="#" className="transition-opacity hover:opacity-70" aria-label="WhatsApp">
          <WhatsAppIcon size={36} />
        </a>
        <a href="#" className="text-text-strong transition-opacity hover:opacity-70" aria-label="X">
          <XTwitterIcon size={36} />
        </a>
      </div>
    </div>
  );
}
