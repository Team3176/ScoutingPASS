import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from '../../components/Themed';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { FontAwesome } from '@expo/vector-icons';
import { config_data } from './2025/reefscape_config.js';
import { useScoutingData } from '../../context/ScoutingContext';
import { useColorScheme } from 'react-native';

interface CounterProps {
  label: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

<<<<<<< HEAD
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

  // Calculate the vertical distance between hexagon borders
  const getVerticalGap = (scale: number) => scale * Math.sin(Math.PI / 3);

  // Calculate the offset as a percentage of the gap
  const getButtonOffset = (scale: number) => getVerticalGap(scale) * 0.05; // 5% of the gap

  // Calculate the midpoint between hexagon lines
  const getMidpoint = (scale1: number, scale2: number) => {
    const y1 = center - getVerticalGap(scale1);
    const y2 = center - getVerticalGap(scale2);
    return (y1 + y2) / 2;
  };

  // Calculate button sizes and positions to maintain 1px gap
  const buttonSizes = [
    hexRadius * 1.0,  // L1 size
    Math.min(getVerticalGap(hexagonScales[0]) - 2, hexRadius),  // L2 size
    Math.min(getVerticalGap(hexagonScales[1]) - 2, hexRadius),  // L3 size
    Math.min(getVerticalGap(hexagonScales[2]) - 2, hexRadius),  // L4 size
  ];

  // Calculate positions for each ring with buttons between hexagon lines
  const ringPositions = [
    { scale: centerHexRadius, y: center },  // Center (L1)
    { scale: hexagonScales[0], y: getMidpoint(hexagonScales[0], hexagonScales[1]) },  // L2
    { scale: hexagonScales[1], y: getMidpoint(hexagonScales[1], hexagonScales[2]) },  // L3
    { scale: hexagonScales[2], y: getMidpoint(hexagonScales[2], hexagonScales[3]) },  // L4
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
              left: center - (buttonSizes[i] / 2),
              top: pos.y - (buttonSizes[i] / 2),
              width: buttonSizes[i],
              height: buttonSizes[i],
              borderRadius: buttonSizes[i] / 2,
              backgroundColor: flashingLabel === i ? '#666666' : '#444444',
            }
          ]}
          onPress={() => handleLabelPress(i)}
        >
          <Text style={[
            styles.labelText,
            {
              fontSize: buttonSizes[i] * 0.4,
            },
            activePromptLabel === i && { color: '#00FF00' }
          ]}>
            {`L${i + 1}`}
          </Text>
        </TouchableOpacity>
      ))}
=======
const Counter: React.FC<CounterProps> = ({ label, value, onIncrement, onDecrement }) => (
  <View style={styles.counterContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.counterControls}>
      <TouchableOpacity onPress={onDecrement} style={styles.counterButton}>
        <FontAwesome name="minus" size={20} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.counterValue}>{value}</Text>
      <TouchableOpacity onPress={onIncrement} style={styles.counterButton}>
        <FontAwesome name="plus" size={20} color="#fff" />
      </TouchableOpacity>
>>>>>>> parent of c58d7c3 (Mostly fixed)
    </View>
  </View>
);

interface CycleTimerProps {
  label: string;
  isRunning: boolean;
  onToggle: () => void;
  cycles: number[];
  onUndo: () => void;
}

