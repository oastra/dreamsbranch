import { getTranslations, setRequestLocale } from "next-intl/server";
import { CartView } from "@/components/shop/CartView";

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const loc = locale === "ua" ? "ua" : "en";

  return (
    <section className="section">
      <div className="container-page">
        <h1 className="text-title-tablet mb-8 font-medium text-text-strong">
          {t("shop.cart.title")}
        </h1>

        <CartView
          locale={loc}
          shopHref={`/${locale}/shop`}
          labels={{
            empty: t("shop.cart.empty"),
            continueShopping: t("shop.cart.continue"),
            remove: t("shop.cart.remove"),
            total: t("shop.cart.total"),
            checkout: t("shop.cart.checkout"),
            processing: t("shop.cart.processing"),
            orSeparator: t("shop.product.or_separator"),
            quantityLabel: t("shop.product.quantity_label"),
            quantityDecrease: t("shop.product.quantity_decrease"),
            quantityIncrease: t("shop.product.quantity_increase"),
            error: t("shop.cart.error"),
          }}
        />
      </div>
    </section>
  );
}
