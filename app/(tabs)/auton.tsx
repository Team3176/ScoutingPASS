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
  fieldContainer: {
    width: "100%",
    aspectRatio: 0.8,
    backgroundColor: "#333",
    marginVertical: 10,
    padding: 10,
    borderRadius: 10,
  },
  fieldContent: {
    flex: 1,
    flexDirection: "row",
    marginVertical: 5,
  },
  leftSection: {
    width: 5,
  },
  centerSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  rightSection: {
    width: 5,
  },
  playerSection: {
    height: 50,
    backgroundColor: "#00F",
    justifyContent: "center",
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  playerLabel: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 10,
  },
  mobilityButton: {
    backgroundColor: "#FF0000",
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
  },
  mobilityActive: {
    backgroundColor: "#00FF00",
  },
  mobilityText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
  },
  button: {
    marginTop: 15,
  },
  locationContainer: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "transparent",
    marginTop: 5,
  },
  locationTitle: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  locationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    backgroundColor: "transparent",
  },
  locationButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
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
  fieldImage: {
    width: "100%",
    height: "100%",
  },
  dot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "red",
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
  lButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 10,
    marginBottom: 10,
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

const FieldImage = React.memo(() => (
  <Image
    source={require("../../assets/images/field_image.png")}
    style={styles.fieldImage}
    resizeMode="contain"
  />
));

const Dots = React.memo(
  ({ points }: { points: { x: number; y: number }[] }) => (
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
  )
);

const ClickableFieldOverlay = React.memo(
  ({ onPress }: { onPress: (event: any) => void }) => (
    <TouchableOpacity onPress={onPress} style={StyleSheet.absoluteFill} />
  )
);

interface Scores {
  mobility: number[];
  crossedLine: number[];
  scoringPositions: { x: number; y: number }[];
  floorPickup: boolean;
  humanFeed: boolean;
  processor: boolean;
  barge: boolean;
}

