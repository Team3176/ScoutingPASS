import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Text } from '../Themed';
import { useColorScheme } from 'react-native';
import Colors from '../../constants/Colors';

interface ButtonProps {
  onPress: () => void;
  text: string;
  style?: ViewStyle;
  variant?: 'primary' | 'success' | 'error';
}

export function Button({ onPress, text, style, variant = 'primary' }: ButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const buttonColor = variant === 'success' 
    ? Colors[colorScheme].successBackground 
    : variant === 'error'
    ? Colors[colorScheme].errorBackground
    : Colors[colorScheme].buttonBackground;

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { backgroundColor: buttonColor },
        style
      ]} 
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 