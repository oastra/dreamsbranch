"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Facebook, Mail, ArrowUp } from "lucide-react";

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-blue text-white">
      <div className="container-page py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
          <div className="space-y-4">
            <div>
              <p className="text-h4 font-bold">Dreams Branch of UWAA</p>
              <p className="text-brand-yellow text-body-sm font-medium">
                HELP UKRAINE WIN
              </p>
            </div>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="mailto:dreamsbrunch@gmail.com"
              className="flex items-center gap-2 text-body-sm hover:text-brand-yellow transition-colors"
            >
              <Mail className="w-4 h-4" />
              dreamsbrunch@gmail.com
            </a>
          </div>

          <nav className="grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-12">
            <div>
              <Link
                href="/about"
                className="text-body-sm font-medium hover:text-brand-yellow transition-colors"
              >
                {t("nav.about")}
              </Link>
            </div>
            <div className="space-y-2">
              <Link
                href="/campaigns"
                className="block text-body-sm font-medium hover:text-brand-yellow transition-colors"
              >
                {t("nav.campaigns")}
              </Link>
            </div>
            <div className="space-y-2">
              <Link
                href="/events"
                className="block text-body-sm font-medium hover:text-brand-yellow transition-colors"
              >
                {t("nav.events")}
              </Link>
              <Link
                href="/reports"
                className="block text-caption text-white/60 hover:text-brand-yellow transition-colors"
              >
                {t("nav.reports")}
              </Link>
              <Link
                href="/news"
                className="block text-caption text-white/60 hover:text-brand-yellow transition-colors"
              >
                {t("nav.news")}
              </Link>
            </div>
            <div className="space-y-2">
              <Link
                href="/shop"
                className="block text-body-sm font-medium hover:text-brand-yellow transition-colors"
              >
                {t("nav.shop")}
              </Link>
              <Link
                href="/contact"
                className="block text-body-sm font-medium hover:text-brand-yellow transition-colors"
              >
                {t("nav.contact")}
              </Link>
            </div>
          </nav>

          <div className="flex flex-col items-end gap-4">
            <Link href="/campaigns" className="btn-secondary text-body-sm">
              {t("nav.support")}
            </Link>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-1 text-caption text-white/60 hover:text-white transition-colors"
            >
              {t("footer.back_to_top")}
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="border-t border-white/20 mt-10 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href="/privacy"
            className="text-caption text-white/60 hover:text-white transition-colors"
          >
            {t("footer.privacy")}
          </Link>
          <p className="text-caption text-white/60">
            {t("footer.copyright", { year })}
          </p>
        </div>
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-caption text-white/40 max-w-3xl">
            {t("footer.acknowledgment")}
          </p>
        </div>
      </div>
    </footer>
  );
}
