import { SafeAreaView } from "react-native-safe-area-context";
import "../locales/i18n"; // i18n 초기화
import { WebviewPage } from "../pages";
import { useThemeStore } from "../store";

export default function App() {
  const theme = useThemeStore(state => state.theme);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme === "dark" ? "#121212" : "#fff" }}>
      <WebviewPage />
    </SafeAreaView>
  );
}
