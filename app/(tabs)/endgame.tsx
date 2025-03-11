import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View as RNView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Image,
  Dimensions,
  TextInput as RNTextInput,
} from "react-native";
import { Text, View } from "../../components/Themed";
import { ScrollView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { Button } from "../../components/ui/Button";
import { FontAwesome } from "@expo/vector-icons";
import { config_data } from "../../constants/ReefscapeConfig";
import { useScoutingData } from "../../context/ScoutingContext";
import { Colors } from "../../constants/Colors";

interface ToggleButtonProps {
  label: string;
  value: boolean;
  onToggle: () => void;
  trueText?: string;
  falseText?: string;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  label,
  value,
  onToggle,
  trueText,
  falseText,
}) => (
  <TouchableOpacity
    style={[styles.toggleButton, value && styles.toggleButtonActive]}
    onPress={onToggle}
  >
    <Text
      style={[styles.toggleButtonText, value && styles.toggleButtonTextActive]}
    >
      {trueText && falseText
        ? value
          ? `${trueText} ✓`
          : `${falseText} ✗`
        : value
        ? "Successful ✓"
        : "Failed ✗"}
    </Text>
  </TouchableOpacity>
);

interface RadioButtonProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  position: "first" | "middle" | "last";
}

const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  selected,
  onSelect,
  position,
}) => (
  <TouchableOpacity
    style={[
      styles.radioButton,
      position === "first" && styles.radioButtonFirst,
      position === "last" && styles.radioButtonLast,
      selected && styles.radioButtonSelected,
    ]}
    onPress={onSelect}
  >
    <Text
      style={[
        styles.radioButtonText,
        selected && styles.radioButtonTextSelected,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

interface EndgameState {
  deepClimbStatus: "not_attempted" | "failed" | "successful";
  shallowClimbStatus: "not_attempted" | "failed" | "successful";
  parkedStatus: "not_attempted" | "failed" | "successful";
  comments: string;
  redAllianceScore: string;
  blueAllianceScore: string;
}

export default function EndgameScreen() {
  const router = useRouter();
  const configJson = JSON.parse(config_data);
  const endgameConfig = configJson.endgame;
  const postmatchConfig = configJson.postmatch;
  const colorScheme = useColorScheme() ?? "light";
  const { scoutingData, updateScoutingData } = useScoutingData();

  const [endgameState, setEndgameState] = useState<EndgameState>({
    deepClimbStatus: scoutingData.driverSkill,
    shallowClimbStatus: scoutingData.speedRating,
    parkedStatus: scoutingData.parked,
    comments: scoutingData.comments || "",
    redAllianceScore: scoutingData.redAllianceScore || "",
    blueAllianceScore: scoutingData.blueAllianceScore || "",
  });

  useEffect(() => {
    setEndgameState({
      deepClimbStatus: scoutingData.driverSkill,
      shallowClimbStatus: scoutingData.speedRating,
      parkedStatus: scoutingData.parked,
      comments: scoutingData.comments || "",
      redAllianceScore: scoutingData.redAllianceScore || "",
      blueAllianceScore: scoutingData.blueAllianceScore || "",
    });
  }, [scoutingData]);

  const setClimbStatus = (
    key: "deepClimbStatus" | "shallowClimbStatus" | "parkedStatus",
    status: "not_attempted" | "failed" | "successful"
  ) => {
    setEndgameState((prev) => ({
      ...prev,
      [key]: status,
    }));

    // Immediately update scoutingData based on which status was changed
    switch (key) {
      case "deepClimbStatus":
        updateScoutingData({ driverSkill: status });
        break;
      case "shallowClimbStatus":
        updateScoutingData({ speedRating: status });
        break;
      case "parkedStatus":
        updateScoutingData({ parked: status });
        break;
    }
  };

  const handleNext = () => {
    updateScoutingData({
      onStage:
        endgameState.deepClimbStatus === "successful" ||
        endgameState.shallowClimbStatus === "successful",
      spotlit: false,
      harmony: false,
      trap: false,
      parked: endgameState.parkedStatus,
      driverSkill: endgameState.deepClimbStatus,
      speedRating: endgameState.shallowClimbStatus,
      comments: endgameState.comments,
      redAllianceScore: endgameState.redAllianceScore,
      blueAllianceScore: endgameState.blueAllianceScore,
    });
    router.push("/qr");
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
          {configJson.page_title} - Endgame
        </Text>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deep Climb</Text>
            <View style={styles.radioGroup}>
              <RadioButton
                label="Not Attempted"
                selected={endgameState.deepClimbStatus === "not_attempted"}
                onSelect={() =>
                  setClimbStatus("deepClimbStatus", "not_attempted")
                }
                position="first"
              />
              <RadioButton
                label="Attempted but Failed"
                selected={endgameState.deepClimbStatus === "failed"}
                onSelect={() => setClimbStatus("deepClimbStatus", "failed")}
                position="middle"
              />
              <RadioButton
                label="Successful"
                selected={endgameState.deepClimbStatus === "successful"}
                onSelect={() => setClimbStatus("deepClimbStatus", "successful")}
                position="last"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shallow Climb</Text>
            <View style={styles.radioGroup}>
              <RadioButton
                label="Not Attempted"
                selected={endgameState.shallowClimbStatus === "not_attempted"}
                onSelect={() =>
                  setClimbStatus("shallowClimbStatus", "not_attempted")
                }
                position="first"
              />
              <RadioButton
                label="Attempted but Failed"
                selected={endgameState.shallowClimbStatus === "failed"}
                onSelect={() => setClimbStatus("shallowClimbStatus", "failed")}
                position="middle"
              />
              <RadioButton
                label="Successful"
                selected={endgameState.shallowClimbStatus === "successful"}
                onSelect={() =>
                  setClimbStatus("shallowClimbStatus", "successful")
                }
                position="last"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Parked</Text>
            <View style={styles.radioGroup}>
              <RadioButton
                label="Not Attempted"
                selected={endgameState.parkedStatus === "not_attempted"}
                onSelect={() => setClimbStatus("parkedStatus", "not_attempted")}
                position="first"
              />
              <RadioButton
                label="Attempted but Failed"
                selected={endgameState.parkedStatus === "failed"}
                onSelect={() => setClimbStatus("parkedStatus", "failed")}
                position="middle"
              />
              <RadioButton
                label="Successful"
                selected={endgameState.parkedStatus === "successful"}
                onSelect={() => setClimbStatus("parkedStatus", "successful")}
                position="last"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comments</Text>
            <RNView style={styles.commentContainer}>
              <TextInput
                style={styles.commentInput}
                value={endgameState.comments}
                onChangeText={(text) => {
                  if (text.length <= 60) {
                    setEndgameState((prev) => ({ ...prev, comments: text }));
                    updateScoutingData({ comments: text });
                  }
                }}
                placeholder="Add comments (60 char max)"
                placeholderTextColor="#999"
                maxLength={60}
                multiline
              />
              <Text style={styles.charCount}>
                {endgameState.comments.length}/60
              </Text>
            </RNView>
          </View>

          <View style={styles.allianceScores}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colorScheme === "light" ? "#000" : "#fff" },
              ]}
            >
              Alliance Scores
            </Text>

            <View style={styles.scoreInputRow}>
              <View style={styles.scoreInputContainer}>
                <Text style={[styles.scoreLabel, { color: "#FF0000" }]}>
                  Red Alliance
                </Text>
                <TextInput
                  style={[
                    styles.scoreInput,
                    {
                      backgroundColor: Colors[colorScheme].inputBackground,
                      color: colorScheme === "light" ? "#000" : "#fff",
                    },
                  ]}
                  value={endgameState.redAllianceScore}
                  onChangeText={(value) => {
                    setEndgameState((prev) => ({
                      ...prev,
                      redAllianceScore: value,
                    }));
                    updateScoutingData({ redAllianceScore: value });
                  }}
                  keyboardType="numeric"
                  placeholder="Enter score"
                  placeholderTextColor={
                    colorScheme === "light" ? "#999" : "#666"
                  }
                />
              </View>

              <View style={styles.scoreInputContainer}>
                <Text style={[styles.scoreLabel, { color: "#0000FF" }]}>
                  Blue Alliance
                </Text>
                <TextInput
                  style={[
                    styles.scoreInput,
                    {
                      backgroundColor: Colors[colorScheme].inputBackground,
                      color: colorScheme === "light" ? "#000" : "#fff",
                    },
                  ]}
                  value={endgameState.blueAllianceScore}
                  onChangeText={(value) => {
                    setEndgameState((prev) => ({
                      ...prev,
                      blueAllianceScore: value,
                    }));
                    updateScoutingData({ blueAllianceScore: value });
                  }}
                  keyboardType="numeric"
                  placeholder="Enter score"
                  placeholderTextColor={
                    colorScheme === "light" ? "#999" : "#666"
                  }
                />
              </View>
            </View>
          </View>

          <Button onPress={handleNext} style={styles.button} text="Next" />
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
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  content: {
    gap: 20,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: "#413838",
    padding: 15,
    borderRadius: 10,
    gap: 0,
    overflow: "hidden",
    elevation: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#FFFFFF",
  },
  toggleButton: {
    backgroundColor: "#FB0101",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#4CAF50",
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  toggleButtonTextActive: {
    color: "#fff",
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: "#fff",
  },
  ratingContainer: {
    marginBottom: 15,
    backgroundColor: "transparent",
  },
  ratingLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: "#fff",
    textAlign: "center",
  },
  ratingButtons: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  ratingButton: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRightColor: "#ccc",
    elevation: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  ratingButtonActive: {
    backgroundColor: "#2196F3",
  },
  ratingButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  ratingButtonTextActive: {
    color: "#fff",
  },
  button: {
    marginTop: 20,
  },
  commentContainer: {
    marginTop: 5,
    backgroundColor: "transparent",
  },
  commentInput: {
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 10,
    minHeight: 60,
    color: "#000",
    textAlignVertical: "top",
    elevation: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    borderWidth: 0,
  },
  charCount: {
    textAlign: "right",
    color: "#999",
    marginTop: 5,
    fontSize: 12,
  },
  radioGroup: {
    gap: 0,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 0,
    shadowColor: "transparent",
  },
  radioButton: {
    backgroundColor: "#2F2F2F",
    padding: 15,
    alignItems: "center",
    borderWidth: 0,
    elevation: 0,
    shadowColor: "transparent",
    marginVertical: 0,
  },
  radioButtonFirst: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  radioButtonLast: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  radioButtonSelected: {
    backgroundColor: "#4CAF50",
  },
  radioButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  radioButtonTextSelected: {
    color: "#fff",
  },
  allianceScores: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "transparent",
  },
  scoreInputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  scoreInputContainer: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  scoreInput: {
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: "center",
  },
});
