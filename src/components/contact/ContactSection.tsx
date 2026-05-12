import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import FacebookIcon from "@/components/icons/FacebookIcon";
import InstagramIcon from "@/components/icons/InstagramIcon";
import { ContactForm } from "./ContactForm";

interface ContactSectionProps {
  title: string;
  description: string;
}

const CONTACT_EMAIL = "dreamsbranch@gmail.com";
const FACEBOOK_URL =
  "https://www.facebook.com/profile.php?id=100092434277929";
const INSTAGRAM_URL = "https://www.instagram.com/dreamsbranch";

export function ContactSection({ title, description }: ContactSectionProps) {
  const t = useTranslations("contact");

  return (
    <section className="section">
      <div className="container-page">
        {/* Light-blue rounded panel wraps the whole block. Section title sits
            above the two-column grid (Figma "Contact us" component). */}
        <div className="rounded-3xl bg-secondary-10 p-5 sm:p-8 lg:p-12">
          {/* Heading */}
          <div className="mb-8 text-center lg:mb-12">
            <h2 className="text-h2 mb-3 font-semibold text-secondary lg:mb-4">
              {title}
            </h2>
            <p className="mx-auto max-w-2xl text-body text-text-primary">
              {description}
            </p>
          </div>

          {/* Two columns: contact info + image on the left, form on the right */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
            {/* Left column — uniform 16px gap between email, socials and image */}
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-body-sm mb-1 font-medium text-text-secondary">
                  {t("our_email")}
                </p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-body font-medium text-grey-80 hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>

              <div>
                <p className="text-body-sm mb-2 font-medium text-text-secondary">
                  {t("our_socials")}
                </p>
                <div className="flex items-center gap-3">
                  <Link
                    href={FACEBOOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-secondary transition-colors hover:bg-secondary hover:text-white"
                  >
                    <FacebookIcon className="h-5 w-5" />
                  </Link>
                  <Link
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-secondary transition-colors hover:bg-secondary hover:text-white"
                  >
                    <InstagramIcon className="h-5 w-5" />
                  </Link>
                </div>
              </div>

              {/* Photo — fixed 291px height per Figma spec. */}
              <div className="relative h-[291px] w-full overflow-hidden rounded-2xl bg-white">
                <Image
                  src="/images/contact-us.webp"
                  alt="Dreams Branch of UWAA team"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* Right column — form */}
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
