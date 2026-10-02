import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../theme/colors';
import { Card } from '../components/Card';

export const GuideScreen = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <Text style={styles.title}>Getting Started Guide</Text>
    
    <Card style={styles.stepCard}>
      <Text style={styles.stepTitle}>1. Offline-First Entry</Text>
      <Text style={styles.stepBody}>Log expenses or income anywhere. Data saves instantly to device storage.</Text>
    </Card>

    <Card style={styles.stepCard}>
      <Text style={styles.stepTitle}>2. Smart Receipt Scanning</Text>
      <Text style={styles.stepBody}>Snap a photo of your receipt to auto-populate merchant and transaction totals.</Text>
    </Card>

    <Card style={styles.stepCard}>
      <Text style={styles.stepTitle}>3. Background Sync</Text>
      <Text style={styles.stepBody}>Once connected, pending transactions sync automatically with the backend.</Text>
    </Card>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingTop: 50 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 20 },
  stepCard: { padding: 16, marginBottom: 12 },
  stepTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.secondary, marginBottom: 6 },
  stepBody: { fontSize: 13, color: Colors.textPrimary, lineHeight: 18 },
});