import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { User, Settings, Bell, Shield, CircleHelp as HelpCircle, LogOut, ChevronRight, Sun, Moon, Lock } from 'lucide-react-native';

export default function ProfileScreen() {
  const { theme, colors, toggleTheme } = useTheme();
  const [localProcessing, setLocalProcessing] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <TouchableOpacity style={[styles.settingsButton, { backgroundColor: colors.card }]}>
          <Settings size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60' }}
            style={styles.profileImage}
          />
          <Text style={[styles.profileName, { color: colors.text }]}>Alex Johnson</Text>
          <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>alex.johnson@example.com</Text>
          <TouchableOpacity style={[styles.editProfileButton, { backgroundColor: colors.card }]}>
            <Text style={[styles.editProfileText, { color: colors.primary }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsSection}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>12</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Scans</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>3</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Conditions</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>85%</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Health</Text>
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>

          <View style={[styles.settingCard, { backgroundColor: colors.card }]}>
            <View style={styles.settingLeft}>
              {theme === 'dark' ? (
                <Moon size={20} color={colors.text} />
              ) : (
                <Sun size={20} color={colors.text} />
              )}
              <Text style={[styles.settingText, { color: colors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: colors.primaryLight }}
              thumbColor={theme === 'dark' ? colors.primary : '#f4f3f4'}
              ios_backgroundColor="#767577"
            />
          </View>

          <View style={[styles.settingCard, { backgroundColor: colors.card }]}>
            <View style={styles.settingLeft}>
              <Bell size={20} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#767577', true: colors.primaryLight }}
              thumbColor={notifications ? colors.primary : '#f4f3f4'}
              ios_backgroundColor="#767577"
            />
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy & Security</Text>

          <View style={[styles.settingCard, { backgroundColor: colors.card }]}>
            <View style={styles.settingLeft}>
              <Lock size={20} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Local Processing</Text>
            </View>
            <Switch
              value={localProcessing}
              onValueChange={setLocalProcessing}
              trackColor={{ false: '#767577', true: colors.primaryLight }}
              thumbColor={localProcessing ? colors.primary : '#f4f3f4'}
              ios_backgroundColor="#767577"
            />
          </View>

          <TouchableOpacity style={[styles.settingCard, { backgroundColor: colors.card }]}>
            <View style={styles.settingLeft}>
              <Shield size={20} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Privacy Policy</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>

          <TouchableOpacity style={[styles.settingCard, { backgroundColor: colors.card }]}>
            <View style={styles.settingLeft}>
              <HelpCircle size={20} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Help & Support</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingCard, { backgroundColor: colors.card }]}>
            <View style={styles.settingLeft}>
              <LogOut size={20} color={colors.error} />
              <Text style={[styles.settingText, { color: colors.error }]}>Log Out</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.versionInfo}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            DermaScan v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 10,
    borderRadius: 8,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 16,
  },
  editProfileButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editProfileText: {
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  settingsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  settingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  versionText: {
    fontSize: 12,
  },
});