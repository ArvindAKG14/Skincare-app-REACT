import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { X, Check, CircleAlert as AlertCircle } from 'lucide-react-native';
import { router } from 'expo-router';

export default function SymptomCheckerModal() {
  const { colors } = useTheme();
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [currentSymptom, setCurrentSymptom] = useState('');

  const commonSymptoms = [
    'Itching', 'Redness', 'Dryness', 'Flaking', 'Burning', 
    'Swelling', 'Rash', 'Bumps', 'Pain', 'Discoloration'
  ];

  const addSymptom = (symptom: string) => {
    if (symptom.trim() && !symptoms.includes(symptom.trim())) {
      setSymptoms([...symptoms, symptom.trim()]);
      setCurrentSymptom('');
    }
  };

  const removeSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter(s => s !== symptom));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Symptom Checker</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <AlertCircle size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Adding your symptoms helps us provide a more accurate analysis of your skin condition.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Symptoms</Text>

        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Enter a symptom"
            placeholderTextColor={colors.textSecondary}
            value={currentSymptom}
            onChangeText={setCurrentSymptom}
            onSubmitEditing={() => addSymptom(currentSymptom)}
          />
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => addSymptom(currentSymptom)}>
            <Check size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.symptomsContainer}>
          {symptoms.length > 0 ? (
            symptoms.map((symptom, index) => (
              <View key={index} style={[styles.symptomTag, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.symptomText, { color: colors.primary }]}>{symptom}</Text>
                <TouchableOpacity onPress={() => removeSymptom(symptom)}>
                  <X size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={[styles.noSymptomsText, { color: colors.textSecondary }]}>
              No symptoms added yet
            </Text>
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Common Symptoms</Text>

        <View style={styles.commonSymptomsContainer}>
          {commonSymptoms.map((symptom, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.commonSymptomTag,
                { 
                  backgroundColor: symptoms.includes(symptom) ? colors.primaryLight : colors.card,
                  borderColor: symptoms.includes(symptom) ? colors.primary : colors.border
                }
              ]}
              onPress={() => {
                if (symptoms.includes(symptom)) {
                  removeSymptom(symptom);
                } else {
                  addSymptom(symptom);
                }
              }}>
              <Text
                style={[
                  styles.commonSymptomText,
                  { color: symptoms.includes(symptom) ? colors.primary : colors.text }
                ]}>
                {symptom}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
          onPress={() => router.back()}>
          <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}>
          <Text style={styles.buttonTextPrimary}>Apply Symptoms</Text>
        </TouchableOpacity>
      </View>
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
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  addButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  symptomTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  symptomText: {
    marginRight: 8,
    fontWeight: '500',
  },
  noSymptomsText: {
    fontStyle: 'italic',
    marginBottom: 8,
  },
  commonSymptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  commonSymptomTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  commonSymptomText: {
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonTextPrimary: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});