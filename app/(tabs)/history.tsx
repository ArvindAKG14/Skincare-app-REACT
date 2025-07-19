import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Calendar, ChevronDown, Filter, ChartLine as LineChart, ChevronRight } from 'lucide-react-native';
import { LineChart as Chart } from 'react-native-chart-kit';
import { getSkinHealthHistory, getSkinHealthTrendData, SkinHealthRecord } from '@/services/SkinHealthService';
import { router } from 'expo-router';

const screenWidth = Dimensions.get('window').width;

// Define chart data type
type ChartDataType = {
  labels: string[];
  datasets: {
    data: number[];
    color: () => string;
    strokeWidth: number;
  }[];
};

export default function HistoryScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('history');
  const [timeRange, setTimeRange] = useState('3 Months');
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState<SkinHealthRecord[]>([]);
  const [chartData, setChartData] = useState<ChartDataType>({
    labels: [],
    datasets: [{ data: [], color: () => colors.primary, strokeWidth: 2 }]
  });
  const [currentHealth, setCurrentHealth] = useState(0);
  const [improvement, setImprovement] = useState(0);

  // Load skin health history data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get history data
        const records = await getSkinHealthHistory();
        setHistoryData(records);
        
        // Set current health and improvement if records exist
        if (records.length > 0) {
          setCurrentHealth(records[0].healthScore);
          setImprovement(records[0].improvement || 0);
        }
        
        // Get chart data
        const trend = await getSkinHealthTrendData();
        setChartData(trend as ChartDataType);
      } catch (error) {
        console.error('Error loading skin health history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const chartConfig = {
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: () => colors.primary,
    labelColor: () => colors.textSecondary,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  // Get severity color based on health score
  const getSeverityColor = (healthScore: number) => {
    if (healthScore >= 80) return '#4CAF50'; // Green - Good
    if (healthScore >= 60) return '#FFC107'; // Yellow - Moderate
    return '#F44336'; // Red - Poor
  };

  // Get severity text based on health score
  const getSeverityText = (healthScore: number) => {
    if (healthScore >= 80) return 'Good';
    if (healthScore >= 60) return 'Moderate';
    return 'Poor';
  };

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Skin Health Tracker</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading your skin health data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Skin Health Tracker</Text>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.card }]}>
          <Filter size={16} color={colors.text} />
          <Text style={[styles.filterText, { color: colors.text }]}>Filter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'history' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('history')}>
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'history' ? colors.primary : colors.textSecondary },
            ]}>
            History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'progress' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('progress')}>
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'progress' ? colors.primary : colors.textSecondary },
            ]}>
            Progress
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'history' ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {historyData.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                No Skin History Yet
              </Text>
              <Text style={[styles.emptyStateDescription, { color: colors.textSecondary }]}>
                Take your first skin scan to start tracking your skin health progress.
              </Text>
              <TouchableOpacity 
                style={[styles.scanButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/(tabs)/scan')}>
                <Text style={styles.scanButtonText}>Take a Scan</Text>
              </TouchableOpacity>
            </View>
          ) : (
            historyData.map((item) => (
              <TouchableOpacity key={item.id} style={[styles.historyCard, { backgroundColor: colors.card }]}>
                <Image source={{ uri: item.imageUri }} style={styles.historyImage} />
                <View style={styles.historyContent}>
                  <Text style={[styles.historyDate, { color: colors.textSecondary }]}>
                    <Calendar size={12} color={colors.textSecondary} style={styles.dateIcon} /> {item.date}
                  </Text>
                  <Text style={[styles.historyCondition, { color: colors.text }]}>
                    Skin Health: {item.healthScore}%
                  </Text>
                  <View style={styles.historyMeta}>
                    <View style={[
                      styles.severityBadge, 
                      { backgroundColor: `${getSeverityColor(item.healthScore)}20` }
                    ]}>
                      <Text style={[
                        styles.severityText, 
                        { color: getSeverityColor(item.healthScore) }
                      ]}>
                        {getSeverityText(item.healthScore)}
                      </Text>
                    </View>
                    {item.improvement !== undefined && (
                      <View style={[
                        styles.improvementBadge, 
                        { backgroundColor: item.improvement >= 0 ? '#4CAF5020' : '#F4433620' }
                      ]}>
                        <Text style={[
                          styles.improvementText, 
                          { color: item.improvement >= 0 ? '#4CAF50' : '#F44336' }
                        ]}>
                          {item.improvement >= 0 ? '+' : ''}{item.improvement}%
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <ChevronRight size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.progressContainer}>
          {historyData.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                No Progress Data Yet
              </Text>
              <Text style={[styles.emptyStateDescription, { color: colors.textSecondary }]}>
                Take your first skin scan to start tracking your skin health progress.
              </Text>
              <TouchableOpacity 
                style={[styles.scanButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/(tabs)/scan')}>
                <Text style={styles.scanButtonText}>Take a Scan</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.timeRangeSelector}>
                <Text style={[styles.timeRangeLabel, { color: colors.text }]}>Time Range:</Text>
                <TouchableOpacity style={[styles.timeRangeButton, { backgroundColor: colors.card }]}>
                  <Text style={[styles.timeRangeButtonText, { color: colors.text }]}>{timeRange}</Text>
                  <ChevronDown size={16} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.chartTitle, { color: colors.text }]}>Overall Skin Health</Text>
                {chartData.labels.length > 0 ? (
                  <Chart
                    data={chartData}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                  />
                ) : (
                  <View style={styles.noChartDataContainer}>
                    <Text style={[styles.noChartDataText, { color: colors.textSecondary }]}>
                      Not enough data to show chart.
                    </Text>
                    <Text style={[styles.noChartDataSubtext, { color: colors.textSecondary }]}>
                      Take more scans to see your progress over time.
                    </Text>
                  </View>
                )}
              </View>

              <View style={[styles.statsGrid, { backgroundColor: colors.card }]}>
                <View style={styles.statsItem}>
                  <Text style={[styles.statsValue, { color: colors.text }]}>{currentHealth}%</Text>
                  <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>Current Health</Text>
                </View>
                <View style={[styles.statsDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statsItem}>
                  <Text style={[
                    styles.statsValue, 
                    { color: improvement >= 0 ? '#4CAF50' : '#F44336' }
                  ]}>
                    {improvement >= 0 ? '+' : ''}{improvement}%
                  </Text>
                  <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>Improvement</Text>
                </View>
              </View>

              <Text style={[styles.sectionTitle, { color: colors.text }]}>Acne Detection Summary</Text>

              {historyData.length > 0 && (
                <View style={[styles.conditionCard, { backgroundColor: colors.card }]}>
                  <View style={styles.conditionHeader}>
                    <Text style={[styles.conditionName, { color: colors.text }]}>Acne Count</Text>
                    <View style={[
                      styles.conditionBadge, 
                      { backgroundColor: improvement >= 0 ? '#4CAF5020' : '#F4433620' }
                    ]}>
                      <Text style={[
                        styles.conditionBadgeText, 
                        { color: improvement >= 0 ? '#4CAF50' : '#F44336' }
                      ]}>
                        {improvement >= 0 ? 'Improving' : 'Worsening'}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${currentHealth}%`, 
                          backgroundColor: getSeverityColor(currentHealth) 
                        }
                      ]} 
                    />
                  </View>
                  <View style={styles.conditionStats}>
                    <Text style={[styles.conditionStatText, { color: colors.textSecondary }]}>
                      First scan: {historyData[historyData.length - 1].date}
                    </Text>
                    <Text style={[styles.conditionStatText, { color: colors.textSecondary }]}>
                      {currentHealth}% health
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
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
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterText: {
    marginLeft: 6,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  historyCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  historyImage: {
    width: 80,
    height: 80,
  },
  historyContent: {
    flex: 1,
    padding: 12,
  },
  historyDate: {
    fontSize: 12,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 4,
  },
  historyCondition: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  historyMeta: {
    flexDirection: 'row',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  improvementBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  improvementText: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressContainer: {
    paddingHorizontal: 20,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeRangeLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 12,
  },
  timeRangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  timeRangeButtonText: {
    marginRight: 6,
    fontWeight: '500',
  },
  chartCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 24,
  },
  statsItem: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  statsDivider: {
    width: 1,
    marginVertical: 16,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  conditionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  conditionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  conditionName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  conditionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  conditionBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  conditionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  conditionStatText: {
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyStateContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  scanButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  scanButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noChartDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noChartDataText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  noChartDataSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});