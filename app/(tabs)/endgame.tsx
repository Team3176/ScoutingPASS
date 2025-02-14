import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput } from 'react-native';
import { Text } from '../../components/Themed';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { FontAwesome } from '@expo/vector-icons';
import { config_data } from './2025/reefscape_config.js';
import { useScoutingData } from '../../context/ScoutingContext';
import { useColorScheme } from 'react-native';

interface ToggleButtonProps {
  label: string;
  value: boolean;
  onToggle: () => void;
  trueText?: string;
  falseText?: string;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ label, value, onToggle, trueText, falseText }) => (
  <TouchableOpacity 
    style={[styles.toggleButton, value && styles.toggleButtonActive]}
    onPress={onToggle}
  >
    <Text style={[styles.toggleButtonText, value && styles.toggleButtonTextActive]}>
      {trueText && falseText ? (value ? `${trueText} ✓` : `${falseText} ✗`) : (value ? 'Successful ✓' : 'Failed ✗')}
    </Text>
  </TouchableOpacity>
);

interface RadioButtonProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}

const RadioButton: React.FC<RadioButtonProps> = ({ label, selected, onSelect }) => (
  <TouchableOpacity 
    style={[styles.radioButton, selected && styles.radioButtonSelected]}
    onPress={onSelect}
  >
    <Text style={[styles.radioButtonText, selected && styles.radioButtonTextSelected]}>
      {label}
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
  const colorScheme = useColorScheme();

  type ClimbStatus = 'not_attempted' | 'failed' | 'successful';

  const [endgameState, setEndgameState] = useState({
    deepClimbStatus: 'not_attempted' as ClimbStatus,
    shallowClimbStatus: 'not_attempted' as ClimbStatus,
    parkedStatus: 'not_attempted' as ClimbStatus,
    driverSkill: scoutingData.driverSkill,
    defenseRating: scoutingData.defenseRating,
    speedRating: scoutingData.speedRating,
    comments: scoutingData.comments || '',
  });

  // Update local state when context changes (e.g. when form is cleared)
  useEffect(() => {
    setEndgameState({
      deepClimbStatus: 'not_attempted',
      shallowClimbStatus: 'not_attempted',
      parkedStatus: 'not_attempted',
      driverSkill: scoutingData.driverSkill,
      defenseRating: scoutingData.defenseRating,
      speedRating: scoutingData.speedRating,
      comments: scoutingData.comments || '',
    });
  }, [scoutingData]);

  const setClimbStatus = (key: 'deepClimbStatus' | 'shallowClimbStatus' | 'parkedStatus', status: ClimbStatus) => {
    setEndgameState(prev => ({
      ...prev,
      [key]: status
    }));
  };

  const setRating = (key: keyof typeof endgameState, value: number) => {
    setEndgameState(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNext = () => {
    updateScoutingData({
      onStage: endgameState.deepClimbStatus === 'successful' || endgameState.shallowClimbStatus === 'successful',
      spotlit: false,
      harmony: false,
      trap: false,
      parked: endgameState.parkedStatus === 'successful',
      driverSkill: endgameState.driverSkill,
      defenseRating: endgameState.defenseRating,
      speedRating: endgameState.speedRating,
      comments: endgameState.comments,
    });
    router.push('/qr');
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: colorScheme === 'light' ? '#fff' : '#000' }
    ]}>
      <ScrollView>
        <Text style={[
          styles.title,
          { color: colorScheme === 'light' ? '#000' : '#fff' }
        ]}>{configJson.page_title} - Endgame</Text>
        
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deep Climb</Text>
            <View style={styles.radioGroup}>
              <RadioButton
                label="Not Attempted"
                selected={endgameState.deepClimbStatus === 'not_attempted'}
                onSelect={() => setClimbStatus('deepClimbStatus', 'not_attempted')}
              />
              <RadioButton
                label="Attempted but Failed"
                selected={endgameState.deepClimbStatus === 'failed'}
                onSelect={() => setClimbStatus('deepClimbStatus', 'failed')}
              />
              <RadioButton
                label="Successful"
                selected={endgameState.deepClimbStatus === 'successful'}
                onSelect={() => setClimbStatus('deepClimbStatus', 'successful')}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shallow Climb</Text>
            <View style={styles.radioGroup}>
              <RadioButton
                label="Not Attempted"
                selected={endgameState.shallowClimbStatus === 'not_attempted'}
                onSelect={() => setClimbStatus('shallowClimbStatus', 'not_attempted')}
              />
              <RadioButton
                label="Attempted but Failed"
                selected={endgameState.shallowClimbStatus === 'failed'}
                onSelect={() => setClimbStatus('shallowClimbStatus', 'failed')}
              />
              <RadioButton
                label="Successful"
                selected={endgameState.shallowClimbStatus === 'successful'}
                onSelect={() => setClimbStatus('shallowClimbStatus', 'successful')}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Parked</Text>
            <View style={styles.radioGroup}>
              <RadioButton
                label="Not Attempted"
                selected={endgameState.parkedStatus === 'not_attempted'}
                onSelect={() => setClimbStatus('parkedStatus', 'not_attempted')}
              />
              <RadioButton
                label="Attempted but Failed"
                selected={endgameState.parkedStatus === 'failed'}
                onSelect={() => setClimbStatus('parkedStatus', 'failed')}
              />
              <RadioButton
                label="Successful"
                selected={endgameState.parkedStatus === 'successful'}
                onSelect={() => setClimbStatus('parkedStatus', 'successful')}
              />
            </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
    color: '#fff',
  },
  toggleButton: {
    backgroundColor: '#FB0101',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#4CAF50',
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#fff',
  },
  ratingContainer: {
    marginBottom: 15,
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
  radioGroup: {
    gap: 10,
  },
  radioButton: {
    backgroundColor: '#2F2F2F',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  radioButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  radioButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  radioButtonTextSelected: {
    color: '#fff',
  },
}); 