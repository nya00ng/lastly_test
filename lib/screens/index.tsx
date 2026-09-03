import { ScreenFrame } from "@/components/ScreenFrame";
import { DashboardScreen } from "./dashboard";
import { LoginScreen, OnboardingScreen, SplashScreen } from "./entry";
import { ErrorRecoveryScreen } from "./error";
import {
  ActivityHistoryScreen,
  AllManagementScreen,
  CycleSettingScreen,
  ItemDetailScreen,
  ItemEditScreen,
  RecordEditScreen,
} from "./management";
import {
  CompleteOtherDateScreen,
  CompleteTodayScreen,
  NotificationLandingScreen,
  SnoozeScreen,
} from "./notification";
import {
  AiConfirmationScreen,
  AiProcessingScreen,
  ClarificationScreen,
  RecordInputScreen,
  RecordSavedScreen,
  SttResultScreen,
  VoiceListeningScreen,
} from "./record";
import { DeviceNotificationScreen, SettingsScreen } from "./settings";
import {
  isScreenId,
  routeForScreen,
  screenDefinitions,
  screenIds,
} from "../screen-definitions";
import type { ScreenId } from "../types";

export { isScreenId, screenDefinitions, screenIds };

export function renderScreen(screenId: ScreenId) {
  const definition = screenDefinitions.find((screen) => screen.id === screenId);

  return (
    <ScreenFrame
      activeRoute={routeForScreen(screenId)}
      description="PHASE 1 fixture UI입니다. 실제 Auth, DB, AI, STT, Push Runtime은 연결되어 있지 않습니다."
      screenId={screenId}
      title={definition?.title ?? screenId}
    >
      {screenContent(screenId)}
    </ScreenFrame>
  );
}

function screenContent(screenId: ScreenId) {
  switch (screenId) {
    case "S00":
      return <SplashScreen />;
    case "S01":
      return <LoginScreen />;
    case "S02":
      return <OnboardingScreen />;
    case "S10":
      return <DashboardScreen />;
    case "S11":
      return <RecordInputScreen />;
    case "S12":
      return <VoiceListeningScreen />;
    case "S13":
      return <SttResultScreen />;
    case "S14":
      return <AiProcessingScreen />;
    case "S15":
      return <AiConfirmationScreen />;
    case "S16":
      return <ClarificationScreen />;
    case "S17":
      return <RecordSavedScreen />;
    case "S20":
      return <AllManagementScreen />;
    case "S21":
      return <ItemDetailScreen />;
    case "S22":
      return <ActivityHistoryScreen />;
    case "S23":
      return <RecordEditScreen />;
    case "S24":
      return <ItemEditScreen />;
    case "S25":
      return <CycleSettingScreen />;
    case "S30":
      return <NotificationLandingScreen />;
    case "S31":
      return <CompleteTodayScreen />;
    case "S32":
      return <CompleteOtherDateScreen />;
    case "S33":
      return <SnoozeScreen />;
    case "S40":
      return <SettingsScreen />;
    case "S41":
      return <DeviceNotificationScreen />;
    case "S50":
      return <ErrorRecoveryScreen />;
  }
}
