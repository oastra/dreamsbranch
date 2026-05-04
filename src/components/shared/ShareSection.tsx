import FacebookColorIcon from '@/components/icons/FacebookIcon-color';
import InstagramColorIcon from '@/components/icons/InstagramIcon-color';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import XTwitterIcon from '@/components/icons/XTwitterIcon';

interface ShareSectionProps {
  copyLinkLabel: string;
  shareLabel: string;
}

export function ShareSection({ copyLinkLabel, shareLabel }: ShareSectionProps) {
  return (
    <div className="mt-12 flex flex-col items-stretch gap-4 rounded-2xl bg-secondary-10 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6 lg:px-8">
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-full bg-secondary px-8 py-3 text-body font-medium text-white transition-opacity hover:opacity-90"
      >
        {copyLinkLabel}
      </button>

      <div className="flex items-center justify-between gap-4 rounded-full bg-white px-5 py-2.5 sm:justify-end sm:gap-5">
        <span className="text-body text-text-strong">{shareLabel}</span>
        <div className="flex items-center gap-3">
          <a href="#" className="transition-opacity hover:opacity-70" aria-label="Facebook">
            <FacebookColorIcon size={32} />
          </a>
          <a href="#" className="transition-opacity hover:opacity-70" aria-label="Instagram">
            <InstagramColorIcon size={32} />
          </a>
          <a href="#" className="transition-opacity hover:opacity-70" aria-label="WhatsApp">
            <WhatsAppIcon size={32} />
          </a>
          <a href="#" className="transition-opacity hover:opacity-70" aria-label="X">
            <XTwitterIcon size={32} />
          </a>
        </div>
      </div>
    </div>
  );
}
