import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  View as RNView,
  useColorScheme,
  Alert,
} from "react-native";
import { Text, View } from "../../components/Themed";
import { ScrollView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { Button } from "../../components/ui/Button";
import { Colors } from "../../constants/Colors";
import { config_data } from "../../constants/ReefscapeConfig";
import { useScoutingData, ScoutingData } from "../../context/ScoutingContext";
import Svg, { Path, Circle, Text as SvgText, G } from "react-native-svg";

interface HexagonFieldProps {
  onLabelPress: (labelIndex: number) => void;
  selectedLabels: Set<number>;
  activePromptLabel: number | null;
}

const HexagonField: React.FC<HexagonFieldProps> = React.memo(
  ({ onLabelPress, selectedLabels, activePromptLabel }) => {
    const size = Dimensions.get("window").width - 40;
    const center = size / 2;
    const hexRadius = size / 12;
    const centerHexRadius = hexRadius * 0.4;
    const [flashingLabel, setFlashingLabel] = useState<number | null>(null);

    // Generate angles for the six corners
    const cornerAngles = Array.from(
      { length: 6 },
      (_, i) => (i * 2 * Math.PI) / 6
    );

    // Calculate scales for each hexagon with original spacing
    const hexagonScales = [1.8, 3.0, 4.2, 5.4].map(
      (scale) => scale * hexRadius
    );

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
      hexRadius * 1.0, // L1 size (increased from 0.8)
      Math.min(getVerticalGap(hexagonScales[0]) - 2, hexRadius), // L2 size
      Math.min(getVerticalGap(hexagonScales[1]) - 2, hexRadius), // L3 size
      Math.min(getVerticalGap(hexagonScales[2]) - 2, hexRadius), // L4 size
    ];

    // Calculate positions for each ring with buttons between hexagon lines
    const ringPositions = [
      { scale: centerHexRadius, y: center }, // Center (L1)
      {
        scale: hexagonScales[0],
        y: getMidpoint(hexagonScales[0], hexagonScales[1]),
      }, // L2
      {
        scale: hexagonScales[1],
        y: getMidpoint(hexagonScales[1], hexagonScales[2]),
      }, // L3
      {
        scale: hexagonScales[2],
        y: getMidpoint(hexagonScales[2], hexagonScales[3]),
      }, // L4
    ];

    const handleLabelPress = (labelIndex: number) => {
      setFlashingLabel(labelIndex);
      setTimeout(() => setFlashingLabel(null), 150);
      onLabelPress(labelIndex);
    };

    const renderHexagon = (scale: number, hexIndex: number) => {
      const points = cornerAngles.map((angle) => ({
        x: center + scale * Math.cos(angle),
        y: center + scale * Math.sin(angle),
      }));

      const pathData =
        points
          .map((point, i) => `${i === 0 ? "M" : "L"} ${point.x} ${point.y}`)
          .join(" ") + " Z";

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
                position: "absolute",
                left: center - buttonSizes[i] / 2,
                top: pos.y - buttonSizes[i] / 2,
                width: buttonSizes[i],
                height: buttonSizes[i],
                borderRadius: buttonSizes[i] / 2,
                backgroundColor: flashingLabel === i ? "#666666" : "#444444",
              },
            ]}
            onPress={() => handleLabelPress(i)}
          >
            <Text
              style={[
                styles.labelText,
                {
                  fontSize: buttonSizes[i] * 0.4,
                },
                activePromptLabel === i && { color: "#00FF00" },
              ]}
            >
              {`L${i + 1}`}
            </Text>
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
        case "Floor Pickup":
          newData.autonProcessorScore = [
            ...scoutingData.autonProcessorScore,
            value,
          ];
          break;
        case "Human Feed":
          newData.autonNetScore = [...scoutingData.autonNetScore, value];
          break;
        case "Processor":
          newData.mobility = [...scoutingData.mobility, value];
          break;
        case "Barge":
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
          <View style={styles.fieldContainer}>
            <View style={styles.playerSection}>
              <Text style={styles.playerLabel}>Auton Scoring</Text>
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

          {(selectedLabelForPrompt !== null ||
            selectedPickupForPrompt !== null) && (
            <View style={[styles.promptContainer]}>
              <Text
                style={{
                  color: "#FFF",
                  fontSize: 18,
                  fontWeight: "bold",
                  marginBottom: 10,
                  textAlign: "center",
                }}
              >
                {selectedLabelForPrompt !== null
                  ? `L${selectedLabelForPrompt + 1}`
                  : selectedPickupForPrompt}{" "}
                Score:
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  gap: 20,
                  backgroundColor: "transparent",
                }}
              >
                <TouchableOpacity
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: "#4CAF50",
                    justifyContent: "center",
                    alignItems: "center",
                    elevation: 0,
                    shadowColor: "transparent",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0,
                    shadowRadius: 0,
                  }}
                  onPress={() => handlePromptResponse(true)}
                >
                  <Text
                    style={{ color: "#FFF", fontSize: 24, fontWeight: "bold" }}
                  >
                    ✓
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: "#FF0000",
                    justifyContent: "center",
                    alignItems: "center",
                    elevation: 0,
                    shadowColor: "transparent",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0,
                    shadowRadius: 0,
                  }}
                  onPress={() => handlePromptResponse(false)}
                >
                  <Text
                    style={{ color: "#FFF", fontSize: 24, fontWeight: "bold" }}
                  >
                    ✗
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.buttonsContainer}>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.pickupButton,
                  selectedPickupForPrompt === "Floor Pickup" &&
                    styles.pickupButtonActive,
                ]}
                onPress={() => handlePickupPress("Floor Pickup")}
              >
                <Text style={styles.pickupButtonText}>Floor Pickup</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.pickupButton,
                  selectedPickupForPrompt === "Human Feed" &&
                    styles.pickupButtonActive,
                ]}
                onPress={() => handlePickupPress("Human Feed")}
              >
                <Text style={styles.pickupButtonText}>Human Feed</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
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
              <TouchableOpacity
                style={[
                  styles.pickupButton,
                  selectedPickupForPrompt === "Barge" &&
                    styles.pickupButtonActive,
                ]}
                onPress={() => handlePickupPress("Barge")}
              >
                <Text style={styles.pickupButtonText}>Barge</Text>
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

            <Button onPress={handleNext} style={styles.button} text="Next" />
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
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#444444",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  labelButtonSelected: {
    backgroundColor: "#444444",
  },
  labelText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  labelTextSelected: {
    color: "#00FF00",
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
  },
  promptButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
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
} as const);
