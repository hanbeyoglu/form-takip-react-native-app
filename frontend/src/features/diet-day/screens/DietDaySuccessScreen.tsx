import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, Text } from "react-native";

import { AppStackParamList } from "../../../app/navigation/types";
import { useAppLocale } from "../../../localization/useAppLocale";
import { AppHeader } from "../../../shared/components/AppHeader";
import { Card } from "../../../shared/components/Card";
import { PrimaryButton } from "../../../shared/components/PrimaryButton";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { colors, spacing, typography } from "../../../theme/tokens";

type Props = NativeStackScreenProps<AppStackParamList, "DietDaySuccess">;

export function DietDaySuccessScreen({ navigation }: Props): React.JSX.Element {
  const { t, language } = useAppLocale();
  const fallbacks = getDietDayFallbacks(language);

  return (
    <ScreenContainer>
      <AppHeader
        title={t("dietDay.successTitle", { defaultValue: fallbacks.successTitle })}
        subtitle={t("dietDay.successSubtitle", { defaultValue: fallbacks.successSubtitle })}
        showBackButton
      />
      <Card style={styles.card} variant="elevated">
        <Text style={styles.kicker}>{t("dietDay.successKicker", { defaultValue: fallbacks.successKicker })}</Text>
        <Text style={styles.title}>
          {t("dietDay.successCardTitle", { defaultValue: fallbacks.successCardTitle })}
        </Text>
        <Text style={styles.helper}>
          {t("dietDay.successHelper", { defaultValue: fallbacks.successHelper })}
        </Text>
        <PrimaryButton
          label={t("dietDay.backToDashboard", { defaultValue: fallbacks.backToDashboard })}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: "Dashboard" }] })}
        />
      </Card>
    </ScreenContainer>
  );
}

function getDietDayFallbacks(language: string) {
  const map = {
    tr: {
      successTitle: 'Diyet Günüm Tamamlandı',
      successSubtitle: 'Planın ve kilo kaydın güncellendi.',
      successKicker: 'TAMAMLANDI',
      successCardTitle: 'Bugünkü diyet görüş adımları tamamlandı.',
      successHelper:
        'Kilon kaydedildi ve yeni planın aktif edildi. Şimdi günlük takibine devam edebilirsin.',
      backToDashboard: 'Dashboard’a Dön',
    },
    en: {
      successTitle: 'Diet Review Completed',
      successSubtitle: 'Your plan and weight log have been updated.',
      successKicker: 'COMPLETED',
      successCardTitle: "Today's diet review steps are complete.",
      successHelper:
        'Your weight was saved and your new plan is now active. You can continue with your daily tracking.',
      backToDashboard: 'Back to Dashboard',
    },
    de: {
      successTitle: 'Ernährungsberatung abgeschlossen',
      successSubtitle: 'Dein Plan und dein Gewichtseintrag wurden aktualisiert.',
      successKicker: 'ABGESCHLOSSEN',
      successCardTitle: 'Die heutigen Schritte der Ernährungsberatung sind abgeschlossen.',
      successHelper:
        'Dein Gewicht wurde gespeichert und dein neuer Plan aktiviert. Du kannst jetzt mit deinem täglichen Tracking weitermachen.',
      backToDashboard: 'Zurück zum Dashboard',
    },
    ar: {
      successTitle: 'اكتملت مراجعة النظام الغذائي',
      successSubtitle: 'تم تحديث خطتك وسجل وزنك.',
      successKicker: 'اكتمل',
      successCardTitle: 'اكتملت خطوات مراجعة النظام الغذائي لليوم.',
      successHelper: 'تم حفظ وزنك وتفعيل خطتك الجديدة. يمكنك الآن متابعة روتينك اليومي.',
      backToDashboard: 'العودة إلى الرئيسية',
    },
  } as const;
  return map[language as keyof typeof map] ?? map.tr;
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md
  },
  kicker: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 0.6
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sectionTitle,
    fontWeight: "800"
  },
  helper: {
    color: colors.textSecondary,
    fontSize: typography.helper,
    lineHeight: 20
  }
});
