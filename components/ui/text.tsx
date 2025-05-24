import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';

interface TextProps extends RNTextProps {
  variant?: 'default' | 'heading' | 'subheading';
}

export function Text({ variant = 'default', style, ...props }: TextProps) {
  return (
    <RNText
      style={[styles[variant], style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    color: '#000',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
}); 