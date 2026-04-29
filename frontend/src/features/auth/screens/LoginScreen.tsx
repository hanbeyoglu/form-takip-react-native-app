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
import { FormTextField } from "../../../shared/components/FormTextField";
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

type LoginForm = {
  phoneNumber: string;
  password: string;
};
type Props = NativeStackScreenProps<AuthStackParamList, "Login">;
const IOS_NUMERIC_ACCESSORY_ID = "login-numeric-accessory";

export function LoginScreen({ navigation }: Props): React.JSX.Element {
  const { t, textAlign } = useAppLocale();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.authError);
  const clearAuthError = useAuthStore((state) => state.clearAuthError);
  const clearAuthFeedback = useAuthStore((state) => state.clearAuthFeedback);
  const phoneInputRef = React.useRef<TextInput>(null);
  const passwordInputRef = React.useRef<TextInput>(null);
  const loginSchema = React.useMemo(
    () =>
      z.object({
        phoneNumber: z
          .string()
          .min(1, t("auth.validation.phoneNumber"))
          .refine((value) => isValidTurkishMobile(normalizePhoneNumber(value)), {
            message: t("auth.validation.invalidPhoneNumber")
          }),
        password: z.string().min(8, t("auth.validation.password"))
      }),
    [t]
  );
  const { control, handleSubmit } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phoneNumber: "",
      password: ""
    }
  });

  useFocusEffect(
    React.useCallback(() => {
      clearAuthError();
      clearAuthFeedback();
    }, [clearAuthError, clearAuthFeedback])
  );

  const onSubmit = async (data: LoginForm): Promise<void> => {
    clearAuthError();
    await login(data);
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
              title={t("auth.loginTitle")}
              subtitle={t("auth.loginSubtitle")}
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
                      returnKeyType="next"
                      style={[styles.phoneInput, { textAlign }]}
                      textContentType="telephoneNumber"
                      onSubmitEditing={() => passwordInputRef.current?.focus()}
                    />
                  </View>
                  {error?.message ? (
                    <Text style={[styles.fieldError, { textAlign }]}>{error.message}</Text>
                  ) : null}
                </View>
              )}
            />
            <FormTextField<LoginForm>
              control={control}
              name="password"
              label={t("auth.password")}
              placeholder="********"
              autoCapitalize="none"
              autoComplete="password"
              autoCorrect={false}
              blurOnSubmit
              inputRef={passwordInputRef}
              returnKeyType="done"
              secureTextEntry
              textContentType="password"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            {authError ? <Text style={[styles.error, { textAlign }]}>{authError}</Text> : null}
            <PrimaryButton
              label={t("auth.login")}
              onPress={() => {
                Keyboard.dismiss();
                void handleSubmit(onSubmit)();
              }}
              isLoading={isLoading}
            />
            <Text
              style={[styles.forgotPasswordLink, { textAlign }]}
              onPress={() => navigation.navigate("ForgotPasswordPhone")}
            >
              {t("auth.forgotPasswordCta")}
            </Text>
            <View style={styles.linkContainer}>
              <Text style={styles.link} onPress={() => navigation.navigate("Register")}>
                {t("auth.noAccount")}
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
  forgotPasswordLink: {
    marginTop: spacing.lg,
    color: "#4F46E5",
    fontSize: typography.body
  },
  link: {
    color: "#4F46E5",
    fontSize: typography.body
  }
});
