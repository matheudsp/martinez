import { Button, Text } from "heroui-native";
import { View } from "react-native";

import { GoogleIcon } from "@/components/auth/google-icon";
import { StandardView } from "@/components/ui/screen-containers/standard-view";
import { useGoogleSignIn } from "@/hooks/auth/use-google-sign-in";

export function SignInScreen() {
  const { signIn, isLoading, error } = useGoogleSignIn();

  return (
    <StandardView className="px-6">
      <View className="flex-1 justify-center gap-16">
        {/* Branding */}
        <View className="items-center gap-2">
          <Text className="text-4xl font-bold tracking-tight text-foreground">Martinez</Text>
          <Text className="text-foreground-500 text-center text-base">Acompanhe os preços dos combustíveis</Text>
        </View>

        {/* Actions */}
        <View className="gap-3">
          {error ? <Text className="text-center text-sm text-danger">{error}</Text> : null}

          <Button
            onPress={signIn}
            isDisabled={isLoading}
            variant="outline"
            size="lg"
            // isLoading={isLoading}
            // startContent={isLoading ? null : <GoogleIcon size={20} />}
            className="w-full"
          >
            Entrar com Google
          </Button>
        </View>
      </View>
    </StandardView>
  );
}
