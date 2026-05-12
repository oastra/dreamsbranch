"use client";
import Image from "next/image";
import NextLink from "next/link";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

import { MailIcon, ArrowUpRight } from "lucide-react";
import ArrowUpCircleIcon from "@/components/icons/ArrowUpCircleIcon";
import FacebookInCircleIcon from "../icons/FacebookInCircleIcon";
import UserCircleIcon from "@/components/icons/UserCircleIcon";

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#00448F] text-white">
      <div className="container-page py-10 lg:py-12">
        {/* Top row: Logo + Back to top */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/" className="shrink-0">
            <Image
              src="/logo-white.svg"
              alt="Dreams Branch of UWAA"
              width={140}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 text-body text-white hover:text-primary transition-colors"
          >
            {t("footer.back_to_top")}
            <ArrowUpCircleIcon size={32} />
          </button>
        </div>

        {/* Main row: Social | Nav | Support button */}
        <div className=" border-t border-white/20 pt-5 flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-10 mb-10">
          {/* Social + contact */}
          <div className="flex flex-col gap-4 shrink-0">
            <a
              href="https://www.facebook.com/profile.php?id=100092434277929"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className=" hover:border-white transition-colors"
            >
              <FacebookInCircleIcon className=" w-9 h-9 text-white" />
            </a>
            <a
              href="mailto:dreamsbranch@gmail.com"
              className="flex items-center gap-2 text-h3 text-white/80 hover:text-white transition-colors"
            >
              <MailIcon size={30} />
              dreamsbranch@gmail.com
            </a>
          </div>

          {/* Nav */}
          <nav className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-6">
            <div>
              <Link
                href="/about"
                className="text-secondary text-white font-medium hover:text-primary transition-colors"
              >
                {t("nav.about")}
              </Link>
            </div>
            <div className="space-y-3">
              <Link
                href="/campaigns"
                className="block text-secondary text-white font-medium hover:text-primary transition-colors"
              >
                {t("nav.campaigns")}
              </Link>
              <Link
                href="/lottery"
                className="block text-body text-white hover:text-primary transition-colors"
              >
                {t("nav.lottery")}
              </Link>
              <Link
                href="/auction"
                className="block text-body text-white hover:text-primary transition-colors"
              >
                {t("nav.auction")}
              </Link>
            </div>
            <div className="space-y-3">
              <Link
                href="/events"
                className="block text-secondary text-white font-medium hover:text-primary transition-colors"
              >
                {t("nav.events")}
              </Link>
              <Link
                href="/reports"
                className="block text-body text-white hover:text-primary transition-colors"
              >
                {t("nav.reports")}
              </Link>
              <Link
                href="/news"
                className="block text-body text-white hover:text-primary transition-colors"
              >
                {t("nav.news")}
              </Link>
            </div>
            <div>
              <Link
                href="/shop"
                className="block text-secondary font-medium text-white hover:text-primary transition-colors"
              >
                {t("nav.shop")}
              </Link>
            </div>
            <div>
              <Link
                href="/contact"
                className="block text-secondary font-medium text-white  hover:text-primary transition-colors"
              >
                {t("nav.contact")}
              </Link>
            </div>
          </nav>

          {/* Support button */}
          <div className="shrink-0">
            <Button
              render={<Link href="/donate" />}
              variant="secondary"
              size="xl"
              shape="pill"
              className="w-50"
            >
              {t("nav.support")}
            </Button>
          </div>
        </div>

        {/* Bottom: Privacy + Copyright */}
        <div className="border-t border-white pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Link
            href="/privacy"
            className="text-body text-white hover:text-primary transition-colors"
          >
            {t("footer.privacy")}
          </Link>
          <div className="flex items-center gap-4">
            <p className="text-body text-white">
              © Copyright {year} | <span>Developed By </span>
              <a
                href="https://olhachernysh.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-white hover:text-primary underline underline-offset-2 transition-colors"
              >
                olhachernysh.dev
                <ArrowUpRight size={13} />
              </a>{" "}
              | All Rights Reserved
            </p>
            <NextLink
              href="/admin/login"
              className="text-white hover:text-white/50 transition-colors text-[11px]"
              title="Admin"
            >
              <UserCircleIcon size={36} />
            </NextLink>
          </div>
        </div>

        {/* Acknowledgment */}
        <div className="mt-5 pt-5 border-t border-white/10">
          <p className="text-small text-white max-w-3xl">
            {t("footer.acknowledgment")}
          </p>
        </div>
      </div>
    </footer>
  );
}
