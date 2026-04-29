import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { AuthStackParamList } from "../../../app/navigation/types";
import { useAppLocale } from "../../../localization/useAppLocale";
import { AppHeader } from "../../../shared/components/AppHeader";
import { Card } from "../../../shared/components/Card";
import { PrimaryButton } from "../../../shared/components/PrimaryButton";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { spacing, typography } from "../../../theme/tokens";

type Props = NativeStackScreenProps<AuthStackParamList, "Onboarding">;

export function OnboardingScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useAppLocale();
  return (
    <ScreenContainer style={styles.container}>
      <AppHeader
        title={t("auth.onboardingTitle")}
        subtitle={t("auth.onboardingSubtitle")}
      />
      <Card style={styles.card}>
        <Text style={styles.text}>- {t("auth.featureMealReminders")}</Text>
        <Text style={styles.text}>- {t("auth.featureWaterTracking")}</Text>
        <Text style={styles.text}>- {t("auth.featureWeightStats")}</Text>
      </Card>
      <View style={styles.actions}>
        <PrimaryButton
          label={t("auth.login")}
          onPress={() => navigation.navigate("Login")}
        />
        <View style={styles.gap} />
        <PrimaryButton
          label={t("auth.register")}
          onPress={() => navigation.navigate("Register")}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center"
  },
  card: {
    marginBottom: spacing.xl
  },
  text: {
    fontSize: typography.body,
    marginBottom: spacing.sm
  },
  actions: {
    marginTop: spacing.md
  },
  gap: {
    height: spacing.md
  }
});
