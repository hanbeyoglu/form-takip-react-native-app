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
import { colors, radius, spacing, typography } from "../../../theme/tokens";
import { useAuthStore } from "../../../store/auth.store";
import {
  formatTurkishPhoneInput,
  isValidTurkishMobile,
  normalizePhoneNumber
} from "../utils/phone";

type RegisterForm = {
  phoneNumber: string;
};

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

const IOS_NUMERIC_ACCESSORY_ID = "register-numeric-accessory";

export function RegisterScreen({ navigation }: Props): React.JSX.Element {
  const { t, textAlign } = useAppLocale();
  const requestRegisterOtp = useAuthStore((state) => state.requestRegisterOtp);
  const clearPendingRegistration = useAuthStore((state) => state.clearPendingRegistration);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.authError);
  const clearAuthError = useAuthStore((state) => state.clearAuthError);
  const clearAuthFeedback = useAuthStore((state) => state.clearAuthFeedback);
  const phoneInputRef = React.useRef<TextInput>(null);

  const registerSchema = React.useMemo(
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

  const { control, handleSubmit } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      phoneNumber: ""
    }
  });

  useFocusEffect(
    React.useCallback(() => {
      clearAuthError();
      clearAuthFeedback();
      clearPendingRegistration();
    }, [clearAuthError, clearAuthFeedback, clearPendingRegistration])
  );

  const onSubmit = async (data: RegisterForm): Promise<void> => {
    clearAuthError();
    const pendingRegistration = await requestRegisterOtp({
      phoneNumber: normalizePhoneNumber(data.phoneNumber)
    });
    navigation.navigate("VerifyRegisterOtp", {
      phoneNumber: pendingRegistration.phoneNumber
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
              title={t("auth.registerPhoneTitle")}
              subtitle={t("auth.registerPhoneSubtitle")}
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
            <View style={styles.linkContainer}>
              <Text style={styles.link} onPress={() => navigation.navigate("Login")}>
                {t("auth.hasAccount")}
              </Text>
            </View>
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
  linkContainer: {
    marginTop: spacing.lg,
    alignItems: "center"
  },
  link: {
    color: "#4F46E5",
    fontSize: typography.body
  }
});
