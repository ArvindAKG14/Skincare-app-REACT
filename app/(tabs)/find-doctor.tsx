import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Search, MapPin, Star, Calendar, ChevronRight, Filter, List, Map as MapIcon } from 'lucide-react-native';
import { getNearbyDermatologists, Doctor } from '@/services/DoctorService';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

export default function FindDoctorScreen() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setLocationError('Permission to access location was denied');
          setLoading(false);
          return;
        }
        
        // Get current location
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        
        // Save user location
        setUserLocation({ latitude, longitude });
        
        console.log('User location:', latitude, longitude);
        
        // Pass location to getNearbyDermatologists
        const nearbyDoctors = await getNearbyDermatologists(latitude, longitude);
        console.log('Found doctors:', nearbyDoctors.length);
        setDoctors(nearbyDoctors);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setLocationError('Could not fetch nearby doctors. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const filteredDoctors = searchQuery
    ? doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : doctors;

  const handleMarkerPress = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
  };

  const renderMap = () => {
    if (!userLocation) return null;

    return (
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation
        >
          {filteredDoctors.map((doctor) => 
            doctor.location ? (
              <Marker
                key={doctor.id}
                coordinate={{
                  latitude: doctor.location.latitude,
                  longitude: doctor.location.longitude,
                }}
                title={doctor.name}
                description={doctor.specialty}
                onPress={() => handleMarkerPress(doctor)}
              />
            ) : null
          )}
        </MapView>
        
        {selectedDoctor && (
          <View style={[styles.selectedDoctorCard, { backgroundColor: colors.card }]}>
            {selectedDoctor.image ? (
              <Image source={{ uri: selectedDoctor.image }} style={styles.selectedDoctorImage} />
            ) : (
              <View style={[styles.selectedDoctorImage, { backgroundColor: colors.card }]} />
            )}
            <View style={styles.selectedDoctorInfo}>
              <Text style={[styles.doctorName, { color: colors.text }]}>{selectedDoctor.name}</Text>
              <Text style={[styles.doctorSpecialty, { color: colors.textSecondary }]}>
                {selectedDoctor.specialty}
              </Text>
              <View style={styles.doctorRating}>
                <Star size={16} color="#FFD700" fill="#FFD700" />
                <Text style={[styles.ratingText, { color: colors.text }]}>{selectedDoctor.rating}</Text>
              </View>
              <View style={styles.doctorLocation}>
                <MapPin size={14} color={colors.textSecondary} />
                <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                  {selectedDoctor.distance} • {selectedDoctor.address}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.bookButton, { backgroundColor: colors.primary }]}
              onPress={() => console.log('Book appointment with', selectedDoctor.name)}
            >
              <Text style={styles.bookButtonText}>Book</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderDoctorsList = () => {
    return (
      <ScrollView style={styles.doctorsContainer} showsVerticalScrollIndicator={false}>
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor) => (
            <TouchableOpacity
              key={doctor.id}
              style={[styles.doctorCard, { backgroundColor: colors.card }]}>
              {doctor.image ? (
                <Image source={{ uri: doctor.image }} style={styles.doctorImage} />
              ) : (
                <View style={[styles.doctorImage, { backgroundColor: colors.card }]} />
              )}
              <View style={styles.doctorInfo}>
                <Text style={[styles.doctorName, { color: colors.text }]}>{doctor.name}</Text>
                <Text style={[styles.doctorSpecialty, { color: colors.textSecondary }]}>
                  {doctor.specialty}
                </Text>
                <View style={styles.doctorRating}>
                  <Star size={16} color="#FFD700" fill="#FFD700" />
                  <Text style={[styles.ratingText, { color: colors.text }]}>{doctor.rating}</Text>
                </View>
                <View style={styles.doctorLocation}>
                  <MapPin size={14} color={colors.textSecondary} />
                  <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                    {doctor.distance} • {doctor.address}
                  </Text>
                </View>
                <View style={styles.doctorAvailability}>
                  <Calendar size={14} color={colors.primary} />
                  <Text style={[styles.availabilityText, { color: colors.primary }]}>
                    {doctor.availability}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noResultsContainer}>
            <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
              {locationError || `No dermatologists found${searchQuery ? ` matching "${searchQuery}"` : ' in your area'}`}
            </Text>
            {searchQuery && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={[styles.clearSearchText, { color: colors.primary }]}>
                  Clear search
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Find a Dermatologist</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[
              styles.viewToggleButton, 
              { backgroundColor: viewMode === 'list' ? colors.primary : colors.card }
            ]}
            onPress={() => setViewMode('list')}
          >
            <List size={16} color={viewMode === 'list' ? 'white' : colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.viewToggleButton, 
              { backgroundColor: viewMode === 'map' ? colors.primary : colors.card }
            ]}
            onPress={() => setViewMode('map')}
          >
            <MapIcon size={16} color={viewMode === 'map' ? 'white' : colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.card }]}>
            <Filter size={16} color={colors.text} />
            <Text style={[styles.filterText, { color: colors.text }]}>Filter</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Search size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search by name or specialty"
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Finding dermatologists near you...
          </Text>
        </View>
      ) : viewMode === 'list' ? (
        renderDoctorsList()
      ) : (
        renderMap()
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
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewToggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  doctorsContainer: {
    paddingHorizontal: 20,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  doctorImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  doctorInfo: {
    flex: 1,
    marginLeft: 16,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    marginBottom: 4,
  },
  doctorRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  doctorLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    marginLeft: 4,
    fontSize: 12,
  },
  doctorAvailability: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  clearSearchText: {
    fontSize: 16,
    fontWeight: '500',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  selectedDoctorCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDoctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  selectedDoctorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  bookButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});