import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ActiveDietPlanScreen } from "../../features/diet-plan/screens/ActiveDietPlanScreen";
import { AddDietPlanScreen } from "../../features/diet-plan/screens/AddDietPlanScreen";
import { DietPlanDetailScreen } from "../../features/diet-plan/screens/DietPlanDetailScreen";
import { EditDietPlanScreen } from "../../features/diet-plan/screens/EditDietPlanScreen";
import { PlanHistoryScreen } from "../../features/diet-plan/screens/PlanHistoryScreen";
import { DietDaySuccessScreen } from "../../features/diet-day/screens/DietDaySuccessScreen";
import { DietDayWeightScreen } from "../../features/diet-day/screens/DietDayWeightScreen";
import { DashboardScreen } from "../../features/home/screens/DashboardScreen";
import { NotificationPreferencesScreen } from "../../features/notifications/screens/NotificationPreferencesScreen";
import { ProfileEditScreen } from "../../features/profile/screens/ProfileEditScreen";
import { LanguageSettingsScreen } from "../../features/profile/screens/LanguageSettingsScreen";
import { ProfileSetupScreen } from "../../features/profile/screens/ProfileSetupScreen";
import { BasicStatsScreen } from "../../features/stats/screens/BasicStatsScreen";
import { WaterTrackerScreen } from "../../features/water/screens/WaterTrackerScreen";
import { WeightTrackerScreen } from "../../features/weight/screens/WeightTrackerScreen";
import { AppStackParamList } from "./types";

const Stack = createNativeStackNavigator<AppStackParamList>();

type AppStackProps = {
  needsProfileSetup: boolean;
};

export function AppStack({ needsProfileSetup }: AppStackProps): React.JSX.Element {
  return (
    <Stack.Navigator
      initialRouteName={needsProfileSetup ? "ProfileSetup" : "Dashboard"}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DietDayWeight"
        component={DietDayWeightScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DietDaySuccess"
        component={DietDaySuccessScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProfileSetup"
        component={ProfileSetupScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProfileEdit"
        component={ProfileEditScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ActiveDietPlan"
        component={ActiveDietPlanScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddDietPlan"
        component={AddDietPlanScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditDietPlan"
        component={EditDietPlanScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DietPlanDetail"
        component={DietPlanDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PlanHistory"
        component={PlanHistoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NotificationPreferences"
        component={NotificationPreferencesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LanguageSettings"
        component={LanguageSettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WaterTracker"
        component={WaterTrackerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WeightTracker"
        component={WeightTrackerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BasicStats"
        component={BasicStatsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
