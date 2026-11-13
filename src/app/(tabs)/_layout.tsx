import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";

const COR_ATIVA = "#2F7D4F";
const COR_INATIVA = "#5C655E";

export default function BarraNavegacao() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COR_ATIVA,
        tabBarInactiveTintColor: COR_INATIVA,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E1E5DE",
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size, focused }) => (
            <SymbolView
              name={{
                ios: focused ? "house.fill" : "house",
                android: "home",
                web: "home",
              }}
              tintColor={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="nova-receita"
        options={{
          title: "Nova receita",
          tabBarIcon: ({ color, size }) => (
            <SymbolView
              name={{
                ios: "plus",
                android: "add",
                web: "add",
              }}
              tintColor={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
