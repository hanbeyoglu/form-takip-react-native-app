import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { z } from "zod";

import { useAppLocale } from "../../../localization/useAppLocale";
import { AppHeader } from "../../../shared/components/AppHeader";
import { Card } from "../../../shared/components/Card";
import { OptionChipItem, OptionChips } from "../../../shared/components/OptionChips";
import { PrimaryButton } from "../../../shared/components/PrimaryButton";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { SectionTitle } from "../../../shared/components/SectionTitle";
import { useNotificationPrefsStore } from "../../../store/notificationPrefs.store";
import { useAuthStore } from "../../../store/auth.store";
import { LoadingState } from "../../../shared/components/LoadingState";
import { colors, spacing, typography } from "../../../theme/tokens";

const schema = z.object({
  mealReminderEnabled: z.boolean(),
  mealAtTimeEnabled: z.boolean(),
  mealReminderOffsetMin: z.coerce.number().refine((value) => [15, 30, 60].includes(value)),
  waterReminderEnabled: z.boolean(),
  waterIntervalMin: z.coerce.number().int().min(15).max(240),
  waterReminderStartTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  waterReminderEndTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
});

type FormValues = z.infer<typeof schema>;

const mealOffsetOptions: OptionChipItem<number>[] = [
  { label: "15 dk once", value: 15 },
  { label: "30 dk once", value: 30 },
  { label: "60 dk once", value: 60 }
];

const waterIntervalOptions: OptionChipItem<number>[] = [
  { label: "Her 1 saat", value: 60 },
  { label: "Her 1.5 saat", value: 90 },
  { label: "Her 2 saat", value: 120 }
];

const waterStartOptions: OptionChipItem<string>[] = [
  { label: "08:00", value: "08:00" },
  { label: "09:00", value: "09:00" },
  { label: "10:00", value: "10:00" }
];

const waterEndOptions: OptionChipItem<string>[] = [
  { label: "20:00", value: "20:00" },
  { label: "21:00", value: "21:00" },
  { label: "22:00", value: "22:00" }
];

