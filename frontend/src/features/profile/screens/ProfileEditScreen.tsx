import { zodResolver } from "@hookform/resolvers/zod";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { z } from "zod";

import { AppStackParamList } from "../../../app/navigation/types";
import { languageOptions } from "../../../localization/config";
import { useAppLocale } from "../../../localization/useAppLocale";
import { AppHeader } from "../../../shared/components/AppHeader";
import { Card } from "../../../shared/components/Card";
import { FormTextField } from "../../../shared/components/FormTextField";
import { OptionChips } from "../../../shared/components/OptionChips";
import { PrimaryButton } from "../../../shared/components/PrimaryButton";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { SectionTitle } from "../../../shared/components/SectionTitle";
import { colors, radius, spacing, typography } from "../../../theme/tokens";
import { useAuthStore } from "../../../store/auth.store";
import { ProfileFieldButton } from "../components/ProfileFieldButton";
import { ProfileOptionsModal } from "../components/ProfileOptionsModal";
import {
  getSuggestedTimezoneForRegion,
  inferRegionIdFromTimezone,
  profileRegions,
  profileTimezoneIANAs,
  type ProfileRegionId
} from "../constants/regionTimezone";
import { profileService } from "../services/profile.service";

const optionalNumberFromInput = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().min(30).max(350).optional()
);

type ProfileEditForm = {
  name: string;
  gender: "male" | "female" | "other";
  timezone: string;
  heightCm?: number;
  dailyWaterTargetMl?: number;
  startingWeightKg?: number;
  targetWeightKg?: number;
};
type Props = NativeStackScreenProps<AppStackParamList, "ProfileEdit">;

function timezoneLabelFromT(iana: string, t: (key: string) => string): string {
  const key = `profile.timezoneLabels.${iana.replace(/\//g, "_")}`;
  const translated = t(key);
  if (translated !== key) {
    return translated;
  }
  return iana;
}

