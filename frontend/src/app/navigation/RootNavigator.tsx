import React from "react";

import { LoadingState } from "../../shared/components/LoadingState";
import { useAuthStore } from "../../store/auth.store";
import { useLocalizationStore } from "../../store/localization.store";
import { AppStack } from "./AppStack";
import { AuthStack } from "./AuthStack";

export function RootNavigator(): React.JSX.Element {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const user = useAuthStore((state) => state.user);
  const initializeSession = useAuthStore((state) => state.initializeSession);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLanguageReady = useLocalizationStore((state) => state.isReady);
  const initializeLanguage = useLocalizationStore((state) => state.initializeLanguage);

  React.useEffect(() => {
    void initializeSession();
  }, [initializeSession]);

  React.useEffect(() => {
    void initializeLanguage();
  }, [initializeLanguage]);

  if (!isHydrated || !isLanguageReady) {
    return <LoadingState />;
  }

  const needsProfileSetup = Boolean(isAuthenticated && user && !user.isProfileCompleted);

  return isAuthenticated ? (
    <AppStack
      key={needsProfileSetup ? "profile-setup" : "dashboard"}
      needsProfileSetup={needsProfileSetup}
    />
  ) : (
    <AuthStack />
  );
}
