import { View, useColorScheme, type ViewProps } from "react-native";

import { ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  type = "background",
  ...otherProps
}: ThemedViewProps) {
  const theme = useTheme();
  const scheme = useColorScheme() ?? "light";

  const override = scheme === "dark" ? darkColor : lightColor;
  const backgroundColor = override ?? theme[type];

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
