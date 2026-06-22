import type { ErrorBoundaryProps } from "expo-router";
import { Redirect, Stack, useSegments } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppProviders } from "@/components/app-providers";
import "@/global.css";
import { authClient } from "@/lib/auth-client";
import { GenericErrorScreen } from "@/screens/error/generic-error-screen";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <HeroUINativeProvider>
            <GenericErrorScreen
              title="Something went wrong"
              message="We encountered an unexpected issue while processing your request. The application has logged this event."
              errorDetails={{ status: error.message }}
              onRetry={retry}
            />
          </HeroUINativeProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { data: session, isPending } = authClient.useSession();
  const segments = useSegments();

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  // Unauthenticated user outside (auth) group → redirect to sign-in
  const inAuthGroup = segments[0] === "(auth)";
  if (!session && !inAuthGroup) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <RootNavigator />
      </AppProviders>
    </GestureHandlerRootView>
  );
}
