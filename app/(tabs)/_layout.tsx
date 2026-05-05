import { Tabs } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';

function MapTabIcon({ focused, color }: { focused: boolean; color: string }) {
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill={focused ? color : 'none'}
        stroke={color}
        strokeWidth="1.8"
      />
      <Circle cx="12" cy="9" r="2.5" fill={focused ? '#fff' : color} opacity={focused ? 0.9 : 1} />
    </Svg>
  );
}

function ProfileTabIcon({ focused, color }: { focused: boolean; color: string }) {
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12" cy="8" r="4"
        fill={focused ? color : 'none'}
        stroke={color}
        strokeWidth="1.8"
      />
      <Path
        d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill={focused ? color : 'none'}
        opacity={focused ? 0.5 : 1}
      />
    </Svg>
  );
}

export default function TabsLayout() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBg,
          borderTopColor: colors.tabBorder,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontFamily: 'Sora_600SemiBold',
          fontSize: 10,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('map_tab'),
          tabBarIcon: ({ focused, color }) => <MapTabIcon focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile_tab'),
          tabBarIcon: ({ focused, color }) => <ProfileTabIcon focused={focused} color={color} />,
        }}
      />
    </Tabs>
  );
}
