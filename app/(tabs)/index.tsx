import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Bell, Camera, Sun, Moon, ChevronRight, Sparkles } from 'lucide-react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { getSkinHealthStats } from '@/services/SkinAnalysisService';

export default function HomeScreen() {
  const { theme, colors, toggleTheme } = useTheme();
  const { user, skinHistory } = useAuth();
  const isWeb = Platform.OS === 'web';
  const [skinStats, setSkinStats] = useState({
    hydration: 0,
    overallHealth: 0,
    uvDamage: 'Low'
  });

  useEffect(() => {
    // Get skin health stats
    const stats = getSkinHealthStats();
    setSkinStats(stats);
  }, []);

  const BlurContainer = ({ children, style }: any) => {
    if (isWeb) {
      return <View style={[style, { backgroundColor: colors.card, opacity: 0.9 }]}>{children}</View>;
    }
    return (
      <BlurView intensity={80} tint={theme === 'dark' ? 'dark' : 'light'} style={style}>
        {children}
      </BlurView>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>Good morning,</Text>
          <Text style={[styles.username, { color: colors.text }]}>{user?.name || 'User'}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
            {theme === 'dark' ? (
              <Moon size={24} color={colors.text} />
            ) : (
              <Sun size={24} color={colors.text} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <Link href="/scan" asChild>
          <TouchableOpacity>
            <LinearGradient
              colors={['#4c669f', '#3b5998', '#192f6a']}
              style={styles.scanCard}>
              <View style={styles.scanCardContent}>
                <View style={styles.scanCardText}>
                  <Text style={styles.scanCardTitle}>Scan Your Skin</Text>
                  <Text style={styles.scanCardDescription}>
                    Take a photo to analyze your skin condition
                  </Text>
                </View>
                <View style={styles.scanCardIcon}>
                  <Camera size={32} color="#fff" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Link>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Skin Health</Text>
          <Link href="/history" asChild>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{skinStats.hydration}%</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Hydration</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{skinStats.overallHealth}%</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Overall Health</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{skinStats.uvDamage}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>UV Damage</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Analysis</Text>
        </View>

        {skinHistory.length > 0 ? (
          <View style={[styles.recentCard, { backgroundColor: colors.card }]}>
            <Image
              source={{ uri: skinHistory[0].image }}
              style={styles.recentImage}
            />
            <View style={styles.recentInfo}>
              <View style={styles.recentHeader}>
                <Text style={[styles.recentTitle, { color: colors.text }]}>
                  {skinHistory[0].condition}
                </Text>
                <Text style={[styles.recentDate, { color: colors.textSecondary }]}>
                  {skinHistory[0].date}
                </Text>
              </View>
              <View
                style={[
                  styles.severityBadge,
                  {
                    backgroundColor:
                      skinHistory[0].severity === 'Mild'
                        ? 'rgba(16, 185, 129, 0.1)'
                        : skinHistory[0].severity === 'Moderate'
                        ? 'rgba(245, 158, 11, 0.1)'
                        : 'rgba(239, 68, 68, 0.1)',
                    borderColor:
                      skinHistory[0].severity === 'Mild'
                        ? colors.success
                        : skinHistory[0].severity === 'Moderate'
                        ? '#f59e0b'
                        : colors.error,
                  },
                ]}>
                <Text
                  style={[
                    styles.severityText,
                    {
                      color:
                        skinHistory[0].severity === 'Mild'
                          ? colors.success
                          : skinHistory[0].severity === 'Moderate'
                          ? '#f59e0b'
                          : colors.error,
                    },
                  ]}>
                  {skinHistory[0].severity}
                </Text>
              </View>
              <Link href="/history" asChild>
                <TouchableOpacity style={styles.viewDetailsButton}>
                  <Text style={[styles.viewDetailsText, { color: colors.primary }]}>
                    View Details
                  </Text>
                  <ChevronRight size={16} color={colors.primary} />
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No skin analysis yet. Scan your skin to get started.
            </Text>
            <Link href="/scan" asChild>
              <TouchableOpacity style={[styles.scanNowButton, { backgroundColor: colors.primary }]}>
                <Text style={styles.scanNowText}>Scan Now</Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Skin Care Tips</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tipsContainer}>
          <View style={[styles.tipCard, { backgroundColor: colors.card }]}>
            <View style={[styles.tipIconContainer, { backgroundColor: colors.primaryLight }]}>
              <Sparkles size={24} color={colors.primary} />
            </View>
            <Text style={[styles.tipTitle, { color: colors.text }]}>Daily Sunscreen</Text>
            <Text style={[styles.tipDescription, { color: colors.textSecondary }]}>
              Apply SPF 30+ sunscreen daily, even on cloudy days
            </Text>
          </View>

          <View style={[styles.tipCard, { backgroundColor: colors.card }]}>
            <View style={[styles.tipIconContainer, { backgroundColor: colors.primaryLight }]}>
              <Sparkles size={24} color={colors.primary} />
            </View>
            <Text style={[styles.tipTitle, { color: colors.text }]}>Stay Hydrated</Text>
            <Text style={[styles.tipDescription, { color: colors.textSecondary }]}>
              Drink at least 8 glasses of water daily for healthy skin
            </Text>
          </View>

          <View style={[styles.tipCard, { backgroundColor: colors.card }]}>
            <View style={[styles.tipIconContainer, { backgroundColor: colors.primaryLight }]}>
              <Sparkles size={24} color={colors.primary} />
            </View>
            <Text style={[styles.tipTitle, { color: colors.text }]}>Gentle Cleansing</Text>
            <Text style={[styles.tipDescription, { color: colors.textSecondary }]}>
              Use a gentle, pH-balanced cleanser twice daily
            </Text>
          </View>
        </ScrollView>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 15,
    padding: 8,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '500',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  scanCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  scanCardContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scanCardText: {
    flex: 1,
  },
  scanCardTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  scanCardDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  scanCardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  recentCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recentImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  recentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  recentDate: {
    fontSize: 12,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  emptyCard: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 20,
  },
  scanNowButton: {
    padding: 16,
    borderRadius: 8,
  },
  scanNowText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  tipsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tipCard: {
    width: 200,
    height: 240,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
  },
  tipIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 12,
  },
});