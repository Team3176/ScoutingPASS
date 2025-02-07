/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#2196F3';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    counterBackground: '#f5f5f5',
    buttonBackground: '#2196F3',
    successBackground: '#4CAF50',
    errorBackground: '#f44336',
    inputBackground: '#fff',
    cardBackground: '#f5f5f5',
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    counterBackground: '#413838',
    buttonBackground: '#2196F3',
    successBackground: '#4CAF50',
    errorBackground: '#f44336',
    inputBackground: '#2F2F2F',
    cardBackground: '#413838',
  },
};