const CycleTimer: React.FC<CycleTimerProps> = ({ label, isRunning, onToggle, cycles, onUndo }) => (
  <View style={styles.timerContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.timerControls}>
      <TouchableOpacity 
        onPress={onToggle} 
        style={[styles.timerButton, isRunning && styles.timerButtonActive]}
      >
        <Text style={styles.timerButtonText}>
          {isRunning ? 'Stop Cycle' : 'Start Cycle'}
        </Text>
      </TouchableOpacity>
      {cycles.length > 0 && (
        <TouchableOpacity onPress={onUndo} style={styles.undoButton}>
          <FontAwesome name="undo" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
    {cycles.length > 0 && (
      <View style={styles.cycleStats}>
        <Text>Cycles: {cycles.length}</Text>
        <Text>Avg Time: {(cycles.reduce((a, b) => a + b, 0) / cycles.length).toFixed(1)}s</Text>
      </View>
    )}
  </View>
);

export default function TeleopScreen() {
  const router = useRouter();
  const configJson = JSON.parse(config_data);
  const teleopConfig = configJson.teleop;
  const { scoutingData, updateScoutingData } = useScoutingData();
  const colorScheme = useColorScheme();

  const [scores, setScores] = useState({
    notePickup: scoutingData.teleopNotePickup,
    algaeProcessor: scoutingData.teleopAlgaeProcessor,
    algaeNet: scoutingData.teleopAlgaeNet,
    scoredFarSide: scoutingData.scoredFarSide || false,
    algaeRemoved: scoutingData.algaeRemoved || false,
    robotDied: scoutingData.robotDied || false,
    cageHang: scoutingData.cageHang || null,
  });

  const [cycleTimer, setCycleTimer] = useState({
    isRunning: false,
    startTime: 0,
    cycles: scoutingData.scoringCycles,
  });

  // Update local state when context changes (e.g. when form is cleared)
  useEffect(() => {
    setScores({
      notePickup: scoutingData.teleopNotePickup,
      algaeProcessor: scoutingData.teleopAlgaeProcessor,
      algaeNet: scoutingData.teleopAlgaeNet,
      scoredFarSide: scoutingData.scoredFarSide || false,
      algaeRemoved: scoutingData.algaeRemoved || false,
      robotDied: scoutingData.robotDied || false,
      cageHang: scoutingData.cageHang || null,
    });
    setCycleTimer(prev => ({
      ...prev,
      cycles: scoutingData.scoringCycles,
    }));
  }, [scoutingData]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cycleTimer.isRunning) {
      interval = setInterval(() => {
        // Update timer display if needed
      }, 100);
    }
    return () => clearInterval(interval);
  }, [cycleTimer.isRunning]);

  const handleIncrement = (key: keyof typeof scores) => {
    if (typeof scores[key] === 'number') {
      setScores(prev => ({
        ...prev,
        [key]: (prev[key] as number) + 1
      }));
    }
  };

  const handleDecrement = (key: keyof typeof scores) => {
    if (typeof scores[key] === 'number' && scores[key] as number > 0) {
      setScores(prev => ({
        ...prev,
        [key]: (prev[key] as number) - 1
      }));
    }
  };

  const toggleCycleTimer = () => {
    if (cycleTimer.isRunning) {
      const cycleTime = (Date.now() - cycleTimer.startTime) / 1000;
      setCycleTimer(prev => ({
        isRunning: false,
        startTime: 0,
        cycles: [...prev.cycles, cycleTime],
      }));
    } else {
      setCycleTimer(prev => ({
        ...prev,
        isRunning: true,
        startTime: Date.now(),
      }));
    }
  };

  const undoCycle = () => {
    setCycleTimer(prev => ({
      ...prev,
      cycles: prev.cycles.slice(0, -1),
    }));
  };

  const handleNext = () => {
    updateScoutingData({
      teleopNotePickup: scores.notePickup,
      teleopAlgaeProcessor: scores.algaeProcessor,
      teleopAlgaeNet: scores.algaeNet,
      scoringCycles: cycleTimer.cycles,
      scoredFarSide: scores.scoredFarSide,
      algaeRemoved: scores.algaeRemoved,
      robotDied: scores.robotDied,
      cageHang: scores.cageHang,
    });
    router.push('/endgame');
  };

  const toggleCheckbox = (key: 'scoredFarSide' | 'algaeRemoved' | 'robotDied') => {
    setScores(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Find specific configurations
  const coralL1Config = teleopConfig.find((field: any) => field.code === 'tc1');
  const coralL2Config = teleopConfig.find((field: any) => field.code === 'tc2');
  const coralL3Config = teleopConfig.find((field: any) => field.code === 'tc3');
  const coralL4Config = teleopConfig.find((field: any) => field.code === 'tc4');
  const processorScoreConfig = teleopConfig.find((field: any) => field.code === 'tps');
  const netScoreConfig = teleopConfig.find((field: any) => field.code === 'tns');

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
          <View style={styles.counterRow}>
            <View style={styles.counterWrapper}>
              <Counter
                label="Note Pickup"
                value={scores.notePickup}
                onIncrement={() => handleIncrement('notePickup')}
                onDecrement={() => handleDecrement('notePickup')}
              />
            </View>
          </View>

          <View style={styles.counterRow}>
            <View style={styles.counterWrapper}>
              <Counter
                label="Algae scored in Processor"
                value={scores.algaeProcessor}
                onIncrement={() => handleIncrement('algaeProcessor')}
                onDecrement={() => handleDecrement('algaeProcessor')}
              />
            </View>
            <View style={styles.counterWrapper}>
              <Counter
                label="Algae scored in Net"
                value={scores.algaeNet}
                onIncrement={() => handleIncrement('algaeNet')}
                onDecrement={() => handleDecrement('algaeNet')}
              />
            </View>
          </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity 
              style={[styles.checkbox, scores.scoredFarSide && styles.checkboxActive]}
              onPress={() => toggleCheckbox('scoredFarSide')}
            >
              <Text style={styles.checkboxText}>
                Scored on far side of Reef? {scores.scoredFarSide ? '✓' : '✗'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.checkbox, scores.algaeRemoved && styles.checkboxActive]}
              onPress={() => toggleCheckbox('algaeRemoved')}
            >
              <Text style={styles.checkboxText}>
                Algae Removed? {scores.algaeRemoved ? '✓' : '✗'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.checkbox, scores.robotDied && styles.checkboxActive]}
              onPress={() => toggleCheckbox('robotDied')}
            >
              <Text style={styles.checkboxText}>
                Robot Died? {scores.robotDied ? '✓' : '✗'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownTitle}>Cage Hang</Text>
            <View style={styles.dropdownButtons}>
              <TouchableOpacity 
                style={[styles.dropdownButton, scores.cageHang === 'deep' && styles.dropdownActive]}
                onPress={() => setScores(prev => ({ ...prev, cageHang: 'deep' }))}
              >
                <Text style={[styles.dropdownText, scores.cageHang === 'deep' && styles.dropdownTextActive]}>
                  Deep Cage
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.dropdownButton, scores.cageHang === 'shallow' && styles.dropdownActive]}
                onPress={() => setScores(prev => ({ ...prev, cageHang: 'shallow' }))}
              >
                <Text style={[styles.dropdownText, scores.cageHang === 'shallow' && styles.dropdownTextActive]}>
                  Shallow Cage
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.dropdownButton, scores.cageHang === 'line' && styles.dropdownActive]}
                onPress={() => setScores(prev => ({ ...prev, cageHang: 'line' }))}
              >
                <Text style={[styles.dropdownText, scores.cageHang === 'line' && styles.dropdownTextActive]}>
                  Line Park
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <CycleTimer
            label="Scoring Cycle"
            isRunning={cycleTimer.isRunning}
            onToggle={toggleCycleTimer}
            cycles={cycleTimer.cycles}
            onUndo={undoCycle}
          />

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
    gap: 10,
    paddingBottom: 100,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  counterWrapper: {
    flex: 1,
  },
  counterContainer: {
    backgroundColor: '#AF8D8D',
    padding: 10,
    borderRadius: 10,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  counterButton: {
    backgroundColor: '#2196F3',
    width: 35,
    height: 35,
    borderRadius: 17.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValue: {
    fontSize: 20,
    fontWeight: 'bold',
    minWidth: 35,
    textAlign: 'center',
    color: '#F8F8F9',
  },
  timerContainer: {
    backgroundColor: '#25A26C',
    padding: 15,
    borderRadius: 10,
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  timerButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    minWidth: 120,
    alignItems: 'center',
  },
  timerButtonActive: {
    backgroundColor: '#f44336',
  },
  timerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  undoButton: {
    backgroundColor: '#757575',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleStats: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    marginTop: 20,
  },
  checkboxContainer: {
    gap: 10,
  },
  checkbox: {
    backgroundColor: '#FF0D0D',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#4CAF50',
  },
  checkboxText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  dropdownContainer: {
    backgroundColor: '#413838',
    padding: 15,
    borderRadius: 10,
  },
  dropdownTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#FEFEFE',
    textAlign: 'center',
  },
  dropdownButtons: {
    flexDirection: 'column',
    gap: 8,
  },
  dropdownButton: {
    backgroundColor: '#2F2F2F',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dropdownActive: {
    backgroundColor: '#2196F3',
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FEFEFE',
  },
  dropdownTextActive: {
    color: '#FFFFFF',
  },
}); 