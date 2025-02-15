import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Image, Dimensions, View as RNView } from 'react-native';
import { Text, View } from '../../components/Themed';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Counter } from '../../components/ui/Counter';
import { useColorScheme } from 'react-native';
import Colors from '../../constants/Colors';
import { config_data } from './2025/reefscape_config.js';
import { useScoutingData } from '../../context/ScoutingContext';

const FieldImage = React.memo(() => (
  <Image
    source={require('./2025/field_image.png')}
    style={styles.fieldImage}
    resizeMode="contain"
  />
));

const Dots = React.memo(({ points }: { points: { x: number; y: number }[] }) => (
  <>
    {points.map((point, index) => (
      <RNView
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
  </>
));

const ClickableFieldOverlay = React.memo(({ onPress }: { onPress: (event: any) => void }) => (
  <TouchableOpacity 
    onPress={onPress}
    style={StyleSheet.absoluteFill}
  />
));

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
    scoringPositions: scoutingData.autonScoringPositions || [],
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
      scoringPositions: scoutingData.autonScoringPositions || [],
    });
  }, [scoutingData]);

  const handleImageClick = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const imageWidth = Dimensions.get('window').width - 40;
    const imageHeight = imageWidth * 0.6;

    // Only set point if click is within image bounds
    if (locationX >= 0 && locationX <= imageWidth && locationY >= 0 && locationY <= imageHeight) {
      // Check if point already exists at this location (with some tolerance)
      const tolerance = 10;
      const existingPointIndex = scores.scoringPositions.findIndex(point => 
        Math.abs(point.x - locationX) < tolerance && Math.abs(point.y - locationY) < tolerance
      );

      if (existingPointIndex !== -1) {
        // Remove the point if it exists
        setScores(prev => ({
          ...prev,
          scoringPositions: prev.scoringPositions.filter((_, index) => index !== existingPointIndex)
        }));
      } else {
        // Add new point
        setScores(prev => ({
          ...prev,
          scoringPositions: [...prev.scoringPositions, { x: locationX, y: locationY }]
        }));
      }
    }
  };

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
      autonScoringPositions: scores.scoringPositions,
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
  const scoringPositionsConfig = autonConfig.find((field: any) => field.code === 'asp');

  return (
    <View style={[
      styles.container,
      { backgroundColor: colorScheme === 'light' ? '#fff' : '#000' }
    ]}>
      <ScrollView>
        <Text style={[
          styles.title,
          { color: colorScheme === 'light' ? '#000' : '#fff' }
        ]}>{configJson.page_title} - Autonomous</Text>
        
        <View style={styles.content}>
          <View style={styles.fieldImageContainer}>
            <Text style={styles.imageLabel}>{scoringPositionsConfig?.name || "Scoring Positions"}</Text>
            <View style={styles.imageWrapper}>
              <RNView style={styles.imageContainer}>
                <FieldImage />
                <Dots points={scores.scoringPositions} />
                <ClickableFieldOverlay onPress={handleImageClick} />
              </RNView>
            </View>
          </View>

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
  fieldImageContainer: {
    marginVertical: 10,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    position: 'relative',
    width: Dimensions.get('window').width - 40,
    height: (Dimensions.get('window').width - 40) * 0.6,
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
    zIndex: 1,
  },
}); 