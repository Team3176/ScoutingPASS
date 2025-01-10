import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import Colors from '../../constants/Colors';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pre-Match',
          tabBarIcon: ({ color }) => <TabBarIcon name="clipboard" color={color} />,
        }}
      />
      <Tabs.Screen
        name="auton"
        options={{
          title: 'Auton',
          tabBarIcon: ({ color }) => <TabBarIcon name="rocket" color={color} />,
        }}
      />
      <Tabs.Screen
        name="teleop"
        options={{
          title: 'Teleop',
          tabBarIcon: ({ color }) => <TabBarIcon name="gamepad" color={color} />,
        }}
      />
      <Tabs.Screen
        name="endgame"
        options={{
          title: 'Endgame',
          tabBarIcon: ({ color }) => <TabBarIcon name="flag-checkered" color={color} />,
        }}
      />
      <Tabs.Screen
        name="qr"
        options={{
          title: 'QR Code',
          tabBarIcon: ({ color }) => <TabBarIcon name="qrcode" color={color} />,
        }}
      />
    </Tabs>
  );
}
