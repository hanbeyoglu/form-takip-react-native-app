import { zodResolver } from "@hookform/resolvers/zod";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { z } from "zod";

import { AuthStackParamList } from "../../../app/navigation/types";
import { useAppLocale } from "../../../localization/useAppLocale";
import { AppHeader } from "../../../shared/components/AppHeader";
import { KeyboardDoneAccessory } from "../../../shared/components/KeyboardDoneAccessory";
import { PrimaryButton } from "../../../shared/components/PrimaryButton";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { useAuthStore } from "../../../store/auth.store";
import { colors, radius, spacing, typography } from "../../../theme/tokens";
import {
  formatTurkishPhoneInput,
  isValidTurkishMobile,
  normalizePhoneNumber
} from "../utils/phone";

type ForgotPasswordForm = {
  phoneNumber: string;
};

type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPasswordPhone">;

const IOS_NUMERIC_ACCESSORY_ID = "forgot-password-phone-accessory";

export function ForgotPasswordPhoneScreen({ navigation }: Props): React.JSX.Element {
  const { t, textAlign } = useAppLocale();
  const requestPasswordResetOtp = useAuthStore((state) => state.requestPasswordResetOtp);
  const clearPendingPasswordReset = useAuthStore((state) => state.clearPendingPasswordReset);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.authError);
  const clearAuthError = useAuthStore((state) => state.clearAuthError);
  const clearAuthFeedback = useAuthStore((state) => state.clearAuthFeedback);
  const phoneInputRef = React.useRef<TextInput>(null);

  const formSchema = React.useMemo(
    () =>
      z.object({
        phoneNumber: z
          .string()
          .min(1, t("auth.validation.phoneNumber"))
          .refine((value) => isValidTurkishMobile(normalizePhoneNumber(value)), {
            message: t("auth.validation.invalidPhoneNumber")
          })
      }),
    [t]
  );

  const { control, handleSubmit } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: ""
    }
  });

  useFocusEffect(
    React.useCallback(() => {
      clearAuthError();
      clearAuthFeedback();
      clearPendingPasswordReset();
    }, [clearAuthError, clearAuthFeedback, clearPendingPasswordReset])
  );

  const onSubmit = async (data: ForgotPasswordForm): Promise<void> => {
    clearAuthError();
    const pendingReset = await requestPasswordResetOtp({
      phoneNumber: normalizePhoneNumber(data.phoneNumber)
    });
    navigation.navigate("VerifyResetOtp", {
      phoneNumber: pendingReset.phoneNumber
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
              title={t("auth.forgotPasswordTitle")}
              subtitle={t("auth.forgotPasswordSubtitle")}
              showBackButton
            />
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View style={styles.phoneFieldContainer}>
                  <Text style={[styles.phoneFieldLabel, { textAlign }]}>
                    {t("auth.phoneNumber")}
                  </Text>
                  <View style={[styles.phoneInputRow, error ? styles.phoneInputRowError : null]}>
                    <Text style={styles.phonePrefix}>+90</Text>
                    <TextInput
                      ref={phoneInputRef}
                      value={String(value ?? "")}
                      onChangeText={(text) => onChange(formatTurkishPhoneInput(text))}
                      onBlur={onBlur}
                      autoComplete="tel"
                      inputAccessoryViewID={IOS_NUMERIC_ACCESSORY_ID}
                      keyboardType={Platform.OS === "ios" ? "number-pad" : "phone-pad"}
                      maxLength={13}
                      placeholder="555 123 45 67"
                      placeholderTextColor={colors.textMuted}
                      returnKeyType="done"
                      style={[styles.phoneInput, { textAlign }]}
                      textContentType="telephoneNumber"
                      onSubmitEditing={() => Keyboard.dismiss()}
                    />
                  </View>
                  {error?.message ? (
                    <Text style={[styles.fieldError, { textAlign }]}>{error.message}</Text>
                  ) : null}
                </View>
              )}
            />
            {authError ? <Text style={[styles.error, { textAlign }]}>{authError}</Text> : null}
            <PrimaryButton
              label={t("auth.requestOtp")}
              onPress={() => {
                Keyboard.dismiss();
                void handleSubmit(onSubmit)();
              }}
              isLoading={isLoading}
            />
            <Text
              style={[styles.backToLogin, { textAlign }]}
              onPress={() => navigation.replace("Login")}
            >
              {t("auth.backToLogin")}
            </Text>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <KeyboardDoneAccessory nativeID={IOS_NUMERIC_ACCESSORY_ID} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingBottom: spacing.xxxl
  },
  phoneFieldContainer: {
    marginBottom: spacing.lg
  },
  phoneFieldLabel: {
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.helper,
    fontWeight: "700"
  },
  phoneInputRow: {
    minHeight: 56,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center"
  },
  phoneInputRowError: {
    borderColor: colors.danger
  },
  phonePrefix: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "700",
    marginRight: spacing.sm
  },
  phoneInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.body,
    paddingVertical: spacing.md
  },
  fieldError: {
    marginTop: spacing.sm,
    color: colors.danger,
    fontSize: typography.caption
  },
  error: {
    marginBottom: spacing.md,
    color: "#DC2626",
    fontSize: typography.caption
  },
  backToLogin: {
    marginTop: spacing.lg,
    color: "#4F46E5",
    fontSize: typography.body
  }
});