export function ProfileEditScreen({ navigation }: Props): React.JSX.Element {
  const { t, language, textAlign, isRTL } = useAppLocale();
  const user = useAuthStore((state) => state.user);
  const updateUserInState = useAuthStore((state) => state.updateUserInState);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [regionModalOpen, setRegionModalOpen] = React.useState(false);
  const [timezoneModalOpen, setTimezoneModalOpen] = React.useState(false);
  const [regionId, setRegionId] = React.useState<ProfileRegionId | null>(() =>
    user?.timezone ? inferRegionIdFromTimezone(user.timezone) : null
  );

  const genderOptions = React.useMemo(
    () =>
      [
        { label: t("common.male"), value: "male" },
        { label: t("common.female"), value: "female" },
        { label: t("common.other"), value: "other" }
      ] as const,
    [t]
  );
  const profileEditSchema = React.useMemo(
    () =>
      z.object({
        name: z.string().min(2, t("auth.validation.name")),
        gender: z.enum(["male", "female", "other"]),
        timezone: z.string().min(3, t("auth.validation.timezone")),
        heightCm: z.coerce.number().min(100).max(260),
        dailyWaterTargetMl: z.coerce.number().min(500).max(6000),
        startingWeightKg: optionalNumberFromInput,
        targetWeightKg: optionalNumberFromInput
      }),
    [t]
  );
  const { control, handleSubmit, setValue, watch } = useForm<ProfileEditForm>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      name: user?.name ?? "",
      gender: user?.gender ?? "other",
      timezone: user?.timezone ?? "Europe/Istanbul",
      heightCm: user?.heightCm,
      dailyWaterTargetMl: user?.dailyWaterTargetMl,
      startingWeightKg: user?.startingWeightKg,
      targetWeightKg: user?.targetWeightKg
    }
  });
  const selectedGender = watch("gender");
  const timezoneValue = watch("timezone");

  const currentLanguageEndonym = React.useMemo(
    () => languageOptions.find((o) => o.code === language)?.endonym ?? language.toUpperCase(),
    [language]
  );

  const regionModalOptions = React.useMemo(
    () =>
      profileRegions.map((r) => ({
        value: r.id,
        label: t(`profile.regions.${r.id}`)
      })),
    [t]
  );

  const timezoneModalOptions = React.useMemo(() => {
    const known = profileTimezoneIANAs.map((iana) => ({
      value: iana,
      label: timezoneLabelFromT(iana, t)
    }));
    if (timezoneValue && !known.some((o) => o.value === timezoneValue)) {
      return [{ value: timezoneValue, label: timezoneValue }, ...known];
    }
    return known;
  }, [timezoneValue, t]);

  const onSubmit = async (form: ProfileEditForm): Promise<void> => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const updatedProfile = await profileService.updateProfile(form);
      updateUserInState(updatedProfile);
      navigation.goBack();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t("profile.updateFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const regionDisplay = regionId ? t(`profile.regions.${regionId}`) : "";

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title={t("profile.editTitle")} subtitle={t("profile.editSubtitle")} showBackButton />
        <Card style={styles.heroCard} variant="elevated">
          <Text style={styles.heroKicker}>{t("profile.heroKicker")}</Text>
          <Text style={styles.heroTitle}>{t("profile.heroTitle")}</Text>
          <Text style={styles.heroText}>{t("profile.heroText")}</Text>
        </Card>

        <SectionTitle title={t("profile.basicInfo")} />
        <Card style={styles.sectionCard}>
          <FormTextField<ProfileEditForm> control={control} name="name" label={t("auth.name")} autoCapitalize="words" />
          <OptionChips
            label={t("common.gender")}
            options={[...genderOptions]}
            value={selectedGender}
            onChange={(value) => {
              setValue("gender", value, { shouldDirty: true, shouldValidate: true });
            }}
          />
        </Card>

        <SectionTitle title={t("profile.sectionLanguageRegion")} />
        <Card style={styles.regionCard} variant="elevated">
          <View style={styles.regionInner}>
            <Pressable
              onPress={() => navigation.navigate("LanguageSettings")}
              style={({ pressed }) => [styles.languageRow, pressed ? styles.languageRowPressed : null]}
              accessibilityRole="button"
              accessibilityLabel={t("profile.appLanguage")}
            >
              <View style={[styles.languageRowMain, isRtlRow(isRTL)]}>
                <View style={styles.languageTexts}>
                  <Text style={[styles.languageLabel, { textAlign }]}>{t("profile.appLanguage")}</Text>
                  <Text style={[styles.languageHint, { textAlign }]}>{t("profile.appLanguageHint")}</Text>
                  <Text style={[styles.languageValue, { textAlign }]}>{currentLanguageEndonym}</Text>
                </View>
                <ChevronRight color={colors.textMuted} size={22} strokeWidth={2.2} />
              </View>
            </Pressable>

            <View style={styles.divider} />

            <ProfileFieldButton
              label={t("profile.regionCountry")}
              displayValue={regionDisplay}
              placeholder={t("profile.selectPlaceholder")}
              onPress={() => setRegionModalOpen(true)}
            />

            <Controller
              control={control}
              name="timezone"
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <ProfileFieldButton
                  label={t("profile.timezoneField")}
                  displayValue={value ? timezoneLabelFromT(value, t) : ""}
                  placeholder={t("profile.selectPlaceholder")}
                  onPress={() => setTimezoneModalOpen(true)}
                  errorMessage={error?.message}
                  helperText={t("profile.timezoneHelper")}
                />
              )}
            />
          </View>
        </Card>

        <SectionTitle title={t("profile.bodyGoals")} />
        <Card style={styles.sectionCard}>
          <FormTextField<ProfileEditForm> control={control} name="heightCm" label={t("profile.height")} keyboardType="numeric" />
          <FormTextField<ProfileEditForm>
            control={control}
            name="dailyWaterTargetMl"
            label={t("profile.waterTarget")}
            keyboardType="numeric"
            placeholder={t("profile.placeholders.waterTarget")}
          />
          <FormTextField<ProfileEditForm>
            control={control}
            name="startingWeightKg"
            label={t("profile.startingWeight")}
            keyboardType="numeric"
            placeholder={t("profile.placeholders.startingWeight")}
          />
          <FormTextField<ProfileEditForm>
            control={control}
            name="targetWeightKg"
            label={t("profile.targetWeight")}
            keyboardType="numeric"
            placeholder={t("profile.placeholders.targetWeight")}
          />
        </Card>

        <ProfileOptionsModal
          visible={regionModalOpen}
          title={t("profile.regionCountry")}
          options={regionModalOptions}
          selectedValue={regionId}
          searchable
          searchPlaceholder={t("profile.searchRegions")}
          onClose={() => setRegionModalOpen(false)}
          onSelect={(id) => {
            setRegionId(id as ProfileRegionId);
            setValue("timezone", getSuggestedTimezoneForRegion(id as ProfileRegionId), {
              shouldDirty: true,
              shouldValidate: true
            });
          }}
        />
        <ProfileOptionsModal
          visible={timezoneModalOpen}
          title={t("profile.timezoneField")}
          options={timezoneModalOptions}
          selectedValue={timezoneValue}
          searchable={false}
          onClose={() => setTimezoneModalOpen(false)}
          onSelect={(iana) => {
            setValue("timezone", iana, { shouldDirty: true, shouldValidate: true });
            const inferred = inferRegionIdFromTimezone(iana);
            if (inferred !== null) {
              setRegionId(inferred);
            }
          }}
        />

        {submitError ? <Text style={styles.error}>{submitError}</Text> : null}
        <PrimaryButton
          label={t("profile.save")}
          onPress={() => {
            void handleSubmit(onSubmit)();
          }}
          isLoading={isSubmitting}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

function isRtlRow(isRTL: boolean): { flexDirection: "row" | "row-reverse" } {
  return { flexDirection: isRTL ? "row-reverse" : "row" };
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
  regionCard: {
    marginBottom: spacing.lg,
    paddingVertical: spacing.lg
  },
  regionInner: {
    gap: spacing.lg
  },
  languageRow: {
    marginHorizontal: -spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md
  },
  languageRowPressed: {
    opacity: 0.88
  },
  languageRowMain: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  languageTexts: {
    flex: 1
  },
  languageLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "700",
    letterSpacing: 0.2
  },
  languageHint: {
    marginTop: spacing.xxs,
    color: colors.textMuted,
    fontSize: typography.caption,
    lineHeight: 16
  },
  languageValue: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.bodyStrong,
    fontWeight: "800"
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSoft
  },
  error: {
    marginBottom: spacing.md,
    color: colors.danger,
    fontSize: typography.caption
  }
});
