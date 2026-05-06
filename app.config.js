module.exports = {
  expo: {
    name: 'ParkSignal',
    slug: 'parksignal',
    version: '1.0.0',
    scheme: 'parksignal',
    platforms: ['android'],
    icon: './assets/icon.png',
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#1a3a6b',
      },
      package: 'com.parksignal.app',
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
      permissions: [
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
      ],
    },
    plugins: [
      'expo-router',
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'ParkSignal necesita tu ubicacion para mostrarte spots cercanos.',
        },
      ],
      [
        'expo-build-properties',
        { android: { kotlinVersion: '1.9.25' } },
      ],
      'expo-font',
    ],
    extra: {
      router: { origin: false },
      eas: { projectId: '52f16c9c-8983-4e17-b412-c0bacede3e50' },
    },
    owner: 'guidondor',
  },
};
