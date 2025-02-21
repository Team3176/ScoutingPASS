import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Image, Dimensions, View as RNView, useColorScheme } from 'react-native';
import { Text, View } from '../../components/Themed';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import Colors from '../../constants/Colors';
import { config_data } from './2025/reefscape_config.js';
import { useScoutingData } from '../../context/ScoutingContext';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';

const HexagonField = React.memo(() => {
  const size = Dimensions.get('window').width - 40;
  const center = size / 2;
  const hexRadius = size / 12;
  const centerHexRadius = hexRadius * 0.4;
  const [selectedRings, setSelectedRings] = useState<Set<number>>(new Set());
  const [flashingRing, setFlashingRing] = useState<number | null>(null);

  // Generate angles for the six corners
  const cornerAngles = Array.from({ length: 6 }, (_, i) => (i * 2 * Math.PI) / 6);

  // Calculate scales for each hexagon
  const hexagonScales = [1.8, 3.0, 4.2, 5.4].map(scale => scale * hexRadius);

  // Calculate positions for each ring
  const ringPositions = [
    { scale: centerHexRadius, y: 0 },  // Center (L1)
    { scale: hexagonScales[0], y: hexagonScales[0] / 4 },  // L2
    { scale: hexagonScales[1], y: hexagonScales[1] / 4 },  // L3
    { scale: hexagonScales[2], y: (hexagonScales[2] / 4) - 60 },  // L4 (moved up 60px)
  ];

  const handlePress = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const relativeX = locationX - center;
    const relativeY = locationY - center;
    const distance = Math.sqrt(relativeX * relativeX + relativeY * relativeY);

    // Find which hexagon was clicked
    let hexIndex = -1;
    if (distance <= centerHexRadius) {
      hexIndex = 0;
    } else {
      for (let i = hexagonScales.length - 1; i >= 0; i--) {
        if (distance <= hexagonScales[i]) {
          hexIndex = i + 1;
          break;
        }
      }
    }

    if (hexIndex !== -1) {
      // Flash the entire ring
      setFlashingRing(hexIndex);
      setTimeout(() => setFlashingRing(null), 200);

      setSelectedRings(prev => {
        const newSet = new Set(prev);
        if (newSet.has(hexIndex)) {
          newSet.delete(hexIndex);
        } else {
          newSet.add(hexIndex);
        }
        return newSet;
      });
    }
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
        fill={flashingRing === hexIndex ? "#00FF00" : (selectedRings.has(hexIndex) ? "#00FF00" : "none")}
        stroke={hexIndex === 0 ? "#000" : "#666"}
        strokeWidth={hexIndex === 0 ? "2" : "1"}
      />
    );
  };

  return (
    <Svg width={size} height={size}>
      {/* Center Hexagon */}
      {renderHexagon(centerHexRadius, 0)}
      
      {/* Outer Hexagons */}
      {hexagonScales.map((scale, index) => renderHexagon(scale, index + 1))}

      {/* Labels */}
      {ringPositions.map((ring, i) => (
        <SvgText
          key={`label-${i}`}
          x={center}
          y={center + ring.y}
          fill="#FFF"
          fontSize="18"
          fontWeight="bold"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {`L${i + 1}`}
        </SvgText>
      ))}

      {/* Clickable overlay */}
      <Path
        d={`M 0 0 H ${size} V ${size} H 0 Z`}
        fill="transparent"
        onPress={handlePress}
      />
    </Svg>
  );
});

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
    mobility: scoutingData.mobility,
    crossedLine: scoutingData.crossedLine || false,
    coralScoredLocation: scoutingData.coralScoredLocation || null,
    scoringPositions: scoutingData.autonScoringPositions || [],
    floorPickup: false,
    humanFeed: false,
    processor: false,
    barge: false,
  });

  useEffect(() => {
    setScores({
      mobility: scoutingData.mobility,
      crossedLine: scoutingData.crossedLine || false,
      coralScoredLocation: scoutingData.coralScoredLocation || null,
      scoringPositions: scoutingData.autonScoringPositions || [],
      floorPickup: false,
      humanFeed: false,
      processor: false,
      barge: false,
    });
  }, [scoutingData]);

  const handleNext = () => {
    updateScoutingData({
      mobility: scores.mobility,
      crossedLine: scores.crossedLine,
      coralScoredLocation: scores.coralScoredLocation,
      autonScoringPositions: scores.scoringPositions,
    });
    router.push('/teleop');
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
        ]}>{configJson.page_title} - Autonomous</Text>
        
        <View style={styles.content}>
          <View style={styles.fieldContainer}>
            <View style={styles.playerSection}>
              <Text style={styles.playerLabel}>Auton Scoring</Text>
            </View>
            
            <View style={styles.fieldContent}>
              <View style={styles.leftSection} />
              <View style={styles.centerSection}>
                <HexagonField />
              </View>
              <View style={styles.rightSection} />
            </View>
          </View>

          <View style={styles.buttonsContainer}>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.pickupButton, scores.floorPickup && styles.pickupButtonActive]} 
                onPress={() => setScores(prev => ({ ...prev, floorPickup: !prev.floorPickup }))}
              >
                <Text style={styles.pickupButtonText}>Floor Pickup</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.pickupButton, scores.humanFeed && styles.pickupButtonActive]}
                onPress={() => setScores(prev => ({ ...prev, humanFeed: !prev.humanFeed }))}
              >
                <Text style={styles.pickupButtonText}>Human Feed</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.pickupButton, scores.processor && styles.pickupButtonActive]} 
                onPress={() => setScores(prev => ({ ...prev, processor: !prev.processor }))}
              >
                <Text style={styles.pickupButtonText}>Processor</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.pickupButton, scores.barge && styles.pickupButtonActive]}
                onPress={() => setScores(prev => ({ ...prev, barge: !prev.barge }))}
              >
                <Text style={styles.pickupButtonText}>Barge</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[
                styles.mobilityButton, 
                scores.mobility && styles.mobilityActive,
                { backgroundColor: scores.mobility ? Colors[colorScheme].successBackground : Colors[colorScheme].errorBackground }
              ]}
              onPress={() => setScores(prev => ({ ...prev, mobility: !prev.mobility }))}
            >
              <Text style={styles.mobilityText}>
                Leave Starting Line {scores.mobility ? '✓' : '✗'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.mobilityButton, 
                scores.crossedLine && styles.mobilityActive,
                { backgroundColor: scores.crossedLine ? Colors[colorScheme].successBackground : Colors[colorScheme].errorBackground }
              ]}
              onPress={() => setScores(prev => ({ ...prev, crossedLine: !prev.crossedLine }))}
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
    aspectRatio: 1.0,
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
    height: 40,
    backgroundColor: '#00F',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginBottom: 5,
    borderRadius: 5,
  },
  playerLabel: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
  },
  mobilityButton: {
    backgroundColor: '#FF0000',
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
  },
  mobilityActive: {
    backgroundColor: '#00FF00',
  },
  mobilityText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
  },
  button: {
    marginTop: 15,
  },
  locationContainer: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'transparent',
    marginTop: 5,
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
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    fontWeight: 'bold',
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
  },
} as const); 