export default function AutonScreen() {
  const router = useRouter();
  const configJson = JSON.parse(config_data);
  const autonConfig = configJson.auton;
  const { scoutingData, updateScoutingData } = useScoutingData();
  const colorScheme = useColorScheme() ?? "light";

  const [scores, setScores] = useState<Scores>({
    mobility: [],
    crossedLine: [],
    scoringPositions: [],
    floorPickup: false,
    humanFeed: false,
    processor: false,
    barge: false,
  });

  const [selectedLabels, setSelectedLabels] = useState<Set<number>>(new Set());
  const [selectedLabelForPrompt, setSelectedLabelForPrompt] = useState<
    number | null
  >(null);
  const [selectedPickupForPrompt, setSelectedPickupForPrompt] = useState<
    string | null
  >(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isEditingProcessor, setIsEditingProcessor] = useState(false);
  const [isEditingNet, setIsEditingNet] = useState(false);
  const [processorInput, setProcessorInput] = useState("");
  const [netInput, setNetInput] = useState("");
  const [isEditingL1, setIsEditingL1] = useState(false);
  const [isEditingL2, setIsEditingL2] = useState(false);
  const [isEditingL3, setIsEditingL3] = useState(false);
  const [isEditingL4, setIsEditingL4] = useState(false);
  const [isEditingFloor, setIsEditingFloor] = useState(false);
  const [isEditingHuman, setIsEditingHuman] = useState(false);
  const [l1Input, setL1Input] = useState("");
  const [l2Input, setL2Input] = useState("");
  const [l3Input, setL3Input] = useState("");
  const [l4Input, setL4Input] = useState("");
  const [floorInput, setFloorInput] = useState("");
  const [humanInput, setHumanInput] = useState("");
  const [isEditingAlgaeProcessor, setIsEditingAlgaeProcessor] = useState(false);
  const [isEditingAlgaeBarge, setIsEditingAlgaeBarge] = useState(false);
  const [algaeProcessorInput, setAlgaeProcessorInput] = useState("");
  const [algaeBargeInput, setAlgaeBargeInput] = useState("");

  useEffect(() => {
    setScores({
      mobility: scoutingData.mobility,
      crossedLine: scoutingData.crossedLine || [],
      scoringPositions: scoutingData.autonScoringPositions || [],
      floorPickup: false,
      humanFeed: false,
      processor: false,
      barge: false,
    });
  }, [scoutingData]);

  const handlePromptResponse = (success: boolean) => {
    if (selectedLabelForPrompt === null && selectedPickupForPrompt === null)
      return;

    const value = success ? 1 : 0;
    const newData: Partial<ScoutingData> = {};

    if (selectedLabelForPrompt !== null) {
      const labelId = `L${selectedLabelForPrompt + 1}`;
      switch (labelId) {
        case "L1":
          newData.autonCoralL1 = [...scoutingData.autonCoralL1, value];
          break;
        case "L2":
          newData.autonCoralL2 = [...scoutingData.autonCoralL2, value];
          break;
        case "L3":
          newData.autonCoralL3 = [...scoutingData.autonCoralL3, value];
          break;
        case "L4":
          newData.autonCoralL4 = [...scoutingData.autonCoralL4, value];
          break;
      }
    } else if (selectedPickupForPrompt) {
      switch (selectedPickupForPrompt) {
        case "Algae Removal":
          newData.autonProcessorScore = [...scoutingData.autonProcessorScore, value];
          break;
        case "Processor":
          newData.mobility = [...scoutingData.mobility, value];
          break;
        case "Net":
          newData.crossedLine = [...(scoutingData.crossedLine || []), value];
          break;
      }
    }

    updateScoutingData(newData);
    setShowPrompt(false);
    setSelectedLabelForPrompt(null);
    setSelectedPickupForPrompt(null);
  };

  const handleLabelPress = (labelId: number) => {
    setSelectedLabelForPrompt(labelId);
    setSelectedPickupForPrompt(null);
    setShowPrompt(true);
  };

  const handlePickupPress = (pickup: string) => {
    setSelectedPickupForPrompt(pickup);
    setSelectedLabelForPrompt(null);
    setShowPrompt(true);
  };

  const handleNext = () => {
    router.push("/teleop");
  };

  const handleManualScoreUpdate = (
    type: "processor" | "net" | "l1" | "l2" | "l3" | "l4" | "floor" | "human" | "algaeProcessor" | "algaeBarge",
    input: string
  ) => {
    // Convert input to numbers and validate
    const [success, total] = input.split("/").map(n => parseInt(n.trim()));
    if (isNaN(success) || isNaN(total) || success > total || success < 0 || total < 0) {
      return; // Invalid input
    }

    const newArray = Array(total).fill(0);
    for (let i = 0; i < success; i++) {
      newArray[i] = 1;
    }

    type ScoreArrayKeys = 'autonCoralL1' | 'autonCoralL2' | 'autonCoralL3' | 'autonCoralL4' | 
                         'autonProcessorScore' | 'autonNetScore' | 'mobility' | 'crossedLine';
    const newData = {} as { [K in ScoreArrayKeys]?: number[] };

    switch (type) {
      case "processor":
        newData.autonProcessorScore = newArray;
        break;
      case "net":
        newData.autonNetScore = newArray;
        break;
      case "l1":
        newData.autonCoralL1 = newArray;
        break;
      case "l2":
        newData.autonCoralL2 = newArray;
        break;
      case "l3":
        newData.autonCoralL3 = newArray;
        break;
      case "l4":
        newData.autonCoralL4 = newArray;
        break;
      case "floor":
        newData.autonProcessorScore = newArray;
        break;
      case "human":
        newData.autonNetScore = newArray;
        break;
      case "algaeProcessor":
        newData.mobility = newArray;
        break;
      case "algaeBarge":
        newData.crossedLine = newArray;
        break;
    }

    updateScoutingData(newData as Partial<ScoutingData>);

    // Reset edit state and input
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
      case "floor":
        setIsEditingFloor(false);
        setFloorInput("");
        break;
      case "human":
        setIsEditingHuman(false);
        setHumanInput("");
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

  const handleUndo = () => {
    type ScoreArrayKeys = 'autonCoralL1' | 'autonCoralL2' | 'autonCoralL3' | 'autonCoralL4' | 'autonProcessorScore' | 'autonNetScore';
    const newData = {} as Record<ScoreArrayKeys, number[]>;
    let hasChanges = false;

    // Check all score arrays and remove the last entry from the most recently updated one
    const scoreArrays = [
      { key: 'autonCoralL1' as const, array: scoutingData.autonCoralL1 },
      { key: 'autonCoralL2' as const, array: scoutingData.autonCoralL2 },
      { key: 'autonCoralL3' as const, array: scoutingData.autonCoralL3 },
      { key: 'autonCoralL4' as const, array: scoutingData.autonCoralL4 },
      { key: 'autonProcessorScore' as const, array: scoutingData.autonProcessorScore },
      { key: 'autonNetScore' as const, array: scoutingData.autonNetScore },
    ] as const;

    // Find the array with the most elements
    let maxLength = 0;
    let arrayToUndo: ScoreArrayKeys | null = null;

    scoreArrays.forEach(({ key, array }) => {
      if (array && array.length > maxLength) {
        maxLength = array.length;
        arrayToUndo = key;
      }
    });

    // Remove the last entry from the selected array
    if (arrayToUndo && scoutingData[arrayToUndo]) {
      const currentArray = scoutingData[arrayToUndo] as number[];
      if (currentArray.length > 0) {
        newData[arrayToUndo] = currentArray.slice(0, -1);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      updateScoutingData(newData as unknown as Partial<ScoutingData>);
    }
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
          {configJson.page_title} - Autonomous
        </Text>

        <View style={styles.content}>
          <LButtons
                  onLabelPress={handleLabelPress}
                  selectedLabels={selectedLabels}
                  activePromptLabel={selectedLabelForPrompt}
                />

          {(selectedLabelForPrompt !== null ||
            selectedPickupForPrompt !== null) && (
            <View style={[styles.promptContainer]}>
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

            <TouchableOpacity
              style={[
                styles.mobilityButton,
                scores.crossedLine.length > 0 && styles.mobilityActive,
                {
                  backgroundColor:
                    scores.crossedLine.length > 0
                      ? Colors[colorScheme].successBackground
                      : Colors[colorScheme].errorBackground,
                },
              ]}
              onPress={() => {
                const newCrossedLine = scores.crossedLine.length > 0 ? [] : [1];
                updateScoutingData({ crossedLine: newCrossedLine });
                setScores((prev) => ({ ...prev, crossedLine: newCrossedLine }));
              }}
            >
              <Text style={styles.mobilityText}>
                {scores.crossedLine.length > 0
                  ? "Robot crossed Starting Line ✓"
                  : "Robot didn't cross Starting Line ✗"}
              </Text>
            </TouchableOpacity>

            {/* Algae Counter Buttons */}
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
                        {scoutingData.autonCoralL1.filter(x => x === 1).length} / {scoutingData.autonCoralL1.length}
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
                        {scoutingData.autonCoralL2.filter(x => x === 1).length} / {scoutingData.autonCoralL2.length}
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
                        {scoutingData.autonCoralL3.filter(x => x === 1).length} / {scoutingData.autonCoralL3.length}
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
                        {scoutingData.autonCoralL4.filter(x => x === 1).length} / {scoutingData.autonCoralL4.length}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.divider} />

              {/* Processor and Barge Scores */}
              <View style={styles.counterRow}>
                <Text style={styles.counterLabel}>Processor:</Text>
                <View style={styles.counterControls}>
                  {isEditingAlgaeProcessor ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        style={styles.editInput}
                        value={algaeProcessorInput}
                        onChangeText={setAlgaeProcessorInput}
                        placeholder="success/total"
                        placeholderTextColor="#999"
                        keyboardType="numbers-and-punctuation"
                        autoFocus
                      />
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleManualScoreUpdate("algaeProcessor", algaeProcessorInput)}
                      >
                        <Text style={styles.editButtonText}>✓</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.editButton, { backgroundColor: "#FF0000" }]}
                        onPress={() => {
                          setIsEditingAlgaeProcessor(false);
                          setAlgaeProcessorInput("");
                        }}
                      >
                        <Text style={styles.editButtonText}>✗</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => setIsEditingAlgaeProcessor(true)}>
                      <Text style={styles.counterValue}>
                        {scoutingData.mobility.filter(x => x === 1).length} / {scoutingData.mobility.length}
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
                        {(scoutingData.crossedLine || []).filter(x => x === 1).length} / {(scoutingData.crossedLine || []).length}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.divider} />

              {/* Pickup Scores */}
              <View style={styles.counterRow}>
                <Text style={styles.counterLabel}>Algae Removal:</Text>
                <View style={styles.counterControls}>
                  {isEditingFloor ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        style={styles.editInput}
                        value={floorInput}
                        onChangeText={setFloorInput}
                        placeholder="success/total"
                        placeholderTextColor="#999"
                        keyboardType="numbers-and-punctuation"
                        autoFocus
                      />
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleManualScoreUpdate("floor", floorInput)}
                      >
                        <Text style={styles.editButtonText}>✓</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.editButton, { backgroundColor: "#FF0000" }]}
                        onPress={() => {
                          setIsEditingFloor(false);
                          setFloorInput("");
                        }}
                      >
                        <Text style={styles.editButtonText}>✗</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => setIsEditingFloor(true)}>
                      <Text style={styles.counterValue}>
                        {scoutingData.autonProcessorScore.filter(x => x === 1).length} / {scoutingData.autonProcessorScore.length}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <View style={styles.counterRow}>
                <Text style={styles.counterLabel}>Human Feed:</Text>
                <View style={styles.counterControls}>
                  {isEditingHuman ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        style={styles.editInput}
                        value={humanInput}
                        onChangeText={setHumanInput}
                        placeholder="success/total"
                        placeholderTextColor="#999"
                        keyboardType="numbers-and-punctuation"
                        autoFocus
                      />
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleManualScoreUpdate("human", humanInput)}
                      >
                        <Text style={styles.editButtonText}>✓</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.editButton, { backgroundColor: "#FF0000" }]}
                        onPress={() => {
                          setIsEditingHuman(false);
                          setHumanInput("");
                        }}
                      >
                        <Text style={styles.editButtonText}>✗</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => setIsEditingHuman(true)}>
                      <Text style={styles.counterValue}>
                        {scoutingData.autonNetScore.filter(x => x === 1).length} / {scoutingData.autonNetScore.length}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            <Button onPress={handleNext} style={styles.button} text="Next" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
