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
    speakerScored: scoutingData.teleopSpeakerScored,
    ampScored: scoutingData.teleopAmpScored,
    notePickup: scoutingData.teleopNotePickup,
    coralL1: scoutingData.teleopCoralL1,
    coralL2: scoutingData.teleopCoralL2,
    coralL3: scoutingData.teleopCoralL3,
    coralL4: scoutingData.teleopCoralL4,
    processorScore: scoutingData.teleopProcessorScore,
    netScore: scoutingData.teleopNetScore,
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
      speakerScored: scoutingData.teleopSpeakerScored,
      ampScored: scoutingData.teleopAmpScored,
      notePickup: scoutingData.teleopNotePickup,
      coralL1: scoutingData.teleopCoralL1,
      coralL2: scoutingData.teleopCoralL2,
      coralL3: scoutingData.teleopCoralL3,
      coralL4: scoutingData.teleopCoralL4,
      processorScore: scoutingData.teleopProcessorScore,
      netScore: scoutingData.teleopNetScore,
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
      teleopSpeakerScored: scores.speakerScored,
      teleopAmpScored: scores.ampScored,
      teleopNotePickup: scores.notePickup,
      scoringCycles: cycleTimer.cycles,
      teleopCoralL1: scores.coralL1,
      teleopCoralL2: scores.coralL2,
      teleopCoralL3: scores.coralL3,
      teleopCoralL4: scores.coralL4,
      teleopProcessorScore: scores.processorScore,
      teleopNetScore: scores.netScore,
      teleopAlgaeProcessor: scores.algaeProcessor,
      teleopAlgaeNet: scores.algaeNet,
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
                label={coralL1Config?.name || "Coral L1"}
                value={scores.coralL1}
                onIncrement={() => handleIncrement('coralL1')}
                onDecrement={() => handleDecrement('coralL1')}
              />
            </View>
            <View style={styles.counterWrapper}>
              <Counter
                label={coralL2Config?.name || "Coral L2"}
                value={scores.coralL2}
                onIncrement={() => handleIncrement('coralL2')}
                onDecrement={() => handleDecrement('coralL2')}
              />
            </View>
          </View>

          <View style={styles.counterRow}>
            <View style={styles.counterWrapper}>
              <Counter
                label={coralL3Config?.name || "Coral L3"}
                value={scores.coralL3}
                onIncrement={() => handleIncrement('coralL3')}
                onDecrement={() => handleDecrement('coralL3')}
              />
            </View>
            <View style={styles.counterWrapper}>
              <Counter
                label={coralL4Config?.name || "Coral L4"}
                value={scores.coralL4}
                onIncrement={() => handleIncrement('coralL4')}
                onDecrement={() => handleDecrement('coralL4')}
              />
            </View>
          </View>

          <View style={styles.counterRow}>
            <View style={styles.counterWrapper}>
              <Counter
                label={processorScoreConfig?.name || "Processor Score"}
                value={scores.processorScore}
                onIncrement={() => handleIncrement('processorScore')}
                onDecrement={() => handleDecrement('processorScore')}
              />
            </View>
            <View style={styles.counterWrapper}>
              <Counter
                label={netScoreConfig?.name || "Net Score"}
                value={scores.netScore}
                onIncrement={() => handleIncrement('netScore')}
                onDecrement={() => handleDecrement('netScore')}
              />
            </View>
          </View>

          <View style={styles.counterRow}>
            <View style={styles.counterWrapper}>
              <Counter
                label="Speaker Scored"
                value={scores.speakerScored}
                onIncrement={() => handleIncrement('speakerScored')}
                onDecrement={() => handleDecrement('speakerScored')}
              />
            </View>
            <View style={styles.counterWrapper}>
              <Counter
                label="Amp Scored"
                value={scores.ampScored}
                onIncrement={() => handleIncrement('ampScored')}
                onDecrement={() => handleDecrement('ampScored')}
              />
            </View>
          </View>

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