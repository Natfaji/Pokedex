import { View, useColorScheme, type ViewProps } from "react-native";

import { ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
  themeColor?: ThemeColor;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  type = "background",
  themeColor,
  ...otherProps
}: ThemedViewProps) {
  const theme = useTheme();
  const scheme = useColorScheme() ?? "light";

  const override = scheme === "dark" ? darkColor : lightColor;
  const backgroundColor = override ?? theme[themeColor ?? type];
  const borderColor = theme.border;

  return (
    <View
      style={[
        {
          backgroundColor: backgroundColor,
          borderColor,
        },
        style,
      ]}
      {...otherProps}
    />
  );
}
