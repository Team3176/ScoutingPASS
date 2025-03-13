import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  View as RNView,
  useColorScheme,
  Alert,
  TextInput,
} from "react-native";
import { Text, View } from "../../components/Themed";
import { ScrollView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { Button } from "../../components/ui/Button";
import { Colors } from "../../constants/Colors";
import { config_data } from "../../constants/ReefscapeConfig";
import { useScoutingData, ScoutingData } from "../../context/ScoutingContext";
import Svg, { Path, Circle, Text as SvgText, G } from "react-native-svg";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  content: {
    gap: 15,
    paddingBottom: 40,
    backgroundColor: "transparent",
  },
  labelButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#444444',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  labelButtonFlashing: {
    backgroundColor: '#666666',
  },
  labelButtonActive: {
    backgroundColor: '#00F',
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  lButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 10,
    marginBottom: 10,
  },
  promptContainer: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    elevation: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  promptText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  promptButtons: {
    flexDirection: "row",
    gap: 20,
    backgroundColor: "transparent",
  },
  promptButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  successButton: {
    backgroundColor: "#4CAF50",
  },
  failureButton: {
    backgroundColor: "#FF0000",
  },
  promptButtonText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  pickupButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#333",
    alignItems: "center",
  },
  pickupButtonActive: {
    backgroundColor: "#00F",
  },
  pickupButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonsContainer: {
    marginTop: 10,
    gap: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  counterContainer: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  counterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "transparent",
  },
  counterLabel: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "transparent",
  },
  counterControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "transparent",
  },
  counterValue: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "transparent",
  },
  editContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "transparent",
  },
  editInput: {
    backgroundColor: "#444",
    color: "#FFF",
    padding: 8,
    borderRadius: 4,
    width: 100,
    fontSize: 16,
    textAlign: "center",
  },
  editButton: {
    backgroundColor: "#4CAF50",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  editButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: '#444',
    marginVertical: 10,
  },
  undoButton: {
    backgroundColor: '#444',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 5,
  },
  undoButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 15,
  },
  toggleButton: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
  },
  toggleButtonActive: {
    backgroundColor: "#00F",
  },
  toggleButtonText: {
    color: "#FFF",
    textAlign: "center",
    fontSize: 16,
  },
  penaltyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  penaltyControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "transparent",
  },
  penaltyButton: {
    backgroundColor: "#444",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  penaltyValue: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 10,
  },
} as const);

interface LButtonsProps {
  onLabelPress: (labelIndex: number) => void;
  selectedLabels: Set<number>;
  activePromptLabel: number | null;
}

