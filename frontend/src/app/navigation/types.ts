export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  VerifyRegisterOtp: { phoneNumber: string };
  CompleteRegistration: { phoneNumber: string };
  ForgotPasswordPhone: undefined;
  VerifyResetOtp: { phoneNumber: string };
  ResetPassword: { phoneNumber: string };
};

export type AppStackParamList = {
  Dashboard: undefined;
  DietDayWeight: undefined;
  DietDaySuccess: undefined;
  ProfileSetup: undefined;
  ProfileEdit: undefined;
  ActiveDietPlan: undefined;
  AddDietPlan: { fromDietDay?: boolean } | undefined;
  EditDietPlan: { planId: string };
  DietPlanDetail: { planId: string };
  PlanHistory: undefined;
  NotificationPreferences: undefined;
  LanguageSettings: undefined;
  WaterTracker: undefined;
  WeightTracker: undefined;
  BasicStats: undefined;
};
