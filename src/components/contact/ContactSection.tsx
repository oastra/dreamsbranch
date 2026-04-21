import Image from "next/image";
import { ContactForm } from "./ContactForm";

interface ContactSectionProps {
  title: string;
  description: string;
}

export function ContactSection({ title, description }: ContactSectionProps) {
  const heading = (
    <div className="text-center">
      <h2 className="text-title-tablet mb-4 text-text-strong">{title}</h2>
      <p className="text-secondary text-text-secondary">{description}</p>
    </div>
  );

  return (
    <section className="section bg-white">
      <div className="container-page">
        <div className="overflow-hidden rounded-[40px] bg-secondary-10 p-6 sm:p-8 lg:p-0">
          {/* Heading — mobile/tablet only */}
          <div className="mb-6 lg:hidden">{heading}</div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.3fr] lg:gap-0">
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-auto lg:min-h-[722px] lg:rounded-none">
              <Image
                src="/images/contact-us.webp"
                alt="Contact Dreams Branch of UWAA"
                fill
                className="object-cover object-[center_15%]"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>

            {/* Form */}
            <div className="flex flex-col justify-center gap-8 lg:p-12 xl:p-16">
              {/* Heading — desktop only (inside form column) */}
              <div className="hidden lg:block">{heading}</div>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
