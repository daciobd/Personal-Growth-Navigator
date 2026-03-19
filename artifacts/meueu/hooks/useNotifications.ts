import { useEffect } from "react";
import { Platform } from "react-native";

export function useNotifications() {
  useEffect(() => {
    if (Platform.OS === "web") return;

    let mounted = true;

    const setup = async () => {
      try {
        // @ts-ignore — expo-notifications is optional (native only)
        const Notifications = await import("expo-notifications");

        const { status } = await Notifications.requestPermissionsAsync();
        if (!mounted || status !== "granted") return;

        await Notifications.cancelAllScheduledNotificationsAsync();

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Hora da sua prática",
            body: "Seu desafio de hoje está esperando por você.",
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 9,
            minute: 0,
          },
        });
      } catch {
        // expo-notifications not available
      }
    };

    setup();

    return () => {
      mounted = false;
    };
  }, []);
}
