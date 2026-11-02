import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

    <Text style={styles.sectionTitle}>Coming Soon</Text>
    <Card style={styles.upcomingCard}>
      <View style={styles.upcomingHeader}>
        <View style={styles.projectIcon}>
          <Ionicons name="school-outline" size={24} color="#A99BFF" />
        </View>
        <View style={styles.projectInfo}>
          <Text style={styles.projectName}>AuraLearn</Text>
          <Text style={styles.projectType}>AI-powered learning platform</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>COMING SOON</Text>
        </View>
      </View>
      <Text style={styles.projectDescription}>
        Learn at your pace with personalized skill paths, interactive lessons,
        and an AI tutor ready to help you along the way.
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 28,
    marginBottom: 12,
  },
  upcomingCard: { padding: 18 },
  upcomingHeader: { flexDirection: 'row', alignItems: 'center' },
  projectIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#29265A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  projectInfo: { flex: 1 },
  projectName: { fontSize: 18, fontWeight: 'bold', color: '#A99BFF' },
  projectType: { fontSize: 12, color: Colors.textSecondary, marginTop: 3 },
  badge: {
    backgroundColor: '#29265A',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginLeft: 8,
  },
  badgeText: { color: '#C4BBFF', fontSize: 9, fontWeight: 'bold' },
  projectDescription: {
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 16,
  },
});