import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { CompleteRegistrationScreen } from "../../features/auth/screens/CompleteRegistrationScreen";
import { ForgotPasswordPhoneScreen } from "../../features/auth/screens/ForgotPasswordPhoneScreen";
import { LoginScreen } from "../../features/auth/screens/LoginScreen";
import { RegisterScreen } from "../../features/auth/screens/RegisterScreen";
import { ResetPasswordScreen } from "../../features/auth/screens/ResetPasswordScreen";
import { VerifyRegisterOtpScreen } from "../../features/auth/screens/VerifyRegisterOtpScreen";
import { VerifyResetOtpScreen } from "../../features/auth/screens/VerifyResetOtpScreen";
import { OnboardingScreen } from "../../features/onboarding/screens/OnboardingScreen";
import { AuthStackParamList } from "./types";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack(): React.JSX.Element {
  return (
    <Stack.Navigator initialRouteName="Onboarding">
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VerifyRegisterOtp"
        component={VerifyRegisterOtpScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CompleteRegistration"
        component={CompleteRegistrationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ForgotPasswordPhone"
        component={ForgotPasswordPhoneScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VerifyResetOtp"
        component={VerifyResetOtpScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
