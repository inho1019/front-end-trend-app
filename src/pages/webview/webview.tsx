import dedent from "dedent";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BackHandler, Platform, StyleSheet, ToastAndroid } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { useFavoriteStore, useThemeStore } from "../../store";

export const WebviewPage = () => {
  const webviewRef = useRef<WebView>(null);
  const {t} = useTranslation();

  const [canGoBack, setCanGoBack] = useState(true);

  const favoriteSiteIds = useFavoriteStore(state => state.favoriteSiteIds);
  const toggleFavoriteSite = useFavoriteStore(state => state.toggleFavoriteSite);

  const theme = useThemeStore(state => state.theme);
  const setTheme = useThemeStore(state => state.setTheme);

  const respond = useCallback((id: string, message?: string | null) => {
    if (webviewRef.current == null) return;
    if (message != null) {
      webviewRef.current.injectJavaScript(dedent`
      window.dispatchEvent(new CustomEvent("response_${id}", {
        detail: "${encodeURIComponent(message)}"
      }));
    `);
    } else {
      webviewRef.current.injectJavaScript(dedent`
      window.dispatchEvent(new CustomEvent("response_${id}"));
    `);
    }
  }, []);

  const handleMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      if (webviewRef.current == null) return;
      const rawData = event.nativeEvent.data;
      const data = JSON.parse(rawData);

      let message: string | null = null;
      switch (data.type) {
        case "getFavoriteSiteIds": {
          message = JSON.stringify(favoriteSiteIds);
          break;
        }
        case "toggleFavoriteSite": {
          if (data.siteId == null) return;
          toggleFavoriteSite(data.siteId);
          break;
        }
        case "getTheme": {
          message = theme;
          break;
        }
        case "setTheme": {
          if (data.theme == null) return;
          setTheme(data.theme);
          break;
        }
        case "setCanGoBack": {
          if (data.canGoBack == null) return;
          setCanGoBack(data.canGoBack);
          break; 
        }
      }
      respond(data.id, message);
    },
    [favoriteSiteIds, respond, setTheme, theme, toggleFavoriteSite],
  );

  useEffect(() => {
    let isExitApp : boolean = false;
    let timeout : number;

    const backAction = () => {
      if (canGoBack) {
        webviewRef.current?.goBack();
        return true;
      }
      if (!isExitApp) {
        isExitApp = true;
        ToastAndroid.show(t("common.goBackExitApp"), ToastAndroid.SHORT);
        
        timeout = setTimeout(() => {isExitApp = false;}, 2000);
      } else {
        clearTimeout(timeout);
        isExitApp = false;
        BackHandler.exitApp();
      }
      return true;
    }

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    )

    return () => {
        backHandler.remove();
    };
  },[canGoBack, t])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme === "dark" ? "#121212" : "#fff" }}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <WebView
        ref={webviewRef}
        style={styles.flex1}
        containerStyle={styles.flex1}
        source={{ uri: "https://fe-trend.netlify.app/" }}
        cacheEnabled={!__DEV__}
        webviewDebuggingEnabled={__DEV__}
        onMessage={handleMessage}
        sharedCookiesEnabled={true}
        mediaPlaybackRequiresUserAction={true}
        bounces={false}
        injectedJavaScriptBeforeContentLoaded={dedent`
          window.ReactNativeMetadata = {
            os: "${Platform.OS}",
          };
        `} />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
});