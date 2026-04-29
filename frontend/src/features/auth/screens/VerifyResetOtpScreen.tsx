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
  TouchableWithoutFeedback
} from "react-native";
import { z } from "zod";

import { AuthStackParamList } from "../../../app/navigation/types";
import { useAppLocale } from "../../../localization/useAppLocale";
import { AppHeader } from "../../../shared/components/AppHeader";
import { FormTextField } from "../../../shared/components/FormTextField";
import { KeyboardDoneAccessory } from "../../../shared/components/KeyboardDoneAccessory";
import { PrimaryButton } from "../../../shared/components/PrimaryButton";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { useAuthStore } from "../../../store/auth.store";
import { colors, spacing, typography } from "../../../theme/tokens";

type VerifyResetOtpForm = {
  code: string;
};

type Props = NativeStackScreenProps<AuthStackParamList, "VerifyResetOtp">;

const IOS_NUMERIC_ACCESSORY_ID = "verify-reset-otp-accessory";

export function VerifyResetOtpScreen({ navigation, route }: Props): React.JSX.Element {
  const { t, textAlign } = useAppLocale();
  const pendingPasswordReset = useAuthStore((state) => state.pendingPasswordReset);
  const requestPasswordResetOtp = useAuthStore((state) => state.requestPasswordResetOtp);
  const verifyResetOtp = useAuthStore((state) => state.verifyResetOtp);
  const clearPendingPasswordReset = useAuthStore((state) => state.clearPendingPasswordReset);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.authError);
  const clearAuthError = useAuthStore((state) => state.clearAuthError);
  const clearAuthFeedback = useAuthStore((state) => state.clearAuthFeedback);
  const phoneNumber = route.params.phoneNumber;
  const expiryTime = pendingPasswordReset?.otpExpiresAt ?? null;
  const [secondsLeft, setSecondsLeft] = React.useState(0);

  const formSchema = React.useMemo(
    () =>
      z.object({
        code: z.string().length(6, t("auth.validation.otp"))
      }),
    [t]
  );

  const { control, handleSubmit, reset } = useForm<VerifyResetOtpForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: ""
    }
  });

  React.useEffect(() => {
    if (!pendingPasswordReset || pendingPasswordReset.phoneNumber !== phoneNumber) {
      navigation.replace("ForgotPasswordPhone");
    }
  }, [navigation, pendingPasswordReset, phoneNumber]);

  useFocusEffect(
    React.useCallback(() => {
      clearAuthError();
      clearAuthFeedback();
    }, [clearAuthError, clearAuthFeedback])
  );

  React.useEffect(() => {
    if (!expiryTime) {
      setSecondsLeft(0);
      return;
    }

    const update = () => {
      const delta = Math.max(
        0,
        Math.ceil((new Date(expiryTime).getTime() - Date.now()) / 1000)
      );
      setSecondsLeft(delta);
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiryTime]);

  const onSubmit = async (data: VerifyResetOtpForm): Promise<void> => {
    clearAuthError();
    await verifyResetOtp({
      phoneNumber,
      code: data.code.trim()
    });
    navigation.replace("ResetPassword", { phoneNumber });
  };

  const onResend = async (): Promise<void> => {
    clearAuthError();
    reset({ code: "" });
    await requestPasswordResetOtp({ phoneNumber });
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
              title={t("auth.verifyResetOtpTitle")}
              subtitle={t("auth.verifyResetOtpSubtitle")}
              showBackButton
            />
            <Text style={[styles.phoneHint, { textAlign }]}>
              {t("auth.otpSentTo", { phoneNumber })}
            </Text>
            <FormTextField<VerifyResetOtpForm>
              control={control}
              name="code"
              label={t("auth.otpCode")}
              placeholder={t("auth.placeholders.otp")}
              autoCapitalize="none"
              autoCorrect={false}
              blurOnSubmit
              inputAccessoryViewID={IOS_NUMERIC_ACCESSORY_ID}
              keyboardType="numeric"
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            <Text style={[styles.timer, { textAlign }]}>
              {secondsLeft > 0
                ? t("auth.otpTimer", { seconds: secondsLeft })
                : t("auth.resendOtpReady")}
            </Text>
            {authError ? <Text style={[styles.error, { textAlign }]}>{authError}</Text> : null}
            <PrimaryButton
              label={t("auth.verifyOtp")}
              onPress={() => {
                Keyboard.dismiss();
                void handleSubmit(onSubmit)();
              }}
              isLoading={isLoading}
            />
            <Text
              style={[
                styles.secondaryAction,
                { textAlign, color: secondsLeft > 0 ? colors.textMuted : colors.primary }
              ]}
              onPress={() => {
                if (secondsLeft === 0 && !isLoading) {
                  void onResend();
                }
              }}
            >
              {t("auth.resendOtp")}
            </Text>
            <Text
              style={[styles.secondaryAction, { textAlign }]}
              onPress={() => {
                clearAuthError();
                clearPendingPasswordReset();
                navigation.replace("Login");
              }}
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
  phoneHint: {
    marginBottom: spacing.lg,
    fontSize: typography.body,
    color: colors.textSecondary
  },
  timer: {
    marginBottom: spacing.md,
    fontSize: typography.helper,
    color: colors.textSecondary
  },
  error: {
    marginBottom: spacing.md,
    color: colors.danger,
    fontSize: typography.caption
  },
  secondaryAction: {
    marginTop: spacing.lg,
    fontSize: typography.body
  }
});
