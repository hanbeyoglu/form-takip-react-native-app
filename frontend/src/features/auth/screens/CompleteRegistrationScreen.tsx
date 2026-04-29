import { zodResolver } from "@hookform/resolvers/zod";
import { useFocusEffect } from "@react-navigation/native";
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

import { AuthStackParamList } from "../../../app/navigation/types";
import { useAppLocale } from "../../../localization/useAppLocale";
import { AppHeader } from "../../../shared/components/AppHeader";
import { FormTextField } from "../../../shared/components/FormTextField";
import { OptionChips } from "../../../shared/components/OptionChips";
import { PrimaryButton } from "../../../shared/components/PrimaryButton";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { useAuthStore } from "../../../store/auth.store";
import { spacing, typography } from "../../../theme/tokens";

type CompleteRegistrationForm = {
  name: string;
  password: string;
  confirmPassword: string;
  gender: "male" | "female" | "other";
};

type Props = NativeStackScreenProps<AuthStackParamList, "CompleteRegistration">;

const REGISTER_TIMEZONE = "Europe/Istanbul";

export function CompleteRegistrationScreen({
  navigation,
  route
}: Props): React.JSX.Element {
  const { t, textAlign } = useAppLocale();
  const pendingRegistration = useAuthStore((state) => state.pendingRegistration);
  const completeRegistration = useAuthStore((state) => state.completeRegistration);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.authError);
  const clearAuthError = useAuthStore((state) => state.clearAuthError);
  const clearAuthFeedback = useAuthStore((state) => state.clearAuthFeedback);
  const nameInputRef = React.useRef<TextInput>(null);
  const passwordInputRef = React.useRef<TextInput>(null);
  const confirmPasswordInputRef = React.useRef<TextInput>(null);
  const phoneNumber = route.params.phoneNumber;

  const completeRegistrationSchema = React.useMemo(
    () =>
      z
        .object({
          name: z.string().min(2, t("auth.validation.name")),
          password: z.string().min(8, t("auth.validation.password")),
          confirmPassword: z.string(),
          gender: z.enum(["male", "female", "other"])
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: t("auth.validation.confirmPassword"),
          path: ["confirmPassword"]
        }),
    [t]
  );

  const { control, handleSubmit, setValue, watch } = useForm<CompleteRegistrationForm>({
    resolver: zodResolver(completeRegistrationSchema),
    defaultValues: {
      name: "",
      password: "",
      confirmPassword: "",
      gender: "other"
    }
  });
  const selectedGender = watch("gender");

  React.useEffect(() => {
    if (
      !pendingRegistration
      || pendingRegistration.phoneNumber !== phoneNumber
      || !pendingRegistration.firebaseIdToken
    ) {
      navigation.replace("Register");
    }
  }, [navigation, pendingRegistration, phoneNumber]);

  useFocusEffect(
    React.useCallback(() => {
      clearAuthError();
      clearAuthFeedback();
    }, [clearAuthError, clearAuthFeedback])
  );

  const genderOptions = React.useMemo(
    () => [
      { label: t("common.male"), value: "male" },
      { label: t("common.female"), value: "female" },
      { label: t("common.other"), value: "other" }
    ] as const,
    [t]
  );

  const onSubmit = async (data: CompleteRegistrationForm): Promise<void> => {
    clearAuthError();
    await completeRegistration({
      phoneNumber,
      name: data.name.trim(),
      password: data.password,
      gender: data.gender,
      timezone: REGISTER_TIMEZONE
    });
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
              title={t("auth.completeRegistrationTitle")}
              subtitle={t("auth.completeRegistrationSubtitle")}
              showBackButton
            />
            <Text style={[styles.phoneHint, { textAlign }]}>
              {t("auth.verifiedPhone", { phoneNumber })}
            </Text>
            <FormTextField<CompleteRegistrationForm>
              control={control}
              name="name"
              label={t("auth.name")}
              placeholder={t("auth.placeholders.name")}
              autoCapitalize="words"
              autoComplete="name"
              autoCorrect={false}
              inputRef={nameInputRef}
              returnKeyType="next"
              textContentType="name"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
            />
            <FormTextField<CompleteRegistrationForm>
              control={control}
              name="password"
              label={t("auth.password")}
              placeholder={t("auth.placeholders.password")}
              autoCapitalize="none"
              autoComplete="new-password"
              autoCorrect={false}
              inputRef={passwordInputRef}
              returnKeyType="next"
              secureTextEntry
              textContentType="newPassword"
              onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
            />
            <FormTextField<CompleteRegistrationForm>
              control={control}
              name="confirmPassword"
              label={t("auth.confirmPassword")}
              placeholder={t("auth.placeholders.password")}
              autoCapitalize="none"
              autoComplete="new-password"
              autoCorrect={false}
              blurOnSubmit
              inputRef={confirmPasswordInputRef}
              returnKeyType="done"
              secureTextEntry
              textContentType="newPassword"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            <OptionChips
              label={t("common.gender")}
              options={[...genderOptions]}
              value={selectedGender}
              onChange={(value) => {
                setValue("gender", value, { shouldDirty: true, shouldValidate: true });
              }}
            />
            {authError ? <Text style={[styles.error, { textAlign }]}>{authError}</Text> : null}
            <PrimaryButton
              label={t("auth.completeRegistration")}
              onPress={() => {
                Keyboard.dismiss();
                void handleSubmit(onSubmit)();
              }}
              isLoading={isLoading}
            />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
  phoneHint: {
    marginBottom: spacing.lg,
    fontSize: typography.body,
    color: "#475467"
  },
  error: {
    marginBottom: spacing.md,
    color: "#DC2626",
    fontSize: typography.caption
  }
});