export function NotificationPreferencesScreen(): React.JSX.Element {
  const { t } = useAppLocale();
  const user = useAuthStore((state) => state.user);
  const preferences = useNotificationPrefsStore((state) => state.preferences);
  const permissionStatus = useNotificationPrefsStore((state) => state.permissionStatus);
  const isLoading = useNotificationPrefsStore((state) => state.isLoading);
  const error = useNotificationPrefsStore((state) => state.error);
  const fetchPreferences = useNotificationPrefsStore((state) => state.fetchPreferences);
  const requestPermission = useNotificationPrefsStore((state) => state.requestPermission);
  const updatePreferences = useNotificationPrefsStore((state) => state.updatePreferences);
  const localizedMealOffsetOptions = React.useMemo<OptionChipItem<number>[]>(
    () => [
      { label: t("notifications.options.15before"), value: 15 },
      { label: t("notifications.options.30before"), value: 30 },
      { label: t("notifications.options.60before"), value: 60 }
    ],
    [t]
  );
  const localizedWaterIntervalOptions = React.useMemo<OptionChipItem<number>[]>(
    () => [
      { label: t("notifications.options.every1h"), value: 60 },
      { label: t("notifications.options.every90m"), value: 90 },
      { label: t("notifications.options.every2h"), value: 120 }
    ],
    [t]
  );

  const { control, handleSubmit, reset, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      mealReminderEnabled: true,
      mealAtTimeEnabled: true,
      mealReminderOffsetMin: 30,
      waterReminderEnabled: false,
      waterIntervalMin: 120,
      waterReminderStartTime: "09:00",
      waterReminderEndTime: "21:00"
    }
  });

  React.useEffect(() => {
    if (!user?.isProfileCompleted) {
      return;
    }
    void fetchPreferences();
  }, [fetchPreferences, user?.isProfileCompleted]);

  React.useEffect(() => {
    if (preferences) {
      reset({
        mealReminderEnabled: preferences.mealReminderEnabled,
        mealAtTimeEnabled: preferences.mealAtTimeEnabled,
        mealReminderOffsetMin: preferences.mealReminderOffsetMin,
        waterReminderEnabled: preferences.waterReminderEnabled,
        waterIntervalMin: preferences.waterIntervalMin,
        waterReminderStartTime: preferences.waterReminderStartTime,
        waterReminderEndTime: preferences.waterReminderEndTime
      } as FormValues);
    }
  }, [preferences, reset]);

  const mealReminderOffsetMin = watch("mealReminderOffsetMin");
  const waterIntervalMin = watch("waterIntervalMin");
  const waterReminderStartTime = watch("waterReminderStartTime");
  const waterReminderEndTime = watch("waterReminderEndTime");

  const onSubmit = async (data: FormValues): Promise<void> => {
    await updatePreferences(data as Parameters<typeof updatePreferences>[0]);
  };

  if (!user?.isProfileCompleted) {
    return (
      <ScreenContainer>
        <AppHeader
          title={t("notifications.title")}
          subtitle={t("notifications.completeProfile")}
          showBackButton
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader
          title={t("notifications.title")}
          subtitle={t("notifications.subtitle")}
          showBackButton
        />
        {isLoading && !preferences ? <LoadingState /> : null}

        <Card style={styles.heroCard} variant="elevated">
          <Text style={styles.heroKicker}>{t("notifications.heroKicker")}</Text>
          <Text style={styles.heroTitle}>{t("notifications.heroTitle")}</Text>
          <Text style={styles.heroText}>{t("notifications.heroText")}</Text>
        </Card>

        <SectionTitle title={t("notifications.mealSection")} />
        <Card style={styles.sectionCard}>
          <View style={styles.switchRow}>
            <View style={styles.switchCopy}>
              <Text style={styles.switchLabel}>{t("notifications.mealEnabled")}</Text>
              <Text style={styles.switchHint}>{t("notifications.mealEnabledHint")}</Text>
            </View>
            <Controller
              control={control}
              name="mealReminderEnabled"
              render={({ field: { value, onChange } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
                  thumbColor={value ? colors.primary : "#FFFFFF"}
                />
              )}
            />
          </View>
          {watch("mealReminderEnabled") ? (
            <>
              <View style={styles.switchRow}>
                <View style={styles.switchCopy}>
                  <Text style={styles.switchLabel}>{t("notifications.mealAtTime")}</Text>
                  <Text style={styles.switchHint}>{t("notifications.mealAtTimeHint")}</Text>
                </View>
                <Controller
                  control={control}
                  name="mealAtTimeEnabled"
                  render={({ field: { value, onChange } }) => (
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
                      thumbColor={value ? colors.primary : "#FFFFFF"}
                    />
                  )}
                />
              </View>
              <OptionChips<number>
                label={t("notifications.mealOffset")}
                options={localizedMealOffsetOptions}
                value={mealReminderOffsetMin ?? 30}
                onChange={(value) => setValue("mealReminderOffsetMin", value, { shouldValidate: true })}
              />
            </>
          ) : null}
        </Card>

        <SectionTitle title={t("notifications.waterSection")} />
        <Card style={styles.sectionCard}>
          <View style={styles.switchRow}>
            <View style={styles.switchCopy}>
              <Text style={styles.switchLabel}>{t("notifications.waterEnabled")}</Text>
              <Text style={styles.switchHint}>{t("notifications.waterEnabledHint")}</Text>
            </View>
            <Controller
              control={control}
              name="waterReminderEnabled"
              render={({ field: { value, onChange } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: colors.borderStrong, true: colors.primaryMuted }}
                  thumbColor={value ? colors.primary : "#FFFFFF"}
                />
              )}
            />
          </View>
          {watch("waterReminderEnabled") ? (
            <>
              <OptionChips<number>
                label={t("notifications.frequency")}
                options={localizedWaterIntervalOptions}
                value={waterIntervalMin ?? 120}
                onChange={(value) => setValue("waterIntervalMin", value, { shouldValidate: true })}
              />
              <OptionChips<string>
                label={t("notifications.start")}
                options={waterStartOptions}
                value={waterReminderStartTime ?? "09:00"}
                onChange={(value) =>
                  setValue("waterReminderStartTime", value, { shouldValidate: true })
                }
              />
              <OptionChips<string>
                label={t("notifications.end")}
                options={waterEndOptions}
                value={waterReminderEndTime ?? "21:00"}
                onChange={(value) =>
                  setValue("waterReminderEndTime", value, { shouldValidate: true })
                }
              />
            </>
          ) : null}
        </Card>

        <SectionTitle title={t("notifications.permissionSection")} />
        <Card style={styles.sectionCard} variant="muted">
          <Text style={styles.permissionLabel}>{t("notifications.permissionStatus")}</Text>
          <Text style={styles.permissionValue}>
            {permissionStatus === "granted"
              ? t("notifications.permissionGranted")
              : permissionStatus === "denied"
                ? t("notifications.permissionDenied")
                : t("notifications.permissionUnknown")}
          </Text>
          {permissionStatus !== "granted" ? (
            <PrimaryButton label={t("notifications.openPermission")} variant="secondary" onPress={() => void requestPermission()} />
          ) : null}
        </Card>

        <PrimaryButton
          label={t("notifications.save")}
          isLoading={isLoading}
          onPress={() => {
            void handleSubmit(onSubmit)();
          }}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl
  },
  heroCard: {
    marginBottom: spacing.lg
  },
  heroKicker: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 0.6
  },
  heroTitle: {
    marginTop: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: "800"
  },
  heroText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.helper,
    lineHeight: 20
  },
  sectionCard: {
    marginBottom: spacing.lg
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    gap: spacing.md
  },
  switchCopy: {
    flex: 1
  },
  switchLabel: {
    fontSize: typography.bodyStrong,
    color: colors.textPrimary,
    fontWeight: "700"
  },
  switchHint: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.helper,
    lineHeight: 19
  },
  permissionLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: spacing.sm
  },
  permissionValue: {
    marginBottom: spacing.lg,
    color: colors.textPrimary,
    fontSize: typography.bodyStrong,
    fontWeight: "700"
  },
  error: {
    marginTop: spacing.md,
    color: colors.danger,
    fontSize: typography.caption
  }
});
