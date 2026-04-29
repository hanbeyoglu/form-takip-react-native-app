import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { FlatList, Pressable, StyleSheet } from "react-native";

import { AppStackParamList } from "../../../app/navigation/types";
import { useAppLocale } from "../../../localization/useAppLocale";
import { AppHeader } from "../../../shared/components/AppHeader";
import { DietPlanCard } from "../components/DietPlanCard";
import { EmptyPlanState } from "../components/EmptyPlanState";
import { LoadingState } from "../../../shared/components/LoadingState";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { useDietPlanStore } from "../../../store/dietPlan.store";
import { spacing } from "../../../theme/tokens";

type Props = NativeStackScreenProps<AppStackParamList, "PlanHistory">;

export function PlanHistoryScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useAppLocale();
  const history = useDietPlanStore((state) => state.history);
  const isLoading = useDietPlanStore((state) => state.isLoading);
  const fetchHistory = useDietPlanStore((state) => state.fetchHistory);

  React.useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  return (
    <ScreenContainer>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <AppHeader
              title={t("plans.historyTitle")}
              subtitle={t("plans.historySubtitle")}
              showBackButton
            />
            {isLoading ? <LoadingState /> : null}
            {!isLoading && history.length === 0 ? (
              <EmptyPlanState
                title={t("plans.historyEmptyTitle")}
                description={t("plans.historyEmptyDescription")}
              />
            ) : null}
          </>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.itemPressable}
            onPress={() => navigation.navigate("DietPlanDetail", { planId: item.id })}
          >
            <DietPlanCard plan={item} />
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: spacing.xxxl
  },
  itemPressable: {
    marginBottom: spacing.xs
  }
});
