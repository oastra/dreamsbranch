import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

const messages = {
  en: () => import("../../messages/en.json").then((m) => m.default),
  ua: () => import("../../messages/ua.json").then((m) => m.default),
};

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: await messages[locale as keyof typeof messages](),
  };
});
