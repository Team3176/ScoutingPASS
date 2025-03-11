import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ScoutingProvider } from "../context/ScoutingContext";
import { useColorScheme } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) {
      console.error("Error loading fonts:", error);
      // Hide splash screen even if there's an error
      SplashScreen.hideAsync().catch((e) =>
        console.warn("Error hiding splash screen:", e)
      );
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch((e) =>
        console.warn("Error hiding splash screen:", e)
      );
    }
  }, [loaded]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <ScoutingProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ScoutingProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
