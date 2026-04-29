import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { RootNavigator } from "./navigation/RootNavigator";
import { appTheme } from "../theme/theme";
import "../localization/i18n";

export function RootApp(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={appTheme.navigation}>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
