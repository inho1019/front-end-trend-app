import i18next, { use } from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "react-native-localize";
import en from "./en/common.json";
import ko from "./ko/common.json";

const i18n = use.call(i18next, initReactI18next).init({
  compatibilityJSON: "v4",
  lng: getLocales()[0].languageTag,
  fallbackLng: "ko-KR",
  defaultNS: "common",
  resources: {
    ko: {
      common: ko,
    },
    en: {
      common: en,
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