const LButtons: React.FC<LButtonsProps> = React.memo(
  ({ onLabelPress, selectedLabels, activePromptLabel }) => {
    const [flashingLabel, setFlashingLabel] = useState<number | null>(null);

    const handleLabelPress = (labelIndex: number) => {
      setFlashingLabel(labelIndex);
      setTimeout(() => setFlashingLabel(null), 150);
      onLabelPress(labelIndex);
    };

    return (
      <View style={styles.lButtonsContainer}>
        {[0, 1, 2, 3].map((i) => (
          <TouchableOpacity
            key={`label-${i}`}
            style={[
              styles.labelButton,
              flashingLabel === i && styles.labelButtonFlashing,
              activePromptLabel === i && styles.labelButtonActive,
            ]}
            onPress={() => handleLabelPress(i)}
          >
            <Text style={styles.labelText}>{`L${i + 1}`}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }
);

export default function TeleopScreen() {
  const router = useRouter();
  const configJson = JSON.parse(config_data);
  const { scoutingData, updateScoutingData } = useScoutingData();
  const colorScheme = useColorScheme() ?? "light";

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
  const [actionHistory, setActionHistory] = useState<{fieldName: keyof typeof scoutingData, timestamp: number}[]>([]);
  const [isEditingProcessor, setIsEditingProcessor] = useState(false);
  const [isEditingNet, setIsEditingNet] = useState(false);
  const [isEditingL1, setIsEditingL1] = useState(false);
  const [isEditingL2, setIsEditingL2] = useState(false);
  const [isEditingL3, setIsEditingL3] = useState(false);
  const [isEditingL4, setIsEditingL4] = useState(false);
  const [processorInput, setProcessorInput] = useState("");
  const [netInput, setNetInput] = useState("");
  const [l1Input, setL1Input] = useState("");
  const [l2Input, setL2Input] = useState("");
  const [l3Input, setL3Input] = useState("");
  const [l4Input, setL4Input] = useState("");
  const [isEditingAlgaeProcessor, setIsEditingAlgaeProcessor] = useState(false);
  const [isEditingAlgaeBarge, setIsEditingAlgaeBarge] = useState(false);
  const [algaeProcessorInput, setAlgaeProcessorInput] = useState("");
  const [algaeBargeInput, setAlgaeBargeInput] = useState("");

  // Add effect to update scouting data when scores change
  useEffect(() => {
    updateScoutingData({
      defenseRating: scores.penalties,
      playedDefense: scores.playedDefense,
      robotDied: scores.robotDied
    });
  }, [scores.penalties, scores.playedDefense, scores.robotDied]);

  const handleLabelPress = (labelIndex: number) => {
    setSelectedLabelForPrompt(labelIndex);
    setSelectedPickupForPrompt(null);
  };

  const handlePickupPress = (pickupType: string) => {
    setSelectedPickupForPrompt(pickupType);
    setSelectedLabelForPrompt(null);
  };

  const handleUndo = () => {
    if (actionHistory.length === 0) return;
    
    const lastAction = actionHistory[actionHistory.length - 1];
    const currentArray = scoutingData[lastAction.fieldName] as number[];
    if (!currentArray || currentArray.length === 0) return;
    
    const newArray = currentArray.slice(0, -1);
    
    updateScoutingData({
      ...scoutingData,
      [lastAction.fieldName]: newArray
    });
    
    setActionHistory(prev => prev.slice(0, -1));
  };

  const handlePromptResponse = (success: boolean) => {
    if (selectedLabelForPrompt === null && selectedPickupForPrompt === null)
      return;

    const value = success ? 1 : 0;
    const newData: Partial<ScoutingData> = {};

    if (selectedLabelForPrompt !== null) {
      const labelId = `L${selectedLabelForPrompt + 1}`;
      switch (labelId) {
        case "L1":
          newData.teleopCoralL1 = [...scoutingData.teleopCoralL1, value];
          break;
        case "L2":
          newData.teleopCoralL2 = [...scoutingData.teleopCoralL2, value];
          break;
        case "L3":
          newData.teleopCoralL3 = [...scoutingData.teleopCoralL3, value];
          break;
        case "L4":
          newData.teleopCoralL4 = [...scoutingData.teleopCoralL4, value];
          break;
      }
    } else if (selectedPickupForPrompt) {
      switch (selectedPickupForPrompt) {
        case "Algae Removal":
          newData.teleopProcessorScore = [...scoutingData.teleopProcessorScore, value];
          break;
        case "Processor":
          newData.teleopAlgaeProcessor = [...scoutingData.teleopAlgaeProcessor, value];
          break;
        case "Net":
          newData.teleopAlgaeNet = [...scoutingData.teleopAlgaeNet, value];
          break;
      }
    }

    updateScoutingData(newData);
    setSelectedLabelForPrompt(null);
    setSelectedPickupForPrompt(null);
  };

  const handleManualScoreUpdate = (
    type: "processor" | "net" | "l1" | "l2" | "l3" | "l4" | "algaeProcessor" | "algaeBarge",
    input: string
  ) => {
    const [success, total] = input.split("/").map(n => parseInt(n.trim()));
    if (isNaN(success) || isNaN(total) || success > total || success < 0 || total < 0) {
      return;
    }

    const newArray = Array(total).fill(0);
    for (let i = 0; i < success; i++) {
      newArray[i] = 1;
    }

    let fieldName: keyof typeof scoutingData;
    switch (type) {
      case "processor":
        fieldName = "teleopProcessorScore";
        break;
      case "net":
        fieldName = "teleopNetScore";
        break;
      case "l1":
        fieldName = "teleopCoralL1";
        break;
      case "l2":
        fieldName = "teleopCoralL2";
        break;
      case "l3":
        fieldName = "teleopCoralL3";
        break;
      case "l4":
        fieldName = "teleopCoralL4";
        break;
      case "algaeProcessor":
        fieldName = "teleopAlgaeProcessor";
        break;
      case "algaeBarge":
        fieldName = "teleopAlgaeNet";
        break;
    }

    updateScoutingData({
      ...scoutingData,
      [fieldName]: newArray
    });

    switch (type) {
      case "processor":
        setIsEditingProcessor(false);
        setProcessorInput("");
        break;
      case "net":
        setIsEditingNet(false);
        setNetInput("");
        break;
      case "l1":
        setIsEditingL1(false);
        setL1Input("");
        break;
      case "l2":
        setIsEditingL2(false);
        setL2Input("");
        break;
      case "l3":
        setIsEditingL3(false);
        setL3Input("");
        break;
      case "l4":
        setIsEditingL4(false);
        setL4Input("");
        break;
      case "algaeProcessor":
        setIsEditingAlgaeProcessor(false);
        setAlgaeProcessorInput("");
        break;
      case "algaeBarge":
        setIsEditingAlgaeBarge(false);
        setAlgaeBargeInput("");
        break;
    }
  };

  const handleNext = () => {
    router.push("/endgame");
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colorScheme === "light" ? "#fff" : "#000" },
      ]}
    >
      <ScrollView>
        <Text
          style={[
            styles.title,
            { color: colorScheme === "light" ? "#000" : "#fff" },
          ]}
        >
          {configJson.page_title} - Teleop
        </Text>

        <View style={styles.content}>
          <LButtons
            onLabelPress={handleLabelPress}
            selectedLabels={selectedLabels}
            activePromptLabel={selectedLabelForPrompt}
          />

          {(selectedLabelForPrompt !== null || selectedPickupForPrompt !== null) && (
            <View style={styles.promptContainer}>
              <Text style={styles.promptText}>
                {selectedLabelForPrompt !== null
                  ? `L${selectedLabelForPrompt + 1}`
                  : selectedPickupForPrompt}{" "}
                Score:
              </Text>
              <View style={styles.promptButtons}>
                <TouchableOpacity
                  style={[styles.promptButton, styles.successButton]}
                  onPress={() => handlePromptResponse(true)}
                >
                  <Text style={styles.promptButtonText}>✓</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.promptButton, styles.failureButton]}
                  onPress={() => handlePromptResponse(false)}
                >
                  <Text style={styles.promptButtonText}>✗</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.buttonsContainer}>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.pickupButton,
                  selectedPickupForPrompt === "Algae Removal" &&
                    styles.pickupButtonActive,
                ]}
                onPress={() => handlePickupPress("Algae Removal")}
              >
                <Text style={styles.pickupButtonText}>Algae Removal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.pickupButton,
                  selectedPickupForPrompt === "Processor" &&
                    styles.pickupButtonActive,
                ]}
                onPress={() => handlePickupPress("Processor")}
              >
                <Text style={styles.pickupButtonText}>Processor</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.pickupButton,
                  selectedPickupForPrompt === "Net" &&
                    styles.pickupButtonActive,
                ]}
                onPress={() => handlePickupPress("Net")}
              >
                <Text style={styles.pickupButtonText}>Net</Text>
              </TouchableOpacity>
            </View>

            {/* Counter Display */}
            <View style={styles.counterContainer}>
              {/* Undo Button */}
              <TouchableOpacity
                style={styles.undoButton}
                onPress={handleUndo}
              >
                <Text style={styles.undoButtonText}>↩ Undo Last Score</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* L Button Scores */}
              <View style={styles.counterRow}>
                <Text style={styles.counterLabel}>L1 Score:</Text>
                <View style={styles.counterControls}>
                  {isEditingL1 ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        style={styles.editInput}
                        value={l1Input}
                        onChangeText={setL1Input}
                        placeholder="success/total"
                        placeholderTextColor="#999"
                        keyboardType="numbers-and-punctuation"
                        autoFocus
                      />
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleManualScoreUpdate("l1", l1Input)}
                      >
                        <Text style={styles.editButtonText}>✓</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.editButton, { backgroundColor: "#FF0000" }]}
                        onPress={() => {
                          setIsEditingL1(false);
                          setL1Input("");
                        }}
                      >
                        <Text style={styles.editButtonText}>✗</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => setIsEditingL1(true)}>
                      <Text style={styles.counterValue}>
                        {scoutingData.teleopCoralL1.filter(x => x === 1).length} / {scoutingData.teleopCoralL1.length}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.counterRow}>
                <Text style={styles.counterLabel}>L2 Score:</Text>
                <View style={styles.counterControls}>
                  {isEditingL2 ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        style={styles.editInput}
                        value={l2Input}
                        onChangeText={setL2Input}
                        placeholder="success/total"
                        placeholderTextColor="#999"
                        keyboardType="numbers-and-punctuation"
                        autoFocus
                      />
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleManualScoreUpdate("l2", l2Input)}
                      >
                        <Text style={styles.editButtonText}>✓</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.editButton, { backgroundColor: "#FF0000" }]}
                        onPress={() => {
                          setIsEditingL2(false);
                          setL2Input("");
                        }}
                      >
                        <Text style={styles.editButtonText}>✗</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => setIsEditingL2(true)}>
                      <Text style={styles.counterValue}>
                        {scoutingData.teleopCoralL2.filter(x => x === 1).length} / {scoutingData.teleopCoralL2.length}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.counterRow}>
                <Text style={styles.counterLabel}>L3 Score:</Text>
                <View style={styles.counterControls}>
                  {isEditingL3 ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        style={styles.editInput}
                        value={l3Input}
                        onChangeText={setL3Input}
                        placeholder="success/total"
                        placeholderTextColor="#999"
                        keyboardType="numbers-and-punctuation"
                        autoFocus
                      />
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleManualScoreUpdate("l3", l3Input)}
                      >
                        <Text style={styles.editButtonText}>✓</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.editButton, { backgroundColor: "#FF0000" }]}
                        onPress={() => {
                          setIsEditingL3(false);
                          setL3Input("");
                        }}
                      >
                        <Text style={styles.editButtonText}>✗</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => setIsEditingL3(true)}>
                      <Text style={styles.counterValue}>
                        {scoutingData.teleopCoralL3.filter(x => x === 1).length} / {scoutingData.teleopCoralL3.length}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.counterRow}>
                <Text style={styles.counterLabel}>L4 Score:</Text>
                <View style={styles.counterControls}>
                  {isEditingL4 ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        style={styles.editInput}
                        value={l4Input}
                        onChangeText={setL4Input}
                        placeholder="success/total"
                        placeholderTextColor="#999"
                        keyboardType="numbers-and-punctuation"
                        autoFocus
                      />
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleManualScoreUpdate("l4", l4Input)}
                      >
                        <Text style={styles.editButtonText}>✓</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.editButton, { backgroundColor: "#FF0000" }]}
                        onPress={() => {
                          setIsEditingL4(false);
                          setL4Input("");
                        }}
                      >
                        <Text style={styles.editButtonText}>✗</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => setIsEditingL4(true)}>
                      <Text style={styles.counterValue}>
                        {scoutingData.teleopCoralL4.filter(x => x === 1).length} / {scoutingData.teleopCoralL4.length}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.divider} />

              {/* Processor and Barge Scores */}
              <View style={styles.counterRow}>
                <Text style={styles.counterLabel}>Algae Removal:</Text>
                <View style={styles.counterControls}>
                  {isEditingProcessor ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        style={styles.editInput}
                        value={processorInput}
                        onChangeText={setProcessorInput}
                        placeholder="success/total"
                        placeholderTextColor="#999"
                        keyboardType="numbers-and-punctuation"
                        autoFocus
                      />
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleManualScoreUpdate("processor", processorInput)}
                      >
                        <Text style={styles.editButtonText}>✓</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.editButton, { backgroundColor: "#FF0000" }]}
                        onPress={() => {
                          setIsEditingProcessor(false);
                          setProcessorInput("");
                        }}
                      >
                        <Text style={styles.editButtonText}>✗</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => setIsEditingProcessor(true)}>
                      <Text style={styles.counterValue}>
                        {scoutingData.teleopProcessorScore.filter(x => x === 1).length} / {scoutingData.teleopProcessorScore.length}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.counterRow}>
                <Text style={styles.counterLabel}>Net:</Text>
                <View style={styles.counterControls}>
                  {isEditingAlgaeBarge ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        style={styles.editInput}
                        value={algaeBargeInput}
                        onChangeText={setAlgaeBargeInput}
                        placeholder="success/total"
                        placeholderTextColor="#999"
                        keyboardType="numbers-and-punctuation"
                        autoFocus
                      />
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleManualScoreUpdate("algaeBarge", algaeBargeInput)}
                      >
                        <Text style={styles.editButtonText}>✓</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.editButton, { backgroundColor: "#FF0000" }]}
                        onPress={() => {
                          setIsEditingAlgaeBarge(false);
                          setAlgaeBargeInput("");
                        }}
                      >
                        <Text style={styles.editButtonText}>✗</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => setIsEditingAlgaeBarge(true)}>
                      <Text style={styles.counterValue}>
                        {scoutingData.teleopAlgaeNet.filter(x => x === 1).length} / {scoutingData.teleopAlgaeNet.length}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.divider} />

              {/* Penalties Section */}
              <View style={styles.penaltyContainer}>
                <Text style={styles.counterLabel}>Penalties:</Text>
                <View style={styles.penaltyControls}>
                  <TouchableOpacity
                    style={styles.penaltyButton}
                    onPress={() => {
                      if (scores.penalties > 0) {
                        setScores(prev => ({ ...prev, penalties: prev.penalties - 1 }));
                      }
                    }}
                  >
                    <Text style={styles.counterValue}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.penaltyValue}>{scores.penalties}</Text>
                  <TouchableOpacity
                    style={styles.penaltyButton}
                    onPress={() => setScores(prev => ({ ...prev, penalties: prev.penalties + 1 }))}
                  >
                    <Text style={styles.counterValue}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Toggle Buttons */}
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  scores.playedDefense && styles.toggleButtonActive,
                ]}
                onPress={() => setScores(prev => ({ ...prev, playedDefense: !prev.playedDefense }))}
              >
                <Text style={styles.toggleButtonText}>
                  {scores.playedDefense ? "Played Defense ✓" : "Didn't Play Defense ✗"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  scores.robotDied && styles.toggleButtonActive,
                ]}
                onPress={() => setScores(prev => ({ ...prev, robotDied: !prev.robotDied }))}
              >
                <Text style={styles.toggleButtonText}>
                  {scores.robotDied ? "Robot Died ✓" : "Robot Didn't Die ✗"}
                </Text>
              </TouchableOpacity>

              <Button onPress={handleNext} style={styles.button} text="Next" />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
