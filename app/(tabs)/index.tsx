import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, TouchableOpacity, TouchableWithoutFeedback, Dimensions, View as RNView, Modal } from 'react-native';
import { Text, View, TextInput } from '../../components/Themed';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { useScoutingData } from '../../context/ScoutingContext';
import { config_data } from './2025/reefscape_config.js';
import { useColorScheme } from 'react-native';
import Colors from '../../constants/Colors';

interface Point {
  x: number;
  y: number;
}

export default function PreMatchScreen() {
  const router = useRouter();
  const { scoutingData, updateScoutingData } = useScoutingData();
  const configJson = JSON.parse(config_data);
  const colorScheme = useColorScheme() ?? 'light';
  const [showMatchLevelDropdown, setShowMatchLevelDropdown] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    updateScoutingData({ [field]: value });
  };

  const handleNext = () => {
    router.push('/auton');
  };

  const handleImageClick = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const imageWidth = Dimensions.get('window').width - 40;
    const imageHeight = imageWidth * 0.6;

    // Only set point if click is within image bounds
    if (locationX >= 0 && locationX <= imageWidth && locationY >= 0 && locationY <= imageHeight) {
      updateScoutingData({ clickedPoints: [{ x: locationX, y: locationY }] });
    }
  };

  // Find the field configs from prematch section
  const eventConfig = configJson.prematch.find((field: any) => field.code === 'e');
  const matchConfig = configJson.prematch.find((field: any) => field.code === 'm');
  const teamConfig = configJson.prematch.find((field: any) => field.code === 't');
  const scouterConfig = configJson.prematch.find((field: any) => field.code === 's');
  const robotConfig = configJson.prematch.find((field: any) => field.code === 'r');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{configJson.title}</Text>
        
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{eventConfig?.name || 'Event Code'}</Text>
            <TextInput
              style={[styles.input, { color: '#000000' }]}
              value={scoutingData.event}
              onChangeText={(value) => handleInputChange('event', value)}
              placeholder={`Enter ${eventConfig?.name.toLowerCase() || 'event code'}`}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{matchConfig?.name || 'Match Number'}</Text>
            <TextInput
              style={[styles.input, { color: '#000000' }]}
              value={scoutingData.matchNumber}
              onChangeText={(value) => handleInputChange('matchNumber', value)}
              placeholder={`Enter ${matchConfig?.name.toLowerCase() || 'match number'}`}
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Match Level</Text>
            <TouchableOpacity
              style={[
                styles.input,
                { paddingVertical: 10, color: '#000000' }
              ]}
              onPress={() => setShowMatchLevelDropdown(!showMatchLevelDropdown)}
            >
              <Text style={{ color: '#000000' }}>{scoutingData.matchLevel || 'Select match level'}</Text>
            </TouchableOpacity>
            <Modal
              visible={showMatchLevelDropdown}
              transparent={true}
              animationType="none"
              onRequestClose={() => setShowMatchLevelDropdown(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowMatchLevelDropdown(false)}
              >
                <View style={[
                  styles.dropdownModal,
                  { backgroundColor: Colors[colorScheme].cardBackground },
                ]}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleInputChange('matchLevel', 'Qualifications');
                      setShowMatchLevelDropdown(false);
                    }}
                  >
                    <Text style={{ color: '#000000' }}>Qualifications</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleInputChange('matchLevel', 'Eliminations');
                      setShowMatchLevelDropdown(false);
                    }}
                  >
                    <Text style={{ color: '#000000' }}>Eliminations</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Modal>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{teamConfig?.name || 'Team Number'}</Text>
            <TextInput
              style={[styles.input, { color: '#000000' }]}
              value={scoutingData.teamNumber}
              onChangeText={(value) => handleInputChange('teamNumber', value)}
              placeholder={`Enter ${teamConfig?.name.toLowerCase() || 'team number'}`}
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{scouterConfig?.name || 'Scouter Name'}</Text>
            <TextInput
              style={[styles.input, { color: '#000000' }]}
              value={scoutingData.scouterInitials}
              onChangeText={(value) => handleInputChange('scouterInitials', value)}
              placeholder={`Enter ${scouterConfig?.name.toLowerCase() || 'your name'}`}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{robotConfig?.name || 'Robot Position'}</Text>
            <TextInput
              style={[styles.input, { color: '#000000' }]}
              value={scoutingData.robotPosition}
              onChangeText={(value) => handleInputChange('robotPosition', value)}
              placeholder={`Enter ${robotConfig?.name.toLowerCase() || 'robot position'}`}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.fieldImageContainer}>
            <Text style={styles.imageLabel}>Auton Start Position</Text>
            <View style={styles.imageWrapper}>
              <TouchableWithoutFeedback onPress={handleImageClick}>
                <View>
                  <Image
                    source={require('./2025/field_image.png')}
                    style={styles.fieldImage}
                    resizeMode="contain"
                  />
                  {scoutingData.clickedPoints.map((point, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        {
                          left: point.x - 5,
                          top: point.y - 5,
                        },
                      ]}
                    />
                  ))}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>

          <Button
            onPress={handleNext}
            style={styles.button}
            text="Next"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color:'#F8F5F5',
  },
  formContainer: {
    gap: 15,
    position: 'relative',
    zIndex: 2,
  },
  inputGroup: {
    marginBottom: 15,
    position: 'relative',
    zIndex: 3,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: Colors.light.inputBackground,
  },
  button: {
    marginTop: 20,
    zIndex: 1,
  },
  fieldImageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginVertical: 20,
    zIndex: 1,
  },
  imageWrapper: {
    width: Dimensions.get('window').width - 40,
    height: (Dimensions.get('window').width - 40) * 0.6,
    overflow: 'hidden',
  },
  fieldImage: {
    width: '100%',
    height: '100%',
  },
  dot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
    borderWidth: 1,
    borderColor: 'black',
  },
  imageLabel: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    width: '80%',  // Take up 80% of screen width
    borderRadius: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});
