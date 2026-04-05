import Image from 'next/image';
import { ContactForm } from './ContactForm';

interface ContactSectionProps {
  title: string;
  description: string;
}

export function ContactSection({ title, description }: ContactSectionProps) {
  return (
    <section className="section bg-white">
      <div className="container-page">
        <div className="overflow-hidden rounded-[40px] bg-secondary-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr]">
            {/* Image */}
            <div className="relative min-h-[300px] lg:min-h-[560px]">
              <Image
                src="/images/contact-us.webp"
                alt="Contact Dreams Branch of UWAA"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>

            {/* Form */}
            <div className="flex flex-col justify-center gap-6 p-8 lg:p-12 xl:p-16">
              <div>
                <h2 className="text-h2 mb-4 text-text-strong">{title}</h2>
                <p className="text-secondary text-text-secondary">{description}</p>
              </div>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
