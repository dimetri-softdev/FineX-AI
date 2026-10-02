import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Colors } from '../theme/colors';
import { Card } from '../components/Card';
import { Ionicons } from '@expo/vector-icons';

interface ProfileScreenProps {
  navigation?: any;
}

export const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  const [biometricsEnabled, setBiometricsEnabled] = React.useState(true);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile & Settings</Text>
      </View>

      {/* User Info Card */}
      <Card style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>FX</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>FineX User</Text>
          <Text style={styles.userStatus}>Offline-First Engine Active</Text>
        </View>
      </Card>

      {/* Security & Sync Settings */}
      <Text style={styles.sectionTitle}>Security & Sync</Text>
      <Card style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingTextGroup}>
            <Ionicons name="finger-print" size={20} color={Colors.primary} />
            <Text style={styles.settingLabel}>Biometric Lock</Text>
          </View>
          <Switch
            value={biometricsEnabled}
            onValueChange={setBiometricsEnabled}
            thumbColor={Colors.primary}
            trackColor={{ false: Colors.surfaceLight, true: Colors.border }}
          />
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.settingTextGroup}>
            <Ionicons name="sync" size={20} color={Colors.secondary} />
            <Text style={styles.settingLabel}>Sync Queue Status</Text>
          </View>
          <Text style={styles.settingValue}>0 Pending</Text>
        </TouchableOpacity>
      </Card>

      {/* Information & App Guides */}
      <Text style={styles.sectionTitle}>Application Info</Text>
      <Card style={styles.settingsCard}>
        <TouchableOpacity style={styles.settingRow} onPress={() => navigation?.navigate('Guide')}>
          <View style={styles.settingTextGroup}>
            <Ionicons name="book-outline" size={20} color={Colors.secondary} />
            <Text style={styles.settingLabel}>Getting Started Guide</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.settingRow} onPress={() => navigation?.navigate('About')}>
          <View style={styles.settingTextGroup}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
            <Text style={styles.settingLabel}>About FineX</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingTop: 50 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.textPrimary },
  userCard: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 24 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#000', fontWeight: 'bold', fontSize: 18 },
  userInfo: { flex: 1 },
  userName: { color: Colors.textPrimary, fontSize: 16, fontWeight: 'bold' },
  userStatus: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  sectionTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  settingsCard: { padding: 12, marginBottom: 20 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  settingTextGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingLabel: { color: Colors.textPrimary, fontSize: 15 },
  settingValue: { color: Colors.income, fontSize: 13, fontWeight: '600' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
});