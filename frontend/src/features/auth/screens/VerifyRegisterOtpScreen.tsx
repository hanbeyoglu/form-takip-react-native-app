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
import { spacing, typography } from "../../../theme/tokens";

type VerifyOtpForm = {
  code: string;
};

type Props = NativeStackScreenProps<AuthStackParamList, "VerifyRegisterOtp">;
const IOS_NUMERIC_ACCESSORY_ID = "verify-register-otp-accessory";

export function VerifyRegisterOtpScreen({
  navigation,
  route
}: Props): React.JSX.Element {
  const { t, textAlign } = useAppLocale();
  const pendingRegistration = useAuthStore((state) => state.pendingRegistration);
  const verifyRegisterOtp = useAuthStore((state) => state.verifyRegisterOtp);
  const clearPendingRegistration = useAuthStore((state) => state.clearPendingRegistration);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.authError);
  const clearAuthError = useAuthStore((state) => state.clearAuthError);
  const clearAuthFeedback = useAuthStore((state) => state.clearAuthFeedback);
  const phoneNumber = route.params.phoneNumber;

  const verifyOtpSchema = React.useMemo(
    () =>
      z.object({
        code: z.string().length(6, t("auth.validation.otp"))
      }),
    [t]
  );

  const { control, handleSubmit } = useForm<VerifyOtpForm>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      code: ""
    }
  });

  React.useEffect(() => {
    if (!pendingRegistration || pendingRegistration.phoneNumber !== phoneNumber) {
      navigation.replace("Register");
    }
  }, [navigation, pendingRegistration, phoneNumber]);

  useFocusEffect(
    React.useCallback(() => {
      clearAuthError();
      clearAuthFeedback();
    }, [clearAuthError, clearAuthFeedback])
  );

  const onSubmit = async (data: VerifyOtpForm): Promise<void> => {
    clearAuthError();
    await verifyRegisterOtp({
      phoneNumber,
      code: data.code.trim()
    });
    navigation.replace("CompleteRegistration", { phoneNumber });
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
              title={t("auth.verifyRegisterOtpTitle")}
              subtitle={t("auth.verifyRegisterOtpSubtitle")}
              showBackButton
            />
            <Text style={[styles.phoneHint, { textAlign }]}>
              {t("auth.otpSentTo", { phoneNumber })}
            </Text>
            <FormTextField<VerifyOtpForm>
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
              style={[styles.secondaryAction, { textAlign }]}
              onPress={() => {
                clearAuthError();
                clearPendingRegistration();
                navigation.replace("Register");
              }}
            >
              {t("auth.changePhoneNumber")}
            </Text>
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
  secondaryAction: {
    marginTop: spacing.lg,
    color: "#4F46E5",
    fontSize: typography.body
  }
});
