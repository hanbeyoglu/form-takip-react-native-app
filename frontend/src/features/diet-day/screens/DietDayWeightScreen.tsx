import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, Text } from 'react-native';
import { z } from 'zod';

import { AppStackParamList } from '../../../app/navigation/types';
import { useAppLocale } from '../../../localization/useAppLocale';
import { AppHeader } from '../../../shared/components/AppHeader';
import { Card } from '../../../shared/components/Card';
import { FormTextField } from '../../../shared/components/FormTextField';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { ScreenContainer } from '../../../shared/components/ScreenContainer';
import { useWeightStore } from '../../../store/weight.store';
import { colors, spacing, typography } from '../../../theme/tokens';

const schema = z.object({
  weightKg: z.coerce.number().min(30).max(350),
});

type FormValues = z.infer<typeof schema>;
type Props = NativeStackScreenProps<AppStackParamList, 'DietDayWeight'>;

export function DietDayWeightScreen({ navigation }: Props): React.JSX.Element {
  const { t, language } = useAppLocale();
  const fallbacks = getDietDayFallbacks(language);
  const logs = useWeightStore((state) => state.logs);
  const isLoading = useWeightStore((state) => state.isLoading);
  const fetchLogs = useWeightStore((state) => state.fetchLogs);
  const addLog = useWeightStore((state) => state.addLog);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const latest = logs.length > 0 ? logs[0] : null;
  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      weightKg: latest?.weightKg,
    },
  });

  React.useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  React.useEffect(() => {
    if (latest?.weightKg) {
      reset({ weightKg: latest.weightKg });
    }
  }, [latest?.weightKg, reset]);

  const submit = async (values: FormValues): Promise<void> => {
    setSubmitError(null);
    try {
      await addLog({ weightKg: values.weightKg });
      navigation.replace('AddDietPlan', { fromDietDay: true });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : t('dietDay.weightSubmitError', { defaultValue: fallbacks.weightSubmitError })
      );
    }
  };

  return (
    <ScreenContainer>
      <AppHeader
        title={t('dietDay.weightTitle', { defaultValue: fallbacks.weightTitle })}
        subtitle={t('dietDay.weightSubtitle', { defaultValue: fallbacks.weightSubtitle })}
        showBackButton
      />
      <Card style={styles.formCard} variant="elevated">
        <Text style={styles.kicker}>{t('dietDay.weightKicker', { defaultValue: fallbacks.weightKicker })}</Text>
        <Text style={styles.title}>
          {t('dietDay.weightCardTitle', { defaultValue: fallbacks.weightCardTitle })}
        </Text>
        <FormTextField<FormValues>
          control={control}
          name="weightKg"
          label={t('weightTracker.weightLabel', { defaultValue: fallbacks.weightLabel })}
          placeholder={t('dietDay.weightPlaceholder', { defaultValue: fallbacks.weightPlaceholder })}
          keyboardType="numeric"
          selectTextOnFocus
          returnKeyType="done"
        />
        <Text style={styles.helper}>
          {t('dietDay.weightHelper', { defaultValue: fallbacks.weightHelper })}
        </Text>
        {submitError ? <Text style={styles.error}>{submitError}</Text> : null}
        <PrimaryButton
          label={t('common.continue', { defaultValue: fallbacks.continueLabel })}
          isLoading={isLoading}
          onPress={() => {
            void handleSubmit(submit)();
          }}
        />
      </Card>
    </ScreenContainer>
  );
}

