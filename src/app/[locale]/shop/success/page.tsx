import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ClearCartOnMount } from "@/components/shop/ClearCartOnMount";
import { Button } from "@/components/ui/button";

export default async function ShopSuccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  return (
    <section className="section">
      <div className="container-page max-w-narrow text-center">
        {/* Order placed — the webhook is the source of truth; this just
            empties the local cart and thanks the buyer. */}
        <ClearCartOnMount />
        <h1 className="text-title-tablet font-medium text-text-strong">
          {t("shop.order_success.title")}
        </h1>
        <p className="mt-4 whitespace-pre-line text-body text-text-primary">
          {t("shop.order_success.description")}
        </p>
        <Button
          render={<Link href={`/${locale}/shop`} />}
          size="xl"
          shape="pill"
          className="mt-8"
        >
          {t("shop.order_success.continue")}
        </Button>
      </div>
    </section>
  );
}
