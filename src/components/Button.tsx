import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary', style }) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'secondary':
        return Colors.surfaceLight;
      case 'danger':
        return Colors.expense;
      default:
        return Colors.primary;
    }
  };

  const getTextColor = () => (variant === 'primary' ? '#000000' : Colors.textPrimary);

  return (
    <TouchableOpacity style={[styles.button, { backgroundColor: getBackgroundColor() }, style]} onPress={onPress}>
      <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});