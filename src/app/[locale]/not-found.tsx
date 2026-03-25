"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

/* ─── Animated eyes ─────────────────────────────────────────────────────
   CSS keyframes — 3 positions (all at TOP of socket):
     0 %   top-left   translate(-28px, -26px)
     25%   top-center translate(  0px, -32px)
     50%   top-right  translate(+28px, -26px)
     75%   top-center translate(  0px, -32px)
     100%  top-left   (loop)

   Pupils sit at socket centres (cx/cy) and are moved via CSS transform.
   Eye socket centres: left=(70,97)  right=(223,97)
────────────────────────────────────────────────────────────────────────── */
const pupilKeyframes = `
@keyframes pupilSweep {
  0%,100% { transform: translate(-28px, -26px); }
  25%     { transform: translate(  0px, -32px); }
  50%     { transform: translate( 28px, -26px); }
  75%     { transform: translate(  0px, -32px); }
}`;

const pupilStyle: React.CSSProperties = {
  animation: "pupilSweep 3.2s cubic-bezier(0.42,0,0.58,1) infinite",
  transformBox: "fill-box",
  transformOrigin: "center",
};

function AnimatedEyes({ className }: { className?: string }) {
  return (
    <>
      <style>{pupilKeyframes}</style>
      <svg
        width="293"
        height="168"
        viewBox="0 0 293 168"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden
      >
        {/* ── left eye ── */}
        <circle cx="70" cy="97.0822" r="66" stroke="#2D3748" strokeWidth="8" />
        <path
          d="M22 27.0821C22 27.0821 49.1739 5.5006 68 4.08255C90.4301 2.39304 120 27.0821 120 27.0821"
          stroke="#2D3748"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <circle cx="70" cy="97" r="20" fill="#2D3748" style={pupilStyle} />

        {/* ── right eye ── */}
        <circle cx="223" cy="97.0822" r="66" stroke="#2D3748" strokeWidth="8" />
        <path
          d="M175 27.0821C175 27.0821 202.174 5.5006 221 4.08255C243.43 2.39304 273 27.0821 273 27.0821"
          stroke="#2D3748"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <circle cx="223" cy="97" r="20" fill="#2D3748" style={pupilStyle} />
      </svg>
    </>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="container-page py-12 lg:py-16">
      <div className="bg-secondary-10 rounded-3xl px-6 py-10 lg:px-14 lg:py-12">
        {/* ── Full-width Oops + eyes overlay ── */}
        <div className="relative mb-8">
          <Image
            src="/images/404/Oops.svg"
            alt="Oops"
            width={1068}
            height={390}
            className="w-full"
            priority
          />
          {/* eyes centred over the "oo" circles: 29%→69% of Oops width */}
          <div
            className="absolute pointer-events-none"
            style={{ left: "29%", top: "-4%", width: "40%" }}
          >
            <AnimatedEyes className="w-full h-auto" />
          </div>
        </div>

        {/* ── Bottom row: heading left · description + CTA right ── */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          <div className="flex-1">
            <h1 className="text-h2 text-text-primary">{t("title")}</h1>
          </div>

          <div className="flex flex-col items-start gap-4 sm:w-[260px] shrink-0">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-body text-text-primary leading-relaxed">
                {t("description")}
              </p>
            </div>
            <Link href="/">
              <Button variant="default" size="lg" className="rounded-full">
                {t("cta")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
