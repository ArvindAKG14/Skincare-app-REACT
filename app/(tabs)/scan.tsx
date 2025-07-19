import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform, ActivityIndicator, Alert, LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Camera, Upload, ChevronLeft, Info, CircleAlert as AlertCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { createSkinHealthRecord, saveSkinHealthRecord } from '@/services/SkinHealthService';

export default function ScanScreen() {
  const { colors } = useTheme();
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [imageSize, setImageSize] = useState({ width: 300, height: 200 });
  useEffect(() => {
    if (image) {
      // Get the image dimensions when it's loaded
      Image.getSize(image, (width, height) => {
        console.log('Original image dimensions:', width, height);
        // Store the original dimensions for accurate bounding box positioning
        setImageSize({ width, height });
      }, (error) => {
        console.error('Error getting image size:', error);
      });
    }
  }, [image]);

  const onImageLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setImageSize({ width, height });
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You've refused to allow this app to access your camera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You've refused to allow this app to access your photos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const analyzeImage = async (imageUri: string) => {
    setAnalyzing(true);
    try {
      // Create a FormData object
      const formData = new FormData();
      
      // Add the image file to the form data
      // The name of the field must be "file" (case sensitive)
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg', // Adjust based on your image type
        name: 'photo.jpg',
      } as any);
      
      console.log('Sending image to API...');
      
      // Send to API using multipart/form-data
      const response = await fetch('https://cvmodel.onrender.com/detect/', {
        method: 'POST',
        headers: {
          // Don't set Content-Type header, it will be set automatically with the boundary
          'Accept': 'application/json',
        },
        body: formData,
      });

      // Log the response status and headers for debugging
      console.log('Response status:', response.status);
      console.log('Response headers:', JSON.stringify([...response.headers.entries()]));

      if (!response.ok) {
        // Try to get more detailed error information
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      // Save the scan results to skin health history
      if (data.success && data.detections) {
        try {
          // Create a new skin health record
          const skinHealthRecord = await createSkinHealthRecord(
            imageUri,
            data.detections,
            data.count
          );
          
          // Save the record
          await saveSkinHealthRecord(skinHealthRecord);
          
          console.log('Skin health record saved:', skinHealthRecord);
          
          // Add the health score to the results
          data.healthScore = skinHealthRecord.healthScore;
          data.improvement = skinHealthRecord.improvement;
        } catch (error) {
          console.error('Error saving skin health record:', error);
          // Continue with the scan results even if saving fails
        }
      }

      // If the API returns an image with boxes already drawn, we can use that
      if (data.image_with_boxes && data.image_with_boxes.startsWith('data:image')) {
        // Store the original image and the image with boxes
        setResults({
          ...data,
          originalImage: imageUri,
          // The API already provides an image with boxes drawn
        });
      } else {
        // If the API doesn't return an image with boxes, we'll draw them ourselves
        setResults({
          ...data,
          originalImage: imageUri,
          // We'll draw the boxes in the render function
        });
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert(
        "Analysis Failed", 
        `We couldn't analyze your image: ${error instanceof Error ? error.message : 'An unknown error occurred'}. Please try again or check your internet connection.`
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const resetScan = () => {
    setImage(null);
    setResults(null);
  };

  // Helper function to get a color for each class
  const getColorForClass = (className: string): string => {
    switch (className.toLowerCase()) {
      case 'pustules':
        return '#FF5252'; // Red
      case 'papules':
        return '#FFD740'; // Amber
      case 'blackheads':
        return '#40C4FF'; // Light Blue
      case 'dark spot':
        return '#7C4DFF'; // Deep Purple
      default:
        return '#69F0AE'; // Green
    }
  };

  if (results) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={resetScan} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Analysis Results</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.imageContainer}>
            {/* Image with bounding boxes overlay */}
            <View style={styles.imageWrapper} onLayout={onImageLayout}>
              <Image source={{ uri: image! }} style={styles.resultImage} />
              
              {/* If API returns image with boxes already drawn, use that instead */}
              {results.image_with_boxes && (
                <Image 
                  source={{ uri: results.image_with_boxes }} 
                  style={[styles.resultImageOverlay, { opacity: 0.9 }]} 
                />
              )}
              
              {/* Otherwise, draw our own boxes */}
              {!results.image_with_boxes && results.detections && results.detections.map((detection: any, index: number) => {
                // bbox format is [x_min, y_min, x_max, y_max] in original image coordinates
                const [x_min, y_min, x_max, y_max] = detection.bbox;
                
                // Calculate position as percentages of the image dimensions
                const left = (x_min / imageSize.width) * 100;
                const top = (y_min / imageSize.height) * 100;
                const width = ((x_max - x_min) / imageSize.width) * 100;
                const height = ((y_max - y_min) / imageSize.height) * 100;
                
                console.log(`Box ${index}: left=${left}%, top=${top}%, width=${width}%, height=${height}%`);
                
                return (
                  <View 
                    key={index} 
                    style={{
                      position: 'absolute',
                      left: `${left}%`,
                      top: `${top}%`,
                      width: `${width}%`,
                      height: `${height}%`,
                      borderWidth: 3,
                      borderColor: getColorForClass(detection.class),
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      zIndex: 10,
                    }}
                  >
                    <View style={[
                      styles.boxLabel, 
                      { 
                        backgroundColor: getColorForClass(detection.class),
                        position: 'absolute',
                        top: 0,
                        left: 0,
                      }
                    ]}>
                      <Text style={styles.boxLabelText}>{detection.class}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={[styles.resultCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Model Response</Text>
            
            {/* Display success status */}
            <View style={styles.jsonItem}>
              <Text style={[styles.jsonLabel, { color: colors.text }]}>Success:</Text>
              <Text style={[styles.jsonValue, { color: colors.primary }]}>
                {results.success ? 'True' : 'False'}
              </Text>
            </View>
            
            {/* Display total count */}
            <View style={styles.jsonItem}>
              <Text style={[styles.jsonLabel, { color: colors.text }]}>Total Detections:</Text>
              <Text style={[styles.jsonValue, { color: colors.primary }]}>
                {results.count}
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            {/* Display detections */}
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}>
              Detected Items
            </Text>
            
            {results.detections && results.detections.map((detection: any, index: number) => (
              <View key={index} style={styles.detectionItem}>
                <View style={[
                  styles.detectionHeader, 
                  { backgroundColor: getColorForClass(detection.class) + '20' }
                ]}>
                  <Text style={[styles.detectionClass, { color: colors.text }]}>
                    {detection.class}
                  </Text>
                  <Text style={[styles.detectionConfidence, { color: colors.primary }]}>
                    {Math.round(detection.confidence * 100)}% confidence
                  </Text>
                </View>
                <View style={styles.detectionDetails}>
                  <Text style={[styles.detectionLabel, { color: colors.textSecondary }]}>
                    Bounding Box:
                  </Text>
                  <Text style={[styles.detectionValue, { color: colors.text }]}>
                    [{detection.bbox.map((n: number) => n.toFixed(2)).join(', ')}]
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Scan Your Skin</Text>
        <TouchableOpacity style={styles.infoButton}>
          <Info size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {analyzing ? (
        <View style={styles.analyzingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.analyzingText, { color: colors.text }]}>
            Analyzing your skin...
          </Text>
          <Text style={[styles.analyzingSubtext, { color: colors.textSecondary }]}>
            Our AI is examining your skin condition
          </Text>
        </View>
      ) : image ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: image }} style={styles.previewImage} />
          <TouchableOpacity
            style={[styles.rescanButton, { backgroundColor: colors.card }]}
            onPress={resetScan}>
            <Text style={[styles.rescanButtonText, { color: colors.text }]}>Retake</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.optionCard, { backgroundColor: colors.card }]}
            onPress={takePhoto}>
            <View style={[styles.optionIconContainer, { backgroundColor: colors.primaryLight }]}>
              <Camera size={32} color={colors.primary} />
            </View>
            <Text style={[styles.optionTitle, { color: colors.text }]}>Take a Photo</Text>
            <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
              Use your camera to take a photo of your skin condition
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, { backgroundColor: colors.card }]}
            onPress={pickImage}>
            <View style={[styles.optionIconContainer, { backgroundColor: colors.primaryLight }]}>
              <Upload size={32} color={colors.primary} />
            </View>
            <Text style={[styles.optionTitle, { color: colors.text }]}>Upload a Photo</Text>
            <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
              Select an existing photo from your gallery
            </Text>
          </TouchableOpacity>
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  placeholderContainer: {
    height: 300,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  placeholderText: {
    textAlign: 'center',
    paddingHorizontal: 40,
    fontSize: 16,
  },
  previewContainer: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  analyzingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructionsContainer: {
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionNumberText: {
    color: 'white',
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resultsContainer: {
    flex: 1,
  },
  imageContainer: {
    padding: 20,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
  },
  resultImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  resultImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  boxLabel: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 20,
  },
  boxLabelText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  resultCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  conditionName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  confidenceBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  severityIndicator: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 1,
  },
  severityBar: {
    height: '100%',
    borderRadius: 4,
  },
  severityText: {
    fontSize: 14,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    marginRight: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  doctorAdviceCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  doctorAdviceIcon: {
    marginRight: 12,
  },
  doctorAdviceText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confidenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  confidenceLabel: {
    fontSize: 14,
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 16,
  },
  doctorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  doctorAlertText: {
    marginLeft: 8,
    fontSize: 14,
  },
  findDoctorButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  findDoctorButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  analyzingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingSubtext: {
    marginTop: 8,
    textAlign: 'center',
  },
  rescanButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  rescanButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  optionsContainer: {
    flex: 1,
    padding: 20,
  },
  optionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
  },
  jsonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  jsonLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  jsonValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detectionItem: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  detectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  detectionClass: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  detectionConfidence: {
    fontSize: 14,
    fontWeight: '500',
  },
  detectionDetails: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  detectionLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  detectionValue: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  infoButton: {
    padding: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  recommendationBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    marginRight: 12,
  },
  doctorNote: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
});