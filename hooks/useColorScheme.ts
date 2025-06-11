import { useColorScheme as useDeviceColorScheme } from 'react-native';

export function useColorScheme() {
  const colorScheme = useDeviceColorScheme();
  return colorScheme || 'light'; // Provide a fallback value
}