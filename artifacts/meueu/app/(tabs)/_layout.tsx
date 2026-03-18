import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: Platform.OS !== "web"
          ? {
              backgroundColor: "#fff",
              borderTopColor: "#E8F0ED",
              borderTopWidth: 1,
              height: 64,
              paddingBottom: 10,
              paddingTop: 6,
              elevation: 0,
            }
          : { display: "none" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Hoje",
          tabBarIcon: ({ color }) => (
            <Feather name="zap" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="journeys"
        options={{
          title: "Jornadas",
          tabBarIcon: ({ color }) => (
            <Feather name="map" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: "Coach",
          tabBarIcon: ({ color }) => (
            <Feather name="message-circle" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Meu Eu",
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
