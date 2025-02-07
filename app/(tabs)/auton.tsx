import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '../../components/Themed';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Counter } from '../../components/ui/Counter';
import { useColorScheme } from 'react-native';
import Colors from '../../constants/Colors';
import { config_data } from './2025/reefscape_config.js';
import { useScoutingData } from '../../context/ScoutingContext';

export default function AutonScreen() {
  const router = useRouter();
  const configJson = JSON.parse(config_data);
  const autonConfig = configJson.auton;
  const { scoutingData, updateScoutingData } = useScoutingData();
  const colorScheme = useColorScheme() ?? 'light';

  const [scores, setScores] = useState({
    coralL1: scoutingData.autonCoralL1,
    coralL2: scoutingData.autonCoralL2,
    coralL3: scoutingData.autonCoralL3,
    coralL4: scoutingData.autonCoralL4,
    processorScore: scoutingData.autonProcessorScore,
    netScore: scoutingData.autonNetScore,
    mobility: scoutingData.mobility,
    crossedLine: scoutingData.crossedLine || false,
    coralScoredLocation: scoutingData.coralScoredLocation || null,
  });

  // Update local state when context changes (e.g. when form is cleared)
  useEffect(() => {
    setScores({
      coralL1: scoutingData.autonCoralL1,
      coralL2: scoutingData.autonCoralL2,
      coralL3: scoutingData.autonCoralL3,
      coralL4: scoutingData.autonCoralL4,
      processorScore: scoutingData.autonProcessorScore,
      netScore: scoutingData.autonNetScore,
      mobility: scoutingData.mobility,
      crossedLine: scoutingData.crossedLine || false,
      coralScoredLocation: scoutingData.coralScoredLocation || null,
    });
  }, [scoutingData]);

  const handleIncrement = (key: keyof typeof scores) => {
    if (typeof scores[key] === 'number') {
      setScores(prev => ({
        ...prev,
        [key]: (prev[key] as number) + 1
      }));
    }
  };

  const handleDecrement = (key: keyof typeof scores) => {
    if (typeof scores[key] === 'number' && scores[key] > 0) {
      setScores(prev => ({
        ...prev,
        [key]: (prev[key] as number) - 1
      }));
    }
  };

  const toggleMobility = () => {
    setScores(prev => ({
      ...prev,
      mobility: !prev.mobility
    }));
  };

  const toggleCrossedLine = () => {
    setScores(prev => ({
      ...prev,
      crossedLine: !prev.crossedLine
    }));
  };

  const handleNext = () => {
    // Save auton data to context
    updateScoutingData({
      autonCoralL1: scores.coralL1,
      autonCoralL2: scores.coralL2,
      autonCoralL3: scores.coralL3,
      autonCoralL4: scores.coralL4,
      autonProcessorScore: scores.processorScore,
      autonNetScore: scores.netScore,
      mobility: scores.mobility,
      crossedLine: scores.crossedLine,
      coralScoredLocation: scores.coralScoredLocation,
    });
    router.push('/teleop');
  };

  // Find specific configurations
  const leaveStartingLineConfig = autonConfig.find((field: any) => field.code === 'al');
  const coralL1Config = autonConfig.find((field: any) => field.code === 'ac1');
  const coralL2Config = autonConfig.find((field: any) => field.code === 'ac2');
  const coralL3Config = autonConfig.find((field: any) => field.code === 'ac3');
  const coralL4Config = autonConfig.find((field: any) => field.code === 'ac4');
  const processorScoreConfig = autonConfig.find((field: any) => field.code === 'aps');
  const netScoreConfig = autonConfig.find((field: any) => field.code === 'ans');

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>{configJson.page_title} - Autonomous</Text>
        
        <View style={styles.content}>
          <Counter
            label={coralL1Config?.name || "Coral L1"}
            value={scores.coralL1}
            onIncrement={() => handleIncrement('coralL1')}
            onDecrement={() => handleDecrement('coralL1')}
          />

          <Counter
            label={coralL2Config?.name || "Coral L2"}
            value={scores.coralL2}
            onIncrement={() => handleIncrement('coralL2')}
            onDecrement={() => handleDecrement('coralL2')}
          />

          <Counter
            label={coralL3Config?.name || "Coral L3"}
            value={scores.coralL3}
            onIncrement={() => handleIncrement('coralL3')}
            onDecrement={() => handleDecrement('coralL3')}
          />

          <Counter
            label={coralL4Config?.name || "Coral L4"}
            value={scores.coralL4}
            onIncrement={() => handleIncrement('coralL4')}
            onDecrement={() => handleDecrement('coralL4')}
          />

          <Counter
            label={processorScoreConfig?.name || "Processor Score"}
            value={scores.processorScore}
            onIncrement={() => handleIncrement('processorScore')}
            onDecrement={() => handleDecrement('processorScore')}
          />

          <Counter
            label={netScoreConfig?.name || "Net Score"}
            value={scores.netScore}
            onIncrement={() => handleIncrement('netScore')}
            onDecrement={() => handleDecrement('netScore')}
          />

          <TouchableOpacity 
            style={[
              styles.mobilityButton, 
              scores.mobility && styles.mobilityActive,
              { backgroundColor: scores.mobility ? Colors[colorScheme].successBackground : Colors[colorScheme].errorBackground }
            ]}
            onPress={toggleMobility}
          >
            <Text style={styles.mobilityText}>
              {leaveStartingLineConfig?.name || "Leave Starting Line"} {scores.mobility ? '✓' : '✗'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.mobilityButton, 
              scores.crossedLine && styles.mobilityActive,
              { backgroundColor: scores.crossedLine ? Colors[colorScheme].successBackground : Colors[colorScheme].errorBackground }
            ]}
            onPress={toggleCrossedLine}
          >
            <Text style={styles.mobilityText}>
              Robot crossed Starting Line {scores.crossedLine ? '✓' : '✗'}
            </Text>
          </TouchableOpacity>

          <View style={[styles.locationContainer, { 
            backgroundColor: Colors[colorScheme].cardBackground,
            marginHorizontal: 0 
          }]}>
            <Text style={styles.locationTitle}>Coral Scored Location</Text>
            <View style={[styles.locationButtons, { backgroundColor: 'transparent' }]}>
              <TouchableOpacity 
                style={[
                  styles.locationButton, 
                  { backgroundColor: scores.coralScoredLocation === 'barge' 
                    ? Colors[colorScheme].successBackground 
                    : Colors[colorScheme].inputBackground }
                ]}
                onPress={() => setScores(prev => ({ ...prev, coralScoredLocation: 'barge' }))}
              >
                <Text style={[
                  styles.locationText,
                  { color: scores.coralScoredLocation === 'barge' ? '#fff' : Colors[colorScheme].text }
                ]}>Barge Side</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.locationButton, 
                  { backgroundColor: scores.coralScoredLocation === 'processor' 
                    ? Colors[colorScheme].successBackground 
                    : Colors[colorScheme].inputBackground }
                ]}
                onPress={() => setScores(prev => ({ ...prev, coralScoredLocation: 'processor' }))}
              >
                <Text style={[
                  styles.locationText,
                  { color: scores.coralScoredLocation === 'processor' ? '#fff' : Colors[colorScheme].text }
                ]}>Processor Side</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.locationButton, 
                  { backgroundColor: scores.coralScoredLocation === 'both' 
                    ? Colors[colorScheme].successBackground 
                    : Colors[colorScheme].inputBackground }
                ]}
                onPress={() => setScores(prev => ({ ...prev, coralScoredLocation: 'both' }))}
              >
                <Text style={[
                  styles.locationText,
                  { color: scores.coralScoredLocation === 'both' ? '#fff' : Colors[colorScheme].text }
                ]}>Both Sides</Text>
              </TouchableOpacity>
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
    paddingBottom: 80,
    backgroundColor: 'transparent',
  },
  mobilityButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  mobilityActive: {},
  mobilityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  button: {
    marginTop: 20,
  },
  locationContainer: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  locationTitle: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  locationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    backgroundColor: 'transparent',
  },
  locationButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 