import { Card, Chip, Spinner } from "heroui-native";
import { View } from "react-native";
import { tv } from "tailwind-variants";

import { BrandHeroIcon } from "@/components/brand-hero-icon/brand-hero-icon";
import { StandardScrollView } from "@/components/ui/screen-containers/standard-scroll-view";
import { Typography } from "@/components/ui/typography";

const statusDotVariants = tv({
  base: "size-2 rounded-full",
  variants: {
    status: {
      connected: "bg-success",
      error: "bg-danger",
    },
  },
});

const TECH_STACK = ["Expo SDK 55", "React 19", "Tailwind v4", "tRPC v11", "HeroUI Native", "TypeScript"] as const;

export function HomeScreen() {
  return (
    <StandardScrollView className="flex-1" contentContainerClassName="items-center gap-10 pb-8 pt-12">
      {/* Branding */}
      <View className="items-center gap-6">
        <BrandHeroIcon />
        <View className="items-center gap-2">
          <Typography variant="display" align="center">
            Expo Uniwind{"\n"}Starter
          </Typography>
          <Typography variant="small" tone="muted" align="center">
            A production-ready foundation for cross-platform apps.
          </Typography>
        </View>
      </View>

      {/* Tech Stack */}
      <View className="flex-row flex-wrap justify-center gap-2">
        {TECH_STACK.map((tech) => (
          <Chip key={tech} variant="primary" color="default" size="sm">
            {tech}
          </Chip>
        ))}
      </View>

      {/* Server Status */}
      <Card className="w-full">
        <Card.Body className="gap-1 p-4">
          <View className="flex-row items-center gap-2">
            <Spinner size="sm" />

            <Typography variant="smallBold"></Typography>
          </View>
        </Card.Body>
      </Card>

      <Typography variant="caption" tone="muted" align="center">
        Edit src/screens/home-screen.tsx to customize this screen
      </Typography>
    </StandardScrollView>
  );
}
