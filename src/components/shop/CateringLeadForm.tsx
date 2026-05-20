"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { submitQuickLead } from "@/lib/actions/contacts";

interface Props {
  title: string;
  description: string;
  nameLabel: string;
  phoneLabel: string;
  fieldPlaceholder: string;
  submitLabel: string;
  imageSrc: string;
  imageAlt: string;
  successMessage: string;
  errorMessage: string;
}

export function CateringLeadForm({
  title,
  description,
  nameLabel,
  phoneLabel,
  fieldPlaceholder,
  submitLabel,
  imageSrc,
  imageAlt,
  successMessage,
  errorMessage,
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    startTransition(async () => {
      const result = await submitQuickLead({
        name: name.trim(),
        phone: phone.trim(),
        tag: "CATERING",
      });
      if (result.success) {
        toast.success(successMessage);
        setName("");
        setPhone("");
      } else {
        toast.error(errorMessage);
      }
    });
  }

  return (
    <section className="section">
      <div className="container-page">
        <div className="rounded-3xl bg-[#CBFACF] p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[280px_1fr] lg:gap-10">
            {/* Image — top on mobile/tablet, left on desktop */}
            <div className="relative order-2 aspect-[4/3] w-full overflow-hidden rounded-2xl bg-grey-40 sm:order-none lg:aspect-square">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 280px"
                className="object-cover"
              />
            </div>

            {/* Heading + description + form */}
            <div className="order-1 sm:order-none">
              <h2 className="text-center text-title-tablet font-medium text-text-strong lg:text-left">
                {title}
              </h2>
              <p className="mt-3 text-center text-body-sm text-text-secondary lg:mt-4 lg:text-left">
                {description}
              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-6 grid grid-cols-1 gap-3 lg:mt-8 lg:grid-cols-[1fr_1fr_auto] lg:items-end lg:gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="catering-lead-name"
                    className="px-2 text-caption font-medium text-text-strong"
                  >
                    {nameLabel}
                  </label>
                  <input
                    id="catering-lead-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder={fieldPlaceholder}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 w-full rounded-full border border-transparent bg-white px-5 text-body text-text-primary outline-none placeholder:text-text-tertiary focus-visible:border-secondary"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="catering-lead-phone"
                    className="px-2 text-caption font-medium text-text-strong"
                  >
                    {phoneLabel}
                  </label>
                  <input
                    id="catering-lead-phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder={fieldPlaceholder}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-12 w-full rounded-full border border-transparent bg-white px-5 text-body text-text-primary outline-none placeholder:text-text-tertiary focus-visible:border-secondary"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  shape="pill"
                  disabled={pending}
                  className="h-12 lg:min-w-[180px]"
                >
                  {pending ? "..." : submitLabel}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