function getDietDayFallbacks(language: string) {
  const map = {
    tr: {
      weightTitle: 'Diyet Görüş Günüm',
      weightSubtitle: 'Adım 1/2: Güncel kilonu gir.',
      weightKicker: 'DİYET GÖRÜŞ AKIŞI',
      weightCardTitle: 'Önce güncel ölçümünü netleştir',
      weightHelper: 'Son kilo değerin otomatik gelir; istersen düzenleyip devam et.',
      weightPlaceholder: 'Örn. 72.4',
      weightSubmitError: 'Kilo kaydı eklenemedi.',
      weightLabel: 'Kilo (kg)',
      continueLabel: 'Devam Et',
      successTitle: 'Diyet Günüm Tamamlandı',
      successSubtitle: 'Planın ve kilo kaydın güncellendi.',
      successKicker: 'TAMAMLANDI',
      successCardTitle: 'Bugünkü diyet görüş adımları tamamlandı.',
      successHelper:
        'Kilon kaydedildi ve yeni planın aktif edildi. Şimdi günlük takibine devam edebilirsin.',
      backToDashboard: 'Dashboard’a Dön',
    },
    en: {
      weightTitle: 'My Diet Review Day',
      weightSubtitle: 'Step 1/2: Enter your current weight.',
      weightKicker: 'DIET REVIEW FLOW',
      weightCardTitle: 'Start by clarifying your latest measurement',
      weightHelper: 'Your latest weight is filled in automatically; update it if needed and continue.',
      weightPlaceholder: 'E.g. 72.4',
      weightSubmitError: "Couldn't save the weight log.",
      weightLabel: 'Weight (kg)',
      continueLabel: 'Continue',
      successTitle: 'Diet Review Completed',
      successSubtitle: 'Your plan and weight log have been updated.',
      successKicker: 'COMPLETED',
      successCardTitle: "Today's diet review steps are complete.",
      successHelper:
        'Your weight was saved and your new plan is now active. You can continue with your daily tracking.',
      backToDashboard: 'Back to Dashboard',
    },
    de: {
      weightTitle: 'Mein Tag der Ernährungsberatung',
      weightSubtitle: 'Schritt 1/2: Gib dein aktuelles Gewicht ein.',
      weightKicker: 'ABLAUF DER ERNÄHRUNGSBERATUNG',
      weightCardTitle: 'Klare zuerst dein aktuelles Gewicht',
      weightHelper:
        'Dein letzter Gewichtswert wird automatisch eingesetzt. Passe ihn bei Bedarf an und fahre fort.',
      weightPlaceholder: 'Z. B. 72.4',
      weightSubmitError: 'Der Gewichtseintrag konnte nicht gespeichert werden.',
      weightLabel: 'Gewicht (kg)',
      continueLabel: 'Weiter',
      successTitle: 'Ernährungsberatung abgeschlossen',
      successSubtitle: 'Dein Plan und dein Gewichtseintrag wurden aktualisiert.',
      successKicker: 'ABGESCHLOSSEN',
      successCardTitle: 'Die heutigen Schritte der Ernährungsberatung sind abgeschlossen.',
      successHelper:
        'Dein Gewicht wurde gespeichert und dein neuer Plan aktiviert. Du kannst jetzt mit deinem täglichen Tracking weitermachen.',
      backToDashboard: 'Zurück zum Dashboard',
    },
    ar: {
      weightTitle: 'يوم مراجعة النظام الغذائي',
      weightSubtitle: 'الخطوة 1/2: أدخل وزنك الحالي.',
      weightKicker: 'تدفق مراجعة النظام الغذائي',
      weightCardTitle: 'ابدأ بتوضيح قياسك الحالي',
      weightHelper: 'يتم تعبئة آخر وزن تلقائيًا؛ يمكنك تعديله ثم المتابعة.',
      weightPlaceholder: 'مثال: 72.4',
      weightSubmitError: 'تعذر حفظ سجل الوزن.',
      weightLabel: 'الوزن (كغ)',
      continueLabel: 'متابعة',
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
  formCard: {
    gap: spacing.sm,
  },
  kicker: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sectionTitle,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  helper: {
    color: colors.textSecondary,
    fontSize: typography.helper,
  },
  error: {
    color: colors.danger,
    fontSize: typography.caption,
  },
});
