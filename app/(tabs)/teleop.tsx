import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Image, Dimensions, View as RNView, useColorScheme } from 'react-native';
import { Text, View } from '../../components/Themed';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import Colors from '../../constants/Colors';
import { config_data } from './2025/reefscape_config.js';
import { useScoutingData } from '../../context/ScoutingContext';
import Svg, { Path, Circle, Text as SvgText, G } from 'react-native-svg';

interface HexagonFieldProps {
  onLabelPress: (labelIndex: number) => void;
  selectedLabels: Set<number>;
  activePromptLabel: number | null;
}

const HexagonField: React.FC<HexagonFieldProps> = React.memo(({ onLabelPress, selectedLabels, activePromptLabel }) => {
  const size = Dimensions.get('window').width - 40;
  const center = size / 2;
  const hexRadius = size / 12;
  const centerHexRadius = hexRadius * 0.4;
  const [flashingLabel, setFlashingLabel] = useState<number | null>(null);

  // Generate angles for the six corners
  const cornerAngles = Array.from({ length: 6 }, (_, i) => (i * 2 * Math.PI) / 6);

  // Calculate scales for each hexagon with original spacing
  const hexagonScales = [1.8, 3.0, 4.2, 5.4].map(scale => scale * hexRadius);

  // Calculate positions for each ring with adjusted spacing
  const ringPositions = [
    { scale: centerHexRadius, y: center + 0 },  // Center (L1)
    { scale: hexagonScales[0], y: center + ((hexagonScales[2] / 4) - 83) },  // L2
    { scale: hexagonScales[1], y: center + ((hexagonScales[2] / 4) - 112) },  // L3
    { scale: hexagonScales[2], y: center + ((hexagonScales[2] / 4) - 139) },  // L4
  ];

  const handleLabelPress = (labelIndex: number) => {
    setFlashingLabel(labelIndex);
    setTimeout(() => setFlashingLabel(null), 150);
    onLabelPress(labelIndex);
  };

  const renderHexagon = (scale: number, hexIndex: number) => {
    const points = cornerAngles.map(angle => ({
      x: center + scale * Math.cos(angle),
      y: center + scale * Math.sin(angle)
    }));

    const pathData = points.map((point, i) => 
      `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ') + ' Z';

    return (
      <Path
        key={`hexagon-${hexIndex}`}
        d={pathData}
        fill="none"
        stroke={hexIndex === 0 ? "#000" : "#666"}
        strokeWidth={hexIndex === 0 ? "2" : "1"}
      />
    );
  };

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {renderHexagon(centerHexRadius, 0)}
        {hexagonScales.map((scale, index) => renderHexagon(scale, index + 1))}
      </Svg>

      {ringPositions.map((pos, i) => (
        <TouchableOpacity
          key={`label-${i}`}
          style={[
            styles.labelButton,
            {
              position: 'absolute',
              left: center - 12,
              top: pos.y - 12,
              backgroundColor: flashingLabel === i ? '#666666' : '#444444',
            }
          ]}
          onPress={() => handleLabelPress(i)}
        >
          <Text style={[
            styles.labelText,
            activePromptLabel === i && { color: '#00FF00' }
          ]}>
            {`L${i + 1}`}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

export default function TeleopScreen() {
  const router = useRouter();
  const configJson = JSON.parse(config_data);
  const { scoutingData, updateScoutingData } = useScoutingData();
  const colorScheme = useColorScheme() ?? 'light';

  const [scores, setScores] = useState({
    floorPickup: false,
    humanFeed: false,
    processor: false,
    barge: false,
    penalties: 0,
    playedDefense: false,
    robotDied: false,
  });

  const [selectedLabels, setSelectedLabels] = useState<Set<number>>(new Set());
  const [selectedLabelForPrompt, setSelectedLabelForPrompt] = useState<number | null>(null);
  const [selectedPickupForPrompt, setSelectedPickupForPrompt] = useState<string | null>(null);

  const handleLabelPress = (labelIndex: number) => {
    setSelectedLabelForPrompt(labelIndex);
    setSelectedPickupForPrompt(null);
  };

  const handlePickupPress = (pickupType: string) => {
    setSelectedPickupForPrompt(pickupType);
    setSelectedLabelForPrompt(null);
  };

  const handlePromptResponse = (response: 'success' | 'failure') => {
    if (selectedLabelForPrompt !== null) {
      // Update the corresponding teleopCoralL array
      const value = response === 'success' ? 1 : 0;
      const fieldName = `teleopCoralL${selectedLabelForPrompt + 1}` as keyof typeof scoutingData;
      updateScoutingData({
        ...scoutingData,
        [fieldName]: [...(scoutingData[fieldName] as number[] || []), value]
      });

      if (response === 'success') {
        setSelectedLabels(prev => {
          const newSet = new Set(prev);
          newSet.add(selectedLabelForPrompt);
          return newSet;
        });
      } else {
        setSelectedLabels(prev => {
          const newSet = new Set(prev);
          newSet.delete(selectedLabelForPrompt);
          return newSet;
        });
      }
      setSelectedLabelForPrompt(null);
    } else if (selectedPickupForPrompt !== null) {
      // Update the corresponding pickup array
      const value = response === 'success' ? 1 : 0;
      let fieldName: keyof typeof scoutingData;
      
      switch (selectedPickupForPrompt) {
        case 'Floor Pickup':
          fieldName = 'teleopProcessorScore';
          break;
        case 'Human Feed':
          fieldName = 'teleopNetScore';
          break;
        case 'Processor':
          fieldName = 'teleopAlgaeProcessor';
          break;
        case 'Barge':
          fieldName = 'teleopAlgaeNet';
          break;
        default:
          return;
      }

      updateScoutingData({
        ...scoutingData,
        [fieldName]: [...(scoutingData[fieldName] as number[] || []), value]
      });
      
      setSelectedPickupForPrompt(null);
    }
  };

  const handleNext = () => {
    // Save the current scores to scouting data before navigating
    updateScoutingData({
      robotDied: scores.robotDied,
      defenseRating: scores.penalties
    });
    router.push('/endgame');
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
        ]}>{configJson.page_title} - Teleop</Text>
        
        <View style={styles.content}>
          <View style={styles.fieldContainer}>
            <View style={styles.playerSection}>
              <Text style={styles.playerLabel}>Teleop Scoring</Text>
            </View>
            
            <View style={styles.fieldContent}>
              <View style={styles.leftSection} />
              <View style={styles.centerSection}>
                <HexagonField 
                  onLabelPress={handleLabelPress}
                  selectedLabels={selectedLabels}
                  activePromptLabel={selectedLabelForPrompt}
                />
              </View>
              <View style={styles.rightSection} />
            </View>
          </View>

          {(selectedLabelForPrompt !== null || selectedPickupForPrompt !== null) && (
            <View style={[styles.promptContainer]}>
              <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>
                {selectedLabelForPrompt !== null ? `L${selectedLabelForPrompt + 1}` : selectedPickupForPrompt} Score:
              </Text>
              <View style={{ flexDirection: 'row', gap: 20, backgroundColor: 'transparent' }}>
                <TouchableOpacity 
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: '#4CAF50',
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 0,
                    shadowColor: 'transparent',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0,
                    shadowRadius: 0,
                  }}
                  onPress={() => handlePromptResponse('success')}
                >
                  <Text style={{ color: '#FFF', fontSize: 24, fontWeight: 'bold' }}>✓</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: '#FF0000',
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 0,
                    shadowColor: 'transparent',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0,
                    shadowRadius: 0,
                  }}
                  onPress={() => handlePromptResponse('failure')}
                >
                  <Text style={{ color: '#FFF', fontSize: 24, fontWeight: 'bold' }}>✗</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.buttonsContainer}>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[
                  styles.pickupButton, 
                  selectedPickupForPrompt === 'Floor Pickup' && styles.pickupButtonActive
                ]} 
                onPress={() => handlePickupPress('Floor Pickup')}
              >
                <Text style={styles.pickupButtonText}>Floor Pickup</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.pickupButton, 
                  selectedPickupForPrompt === 'Human Feed' && styles.pickupButtonActive
                ]}
                onPress={() => handlePickupPress('Human Feed')}
              >
                <Text style={styles.pickupButtonText}>Human Feed</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[
                  styles.pickupButton, 
                  selectedPickupForPrompt === 'Processor' && styles.pickupButtonActive
                ]} 
                onPress={() => handlePickupPress('Processor')}
              >
                <Text style={styles.pickupButtonText}>Processor</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.pickupButton, 
                  selectedPickupForPrompt === 'Barge' && styles.pickupButtonActive
                ]}
                onPress={() => handlePickupPress('Barge')}
              >
                <Text style={styles.pickupButtonText}>Barge</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.penaltyContainer}>
              <Text style={styles.penaltyLabel}>Robot Penalties</Text>
              <View style={styles.penaltyControls}>
                <TouchableOpacity 
                  style={styles.penaltyButton}
                  onPress={() => {
                    setScores(prev => {
                      const newPenalties = Math.max(0, prev.penalties - 1);
                      updateScoutingData({ defenseRating: newPenalties });
                      return { ...prev, penalties: newPenalties };
                    });
                  }}
                >
                  <Text style={styles.penaltyButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.penaltyCount}>{scores.penalties}</Text>
                <TouchableOpacity 
                  style={styles.penaltyButton}
                  onPress={() => {
                    setScores(prev => {
                      const newPenalties = prev.penalties + 1;
                      updateScoutingData({ defenseRating: newPenalties });
                      return { ...prev, penalties: newPenalties };
                    });
                  }}
                >
                  <Text style={styles.penaltyButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.checkBox, scores.playedDefense && styles.checkBoxActive]}
              onPress={() => {
                setScores(prev => {
                  const newPlayedDefense = !prev.playedDefense;
                  updateScoutingData({ robotDied: prev.robotDied, playedDefense: newPlayedDefense });
                  return { ...prev, playedDefense: newPlayedDefense };
                });
              }}
            >
              <Text style={styles.checkBoxText}>
                {scores.playedDefense ? 'Robot played defense ✓' : 'Robot didn\'t play defense ✗'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.checkBox, scores.robotDied && styles.checkBoxActive]}
              onPress={() => {
                setScores(prev => {
                  const newRobotDied = !prev.robotDied;
                  updateScoutingData({ robotDied: newRobotDied, playedDefense: prev.playedDefense });
                  return { ...prev, robotDied: newRobotDied };
                });
              }}
            >
              <Text style={styles.checkBoxText}>
                {scores.robotDied ? 'Robot died/e-stopped ✓' : 'Robot did not die/e-stop ✗'}
              </Text>
            </TouchableOpacity>

            <Button
              onPress={handleNext}
              style={styles.button}
              text="Next"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  content: {
    gap: 15,
    paddingBottom: 40,
    backgroundColor: 'transparent',
  },
  fieldContainer: {
    width: '100%',
    aspectRatio: 0.8,
    backgroundColor: '#333',
    marginVertical: 10,
    padding: 10,
    borderRadius: 10,
  },
  fieldContent: {
    flex: 1,
    flexDirection: 'row',
    marginVertical: 5,
  },
  leftSection: {
    width: 5,
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightSection: {
    width: 5,
  },
  playerSection: {
    height: 50,
    backgroundColor: '#00F',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  playerLabel: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 15,
  },
  pickupButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#333',
    alignItems: 'center',
  },
  pickupButtonActive: {
    backgroundColor: '#00F',
  },
  pickupButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    marginTop: 10,
    gap: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  labelButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#444444',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  promptContainer: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  penaltyContainer: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  penaltyLabel: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  penaltyControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    backgroundColor: 'transparent',
  },
  penaltyButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  penaltyButtonText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  penaltyCount: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
  },
  checkBox: {
    backgroundColor: '#FF0000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  checkBoxActive: {
    backgroundColor: '#4CAF50',
  },
  checkBoxText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 