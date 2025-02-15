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
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';

const HexagonField = React.memo(() => {
  const size = Dimensions.get('window').width - 140;
  const center = size / 2;
  const hexRadius = size / 12;
  const centerHexRadius = hexRadius * 0.4;
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());

  // Generate angles for the six corners
  const cornerAngles = Array.from({ length: 6 }, (_, i) => (i * 2 * Math.PI) / 6);

  // Calculate scales for each hexagon (matching the grid hexagons exactly)
  const hexagonScales = [1.4, 2.5, 3.5, 4.5].map(scale => scale * hexRadius);

  // Calculate label positions centered in each piece by finding midpoints
  const allScales = [centerHexRadius, ...hexagonScales];
  const labelPositions = allScales.slice(0, -1).map((currentScale, index) => {
    const nextScale = allScales[index + 1];
    const midpoint = (currentScale + nextScale) / 2;
    // Add offset for L2, L3, L4 to move them down, with L2 slightly higher
    let offset = 0;
    if (index === 1) offset = 12;      // L2 stays higher
    else if (index === 2) offset = 22;  // L3 keeps same offset
    else if (index === 3) offset = 26;  // L4 moves down 2 more pixels
    return {
      x: center,
      y: center - midpoint + offset,
      text: `L${index + 1}`
    };
  });

  // Helper function to get section ID
  const getSectionId = (hexIndex: number, sectionIndex: number) => `${hexIndex}-${sectionIndex}`;

  const handlePress = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const relativeX = locationX - center;
    const relativeY = locationY - center;
    const distance = Math.sqrt(relativeX * relativeX + relativeY * relativeY);

    // Calculate angle in radians
    let angle = Math.atan2(relativeY, relativeX);
    if (angle < 0) angle += 2 * Math.PI;  // Convert to 0-2π range

    // Determine which section was clicked (0-5)
    const sectionIndex = Math.floor((angle / (2 * Math.PI) * 6 + 0.5) % 6);

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
      const sectionId = getSectionId(hexIndex, sectionIndex);
      setSelectedSections(prev => {
        const newSet = new Set(prev);
        if (newSet.has(sectionId)) {
          newSet.delete(sectionId);
        } else {
          newSet.add(sectionId);
        }
        return newSet;
      });
    }
  };

  const renderHexagonSection = (scale: number, hexIndex: number) => {
    return cornerAngles.map((startAngle, sectionIndex) => {
      const endAngle = startAngle + (2 * Math.PI) / 6;
      const sectionId = getSectionId(hexIndex, sectionIndex);
      
      const startX = center + scale * Math.cos(startAngle);
      const startY = center + scale * Math.sin(startAngle);
      const endX = center + scale * Math.cos(endAngle);
      const endY = center + scale * Math.sin(endAngle);
      
      return (
        <Path
          key={sectionId}
          d={`
            M ${center} ${center}
            L ${startX} ${startY}
            L ${endX} ${endY}
            Z
          `}
          fill={selectedSections.has(sectionId) ? "#00FF00" : (hexIndex === 0 ? "#0000AA" : "none")}
          stroke={hexIndex === 0 ? "#000" : "#666"}
          strokeWidth={hexIndex === 0 ? "2" : "1"}
        />
      );
    });
  };

  return (
    <Svg width={size} height={size}>
      {/* Center Hexagon Sections */}
      {renderHexagonSection(centerHexRadius, 0)}
      
      {/* Outer Hexagon Sections */}
      {hexagonScales.map((scale, index) => renderHexagonSection(scale, index + 1))}

      {/* Labels */}
      {labelPositions.map((label, i) => (
        <SvgText
          key={`label-${i}`}
          x={label.x}
          y={label.y}
          fill="#FFF"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {label.text}
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
          <View style={styles.fieldContainer}>
            <View style={styles.playerSection}>
              <Text style={styles.playerLabel}>Human Player 1</Text>
            </View>
            
            <View style={styles.fieldContent}>
              <View style={styles.leftSection} />
              
              <View style={styles.centerSection}>
                <HexagonField />
              </View>
              
              <View style={styles.rightSection}>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreLabel}>Score in Net</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.bottomSection}>
              <View style={styles.playerSection}>
                <Text style={styles.playerLabel}>Human Player 2</Text>
              </View>
              <View style={styles.processorSection}>
                <Text style={styles.processorLabel}>Processor</Text>
              </View>
            </View>

            <View style={styles.resultButtons}>
              <TouchableOpacity 
                style={[styles.resultButton, styles.successButton]}
                onPress={() => setScores(prev => ({ ...prev, success: true, fail: false }))}
              >
                <Text style={styles.resultButtonText}>Success</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.resultButton, styles.failButton]}
                onPress={() => setScores(prev => ({ ...prev, success: false, fail: true }))}
              >
                <Text style={styles.resultButtonText}>Fail</Text>
              </TouchableOpacity>
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
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  content: {
    gap: 10,
    paddingBottom: 40,
    backgroundColor: 'transparent',
  },
  fieldContainer: {
    width: '100%',
    aspectRatio: 0.8,
    backgroundColor: '#333',
    marginVertical: 10,
    padding: 10,
  },
  fieldContent: {
    flex: 1,
    flexDirection: 'row',
  },
  leftSection: {
    width: 60,
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightSection: {
    width: 60,
    justifyContent: 'center',
  },
  playerSection: {
    height: 30,
    backgroundColor: '#00F',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  playerLabel: {
    color: '#FFF',
    fontSize: 12,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  processorSection: {
    height: 30,
    backgroundColor: '#00F',
    justifyContent: 'center',
    paddingHorizontal: 10,
    width: 80,
  },
  processorLabel: {
    color: '#FFF',
    fontSize: 12,
  },
  scoreBox: {
    backgroundColor: '#00F',
    padding: 5,
    width: '100%',
    alignItems: 'center',
  },
  scoreLabel: {
    color: '#FFF',
    fontSize: 10,
    textAlign: 'center',
  },
  resultButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  resultButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '45%',
  },
  successButton: {
    backgroundColor: '#0F0',
  },
  failButton: {
    backgroundColor: '#F00',
  },
  resultButtonText: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mobilityButton: {
    backgroundColor: '#FF0000',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  mobilityActive: {
    backgroundColor: '#00FF00',
  },
  mobilityText: {
    color: '#FFFFFF',
    textAlign: 'center',
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