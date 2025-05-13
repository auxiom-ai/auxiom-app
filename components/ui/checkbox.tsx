import { Check } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

interface CheckboxProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  'aria-label'?: string;
}

export function Checkbox({ value, onValueChange, 'aria-label': ariaLabel }: CheckboxProps) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={[styles.checkbox, value && styles.checked]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      accessibilityLabel={ariaLabel}
    >
      {value && (
        <Check size={16} color="#fff" />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#666',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
}); 