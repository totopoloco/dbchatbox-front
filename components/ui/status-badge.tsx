import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface StatusBadgeProps {
  label: string;
  color: string;
  textColor?: string;
}

export function StatusBadge({ label, color, textColor = '#fff' }: StatusBadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
