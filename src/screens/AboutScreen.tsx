import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../theme/colors';
import { Card } from '../components/Card';

export const AboutScreen = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <Text style={styles.title}>About FineX</Text>
    <Card style={styles.card}>
      <Text style={styles.brand}>FineX (Financial Intelligence)</Text>
      <Text style={styles.version}>Version 1.0.0</Text>
      <Text style={styles.body}>
        FineX is a high-performance, offline-first personal finance companion app built using React Native and SQLite.
      </Text>
    </Card>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingTop: 50 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 20 },
  card: { padding: 20 },
  brand: { fontSize: 18, fontWeight: 'bold', color: Colors.primary, marginBottom: 6 },
  version: { fontSize: 12, color: Colors.textSecondary, marginBottom: 12 },
  body: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
});