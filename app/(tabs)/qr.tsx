import React, { useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Share } from "react-native";
import { Text } from "../../components/Themed";
import { ScrollView } from "react-native-gesture-handler";
import { Button } from "../../components/ui/Button";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import {
  useScoutingData,
  defaultScoutingData,
} from "../../context/ScoutingContext";
import { Colors } from "../../constants/Colors";

export default function QRScreen() {
  const router = useRouter();
  const { scoutingData, setScoutingData } = useScoutingData();
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    // Create a simplified version of the data for the QR code
    const qrData = {
      scouter_name: scoutingData.scouterInitials,
      event: scoutingData.event,
      level: scoutingData.matchLevel === "Qualifications" ? "quals" : "elims",
      match_num: scoutingData.matchNumber,
      team_num: scoutingData.teamNumber,
      robot: scoutingData.robotPosition,
      starting_pos: scoutingData.robotPosition?.startsWith("r")
        ? scoutingData.redPoint
        : scoutingData.bluePoint,
      // Autonomous - Arrays of 1s and 0s for each button press
      L1_auton: Array.isArray(scoutingData.autonCoralL1)
        ? scoutingData.autonCoralL1
        : [],
      L2_auton: Array.isArray(scoutingData.autonCoralL2)
        ? scoutingData.autonCoralL2
        : [],
      L3_auton: Array.isArray(scoutingData.autonCoralL3)
        ? scoutingData.autonCoralL3
        : [],
      L4_auton: Array.isArray(scoutingData.autonCoralL4)
        ? scoutingData.autonCoralL4
        : [],
      floor: Array.isArray(scoutingData.autonProcessorScore)
        ? scoutingData.autonProcessorScore
        : [],
      human_feed: Array.isArray(scoutingData.autonNetScore)
        ? scoutingData.autonNetScore
        : [],
      processor: Array.isArray(scoutingData.mobility)
        ? scoutingData.mobility
        : [],
      barge: Array.isArray(scoutingData.crossedLine)
        ? scoutingData.crossedLine
        : [],
      start_line:
        Array.isArray(scoutingData.crossedLine) &&
        scoutingData.crossedLine[0] === 1
          ? 1
          : 0,
      // Teleop - Arrays of 1s and 0s for each button press
      L1_teleop: Array.isArray(scoutingData.teleopCoralL1)
        ? scoutingData.teleopCoralL1
        : [],
      L2_teleop: Array.isArray(scoutingData.teleopCoralL2)
        ? scoutingData.teleopCoralL2
        : [],
      L3_teleop: Array.isArray(scoutingData.teleopCoralL3)
        ? scoutingData.teleopCoralL3
        : [],
      L4_teleop: Array.isArray(scoutingData.teleopCoralL4)
        ? scoutingData.teleopCoralL4
        : [],
      floor_teleop: Array.isArray(scoutingData.teleopProcessorScore)
        ? scoutingData.teleopProcessorScore
        : [],
      human_teleop: Array.isArray(scoutingData.teleopNetScore)
        ? scoutingData.teleopNetScore
        : [],
      process_teleop: Array.isArray(scoutingData.teleopAlgaeProcessor)
        ? scoutingData.teleopAlgaeProcessor
        : [],
      barge_teleop: Array.isArray(scoutingData.teleopAlgaeNet)
        ? scoutingData.teleopAlgaeNet
        : [],
      penalties: scoutingData.defenseRating,
      defense: scoutingData.playedDefense ? 1 : 0,
      died: scoutingData.robotDied ? 1 : 0,
      deep_climb:
        scoutingData.driverSkill === "not_attempted"
          ? "na"
          : scoutingData.driverSkill === "failed"
          ? "fail"
          : "success",
      shallow_climb:
        scoutingData.speedRating === "not_attempted"
          ? "na"
          : scoutingData.speedRating === "failed"
          ? "fail"
          : "success",
      parked:
        scoutingData.parked === "not_attempted"
          ? "na"
          : scoutingData.parked === "failed"
          ? "fail"
          : "success",
      comments: scoutingData.comments,
      red_scores: scoutingData.redAllianceScore,
      blue_scores: scoutingData.blueAllianceScore,
    };

    // Convert to JSON string for QR code
    const jsonData = JSON.stringify(qrData);
    setQrValue(jsonData);
  }, [scoutingData]);

  const handleCopyData = async () => {
    await Clipboard.setStringAsync(qrValue);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: qrValue,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleClear = () => {
    setScoutingData(defaultScoutingData);
    router.replace("/");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Match Data QR Code</Text>

      <View style={styles.content}>
        <View style={styles.qrContainer}>
          {qrValue ? (
            <QRCode
              value={qrValue}
              size={250}
              backgroundColor="white"
              color="black"
            />
          ) : (
            <Text>Loading QR Code...</Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            onPress={handleCopyData}
            style={styles.button}
            text="Copy Data"
          />

          <Button
            onPress={handleShare}
            style={styles.button}
            text="Share Data"
          />

          <Button
            onPress={handleClear}
            style={{ ...styles.button, ...styles.clearButton }}
            text="Clear Form"
          />
        </View>

        <View style={styles.dataPreview}>
          <Text style={styles.dataPreviewTitle}>Data Preview:</Text>
          <ScrollView style={styles.dataScroll}>
            <Text style={styles.dataText}>
              {qrValue
                ? JSON.stringify(JSON.parse(qrValue), null, 2)
                : "No data available"}
            </Text>
          </ScrollView>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#000",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  content: {
    gap: 20,
    alignItems: "center",
    paddingBottom: 100,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonContainer: {
    width: "100%",
    gap: 10,
  },
  button: {
    marginVertical: 5,
  },
  clearButton: {
    backgroundColor: "#f44336",
  },
  dataPreview: {
    width: "100%",
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
  },
  dataPreviewTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000000",
  },
  dataScroll: {
    maxHeight: 200,
  },
  dataText: {
    fontFamily: "monospace",
    color: "#000000",
  },
});
