import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput } from 'react-native';
import { Text } from '../../components/Themed';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { FontAwesome } from '@expo/vector-icons';
import { config_data } from './2025/reefscape_config.js';
import { useScoutingData } from '../../context/ScoutingContext';

interface ToggleButtonProps {
  label: string;
  value: boolean;
  onToggle: () => void;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ label, value, onToggle }) => (
  <TouchableOpacity 
    style={[styles.toggleButton, value && styles.toggleButtonActive]}
    onPress={onToggle}
  >
    <Text style={[styles.toggleButtonText, value && styles.toggleButtonTextActive]}>
      {label} {value ? '✓' : '✗'}
    </Text>
  </TouchableOpacity>
);

interface RatingProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max: number;
}

const Rating: React.FC<RatingProps> = ({ label, value, onChange, max }) => (
  <View style={styles.ratingContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.ratingButtons}>
      {Array.from({ length: max }, (_, i) => i + 1).map((num) => (
        <TouchableOpacity
          key={num}
          style={[styles.ratingButton, value === num && styles.ratingButtonActive]}
          onPress={() => onChange(num)}
        >
          <Text style={[styles.ratingButtonText, value === num && styles.ratingButtonTextActive]}>
            {num}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export default function EndgameScreen() {
  const router = useRouter();
  const configJson = JSON.parse(config_data);
  const endgameConfig = configJson.endgame;
  const postmatchConfig = configJson.postmatch;
  const { scoutingData, updateScoutingData } = useScoutingData();

  const [endgameState, setEndgameState] = useState({
    onStage: scoutingData.onStage,
    spotlit: scoutingData.spotlit,
    harmony: scoutingData.harmony,
    trap: scoutingData.trap,
    parked: scoutingData.parked,
    driverSkill: scoutingData.driverSkill,
    defenseRating: scoutingData.defenseRating,
    speedRating: scoutingData.speedRating,
    comments: scoutingData.comments || '',
  });

  // Update local state when context changes (e.g. when form is cleared)
  useEffect(() => {
    setEndgameState({
      onStage: scoutingData.onStage,
      spotlit: scoutingData.spotlit,
      harmony: scoutingData.harmony,
      trap: scoutingData.trap,
      parked: scoutingData.parked,
      driverSkill: scoutingData.driverSkill,
      defenseRating: scoutingData.defenseRating,
      speedRating: scoutingData.speedRating,
      comments: scoutingData.comments || '',
    });
  }, [scoutingData]);

  const toggleState = (key: keyof typeof endgameState) => {
    if (typeof endgameState[key] === 'boolean') {
      setEndgameState(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    }
  };

  const setRating = (key: keyof typeof endgameState, value: number) => {
    setEndgameState(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNext = () => {
    updateScoutingData({
      onStage: endgameState.onStage,
      spotlit: endgameState.spotlit,
      harmony: endgameState.harmony,
      trap: endgameState.trap,
      parked: endgameState.parked,
      driverSkill: endgameState.driverSkill,
      defenseRating: endgameState.defenseRating,
      speedRating: endgameState.speedRating,
      comments: endgameState.comments,
    });
    router.push('/qr');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{configJson.page_title} - Endgame</Text>
      
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Robot Status</Text>
          <ToggleButton
            label="On Stage"
            value={endgameState.onStage}
            onToggle={() => toggleState('onStage')}
          />
          <ToggleButton
            label="Spotlit"
            value={endgameState.spotlit}
            onToggle={() => toggleState('spotlit')}
          />
          <ToggleButton
            label="Harmony"
            value={endgameState.harmony}
            onToggle={() => toggleState('harmony')}
          />
          <ToggleButton
            label="Trap"
            value={endgameState.trap}
            onToggle={() => toggleState('trap')}
          />
          <ToggleButton
            label="Parked"
            value={endgameState.parked}
            onToggle={() => toggleState('parked')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Ratings</Text>
          <Rating
            label="Driver Skill"
            value={endgameState.driverSkill}
            onChange={(value) => setRating('driverSkill', value)}
            max={5}
          />
          <Rating
            label="Defense Rating"
            value={endgameState.defenseRating}
            onChange={(value) => setRating('defenseRating', value)}
            max={5}
          />
          <Rating
            label="Speed Rating"
            value={endgameState.speedRating}
            onChange={(value) => setRating('speedRating', value)}
            max={5}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comments</Text>
          <View style={styles.commentContainer}>
            <TextInput
              style={styles.commentInput}
              value={endgameState.comments}
              onChangeText={(text) => {
                if (text.length <= 60) {
                  setEndgameState(prev => ({ ...prev, comments: text }));
                }
              }}
              placeholder="Add comments (60 char max)"
              placeholderTextColor="#999"
              maxLength={60}
              multiline
            />
            <Text style={styles.charCount}>
              {endgameState.comments.length}/60
            </Text>
          </View>
        </View>

        <Button
          onPress={handleNext}
          style={styles.button}
          text="Next"
        />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color:'#F8F5F5',
  },
  content: {
    gap: 20,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: '#413838',
    padding: 15,
    borderRadius: 10,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  toggleButton: {
    backgroundColor: '#FB0101',
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  toggleButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  toggleButtonText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#FFFEFE',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  ratingContainer: {
    marginBottom: 15,
    color:'#413838',
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  ratingButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  ratingButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  ratingButtonText: {
    fontSize: 16,
    color: '#000000',
  },
  ratingButtonTextActive: {
    color: '#fff',
  },
  button: {
    marginTop: 20,
  },
  commentContainer: {
    marginTop: 5,
  },
  commentInput: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    minHeight: 60,
    color: '#000',
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    color: '#999',
    marginTop: 5,
    fontSize: 12,
  },
}); 