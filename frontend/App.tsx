import { getApp, getApps } from "@react-native-firebase/app";
import React from "react";
import { Platform } from "react-native";

import { RootApp } from "./src/app/RootApp";

export default function App(): React.JSX.Element {
  React.useEffect(() => {
    if (getApps().length > 0) {
      console.log("🔥 Firebase:", getApp().name);
      if (Platform.OS === "ios") {
        console.log("🔥 Firebase iOS:", getApp().name);
      }
    } else {
      console.log("🔥 Firebase:", "not initialized");
    }
  }, []);

  return <RootApp />;
}
