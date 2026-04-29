import { zodResolver } from "@hookform/resolvers/zod";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback
} from "react-native";
import { z } from "zod";

import { AppStackParamList } from "../../../app/navigation/types";
import { useAppLocale } from "../../../localization/useAppLocale";
import { profileService } from "../services/profile.service";
import { AppHeader } from "../../../shared/components/AppHeader";
import { FormTextField } from "../../../shared/components/FormTextField";
import { KeyboardDoneAccessory } from "../../../shared/components/KeyboardDoneAccessory";
import { PrimaryButton } from "../../../shared/components/PrimaryButton";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { spacing, typography } from "../../../theme/tokens";
import { useAuthStore } from "../../../store/auth.store";

const optionalNumberFromInput = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().min(30).max(350).optional()
);

type ProfileSetupForm = {
  heightCm?: number;
  dailyWaterTargetMl?: number;
  startingWeightKg?: number;
  targetWeightKg?: number;
};
type Props = NativeStackScreenProps<AppStackParamList, "ProfileSetup">;
const IOS_NUMERIC_ACCESSORY_ID = "profile-setup-numeric-accessory";

export function ProfileSetupScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useAppLocale();
  const user = useAuthStore((state) => state.user);
  const updateUserInState = useAuthStore((state) => state.updateUserInState);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const heightInputRef = React.useRef<TextInput>(null);
  const waterInputRef = React.useRef<TextInput>(null);
  const startingWeightInputRef = React.useRef<TextInput>(null);
  const targetWeightInputRef = React.useRef<TextInput>(null);

  const profileSetupSchema = React.useMemo(
    () =>
      z.object({
        heightCm: z.coerce.number().min(100).max(260),
        dailyWaterTargetMl: z.coerce.number().min(500).max(6000),
        startingWeightKg: optionalNumberFromInput,
        targetWeightKg: optionalNumberFromInput
      }),
    []
  );
  const { control, handleSubmit } = useForm<ProfileSetupForm>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      heightCm: user?.heightCm,
      dailyWaterTargetMl: user?.dailyWaterTargetMl,
      startingWeightKg: user?.startingWeightKg,
      targetWeightKg: user?.targetWeightKg
    }
  });

  const onSubmit = async (form: ProfileSetupForm): Promise<void> => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const updatedProfile = await profileService.updateProfile(form);
      updateUserInState(updatedProfile);
      navigation.replace("Dashboard");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t("profile.updateFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback accessibilityElementsHidden accessible={false} onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <AppHeader
              title={t("profile.setupTitle")}
              subtitle={t("profile.setupSubtitle")}
            />
            <FormTextField<ProfileSetupForm>
              control={control}
              name="heightCm"
              label={t("profile.height")}
              placeholder={t("profile.placeholders.height")}
              blurOnSubmit={false}
              inputAccessoryViewID={IOS_NUMERIC_ACCESSORY_ID}
              inputRef={heightInputRef}
              keyboardType="numeric"
              returnKeyType="next"
              onSubmitEditing={() => waterInputRef.current?.focus()}
            />
            <FormTextField<ProfileSetupForm>
              control={control}
              name="dailyWaterTargetMl"
              label={t("profile.waterTarget")}
              placeholder={t("profile.placeholders.waterTarget")}
              blurOnSubmit={false}
              inputAccessoryViewID={IOS_NUMERIC_ACCESSORY_ID}
              inputRef={waterInputRef}
              keyboardType="numeric"
              returnKeyType="next"
              onSubmitEditing={() => startingWeightInputRef.current?.focus()}
            />
            <FormTextField<ProfileSetupForm>
              control={control}
              name="startingWeightKg"
              label={`${t("profile.startingWeight")} (${t("common.optional")})`}
              placeholder={t("profile.placeholders.startingWeight")}
              blurOnSubmit={false}
              inputAccessoryViewID={IOS_NUMERIC_ACCESSORY_ID}
              inputRef={startingWeightInputRef}
              keyboardType="numeric"
              returnKeyType="next"
              onSubmitEditing={() => targetWeightInputRef.current?.focus()}
            />
            <FormTextField<ProfileSetupForm>
              control={control}
              name="targetWeightKg"
              label={`${t("profile.targetWeight")} (${t("common.optional")})`}
              placeholder={t("profile.placeholders.targetWeight")}
              blurOnSubmit
              inputAccessoryViewID={IOS_NUMERIC_ACCESSORY_ID}
              inputRef={targetWeightInputRef}
              keyboardType="numeric"
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            {submitError ? <Text style={styles.error}>{submitError}</Text> : null}
            <PrimaryButton
              label={t("profile.setupSave")}
              onPress={() => {
                Keyboard.dismiss();
                void handleSubmit(onSubmit)();
              }}
              isLoading={isSubmitting}
            />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <KeyboardDoneAccessory nativeID={IOS_NUMERIC_ACCESSORY_ID} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  content: {
    flexGrow: 1,
    paddingBottom: spacing.xxxl
  },
  error: {
    marginBottom: spacing.md,
    color: "#DC2626",
    fontSize: typography.caption
  }
});
