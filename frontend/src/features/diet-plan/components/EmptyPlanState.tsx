import React from "react";
import { StyleSheet, View } from "react-native";

import { useAppLocale } from "../../../localization/useAppLocale";
import { Card } from "../../../shared/components/Card";
import { EmptyState } from "../../../shared/components/EmptyState";
import { spacing } from "../../../theme/tokens";

type EmptyPlanStateProps = {
  title?: string;
  description?: string;
};

export function EmptyPlanState({
  title,
  description
}: EmptyPlanStateProps): React.JSX.Element {
  const { t } = useAppLocale();
  return (
    <View style={styles.container}>
      <Card variant="elevated">
        <EmptyState
          title={title ?? t("plans.emptyStateTitle")}
          description={description ?? t("plans.emptyStateDescription")}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg
  }
});
