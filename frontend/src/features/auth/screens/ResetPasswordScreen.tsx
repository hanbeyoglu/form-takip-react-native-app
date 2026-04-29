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
import { PrimaryButton } from "../../../shared/components/PrimaryButton";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { useAuthStore } from "../../../store/auth.store";
import { spacing, typography } from "../../../theme/tokens";

type ResetPasswordForm = {
  password: string;
  confirmPassword: string;
};

type Props = NativeStackScreenProps<AuthStackParamList, "ResetPassword">;

export function ResetPasswordScreen({ navigation, route }: Props): React.JSX.Element {
  const { t, textAlign } = useAppLocale();
  const pendingPasswordReset = useAuthStore((state) => state.pendingPasswordReset);
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const clearPendingPasswordReset = useAuthStore((state) => state.clearPendingPasswordReset);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.authError);
  const clearAuthError = useAuthStore((state) => state.clearAuthError);
  const clearAuthFeedback = useAuthStore((state) => state.clearAuthFeedback);
  const passwordInputRef = React.useRef<TextInput>(null);
  const confirmPasswordInputRef = React.useRef<TextInput>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const phoneNumber = route.params.phoneNumber;

  const formSchema = React.useMemo(
    () =>
      z
        .object({
          password: z
            .string()
            .min(1, t("auth.validation.passwordRequired"))
            .min(8, t("auth.validation.password")),
          confirmPassword: z.string().min(1, t("auth.validation.confirmPasswordRequired"))
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: t("auth.validation.confirmPassword"),
          path: ["confirmPassword"]
        }),
    [t]
  );

  const { control, handleSubmit } = useForm<ResetPasswordForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  React.useEffect(() => {
    if (
      !pendingPasswordReset
      || pendingPasswordReset.phoneNumber !== phoneNumber
      || !pendingPasswordReset.firebaseIdToken
    ) {
      navigation.replace("ForgotPasswordPhone");
    }
  }, [navigation, pendingPasswordReset, phoneNumber]);

  useFocusEffect(
    React.useCallback(() => {
      clearAuthError();
      clearAuthFeedback();
      setSuccessMessage(null);
    }, [clearAuthError, clearAuthFeedback])
  );

  const onSubmit = async (data: ResetPasswordForm): Promise<void> => {
    clearAuthError();
    setSuccessMessage(null);
    await resetPassword({
      phoneNumber,
      password: data.password
    });
    setSuccessMessage(t("auth.success.passwordReset"));
    clearPendingPasswordReset();
    setTimeout(() => {
      navigation.replace("Login");
    }, 900);
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
              title={t("auth.resetPasswordTitle")}
              subtitle={t("auth.resetPasswordSubtitle")}
              showBackButton
            />
            <Text style={[styles.phoneHint, { textAlign }]}>
              {t("auth.verifiedPhone", { phoneNumber })}
            </Text>
            <FormTextField<ResetPasswordForm>
              control={control}
              name="password"
              label={t("auth.newPassword")}
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
            <FormTextField<ResetPasswordForm>
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
            {authError ? <Text style={[styles.error, { textAlign }]}>{authError}</Text> : null}
            {successMessage ? (
              <Text style={[styles.success, { textAlign }]}>{successMessage}</Text>
            ) : null}
            <PrimaryButton
              label={t("auth.resetPassword")}
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
  flex: { flex: 1 },
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
  },
  success: {
    marginBottom: spacing.md,
    color: "#0F9D58",
    fontSize: typography.caption
  }
});
