import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Share } from 'react-native';
import { Text } from '../../components/Themed';
import { ScrollView } from 'react-native-gesture-handler';
import { Button } from '../../components/ui/Button';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useScoutingData } from '../../context/ScoutingContext';

export default function QRScreen() {
  const router = useRouter();
  const { scoutingData, clearScoutingData } = useScoutingData();
  const [qrValue, setQrValue] = useState('');

  useEffect(() => {
    // Create a simplified version of the data for the QR code
    const qrData = {
      s: scoutingData.scouterInitials,
      e: scoutingData.event,
      l: scoutingData.matchLevel,
      m: scoutingData.matchNumber,
      t: scoutingData.teamNumber,
      r: scoutingData.robotPosition,
      sp: scoutingData.clickedPoints,
      // Autonomous
      ac1: scoutingData.autonCoralL1,
      ac2: scoutingData.autonCoralL2,
      ac3: scoutingData.autonCoralL3,
      ac4: scoutingData.autonCoralL4,
      aps: scoutingData.autonProcessorScore,
      ans: scoutingData.autonNetScore,
      al: scoutingData.mobility,
      acl: scoutingData.crossedLine,
      asl: scoutingData.coralScoredLocation,
      asp: scoutingData.autonScoringPositions,
      // Teleop
      tc1: scoutingData.teleopCoralL1,
      tc2: scoutingData.teleopCoralL2,
      tc3: scoutingData.teleopCoralL3,
      tc4: scoutingData.teleopCoralL4,
      tps: scoutingData.teleopProcessorScore,
      tns: scoutingData.teleopNetScore,
      // Endgame
      os: scoutingData.onStage,
      sl: scoutingData.spotlit,
      h: scoutingData.harmony,
      tr: scoutingData.trap,
      p: scoutingData.parked,
      ds: scoutingData.driverSkill,
      dr: scoutingData.defenseRating,
      sr: scoutingData.speedRating,
      co: scoutingData.comments,
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
    clearScoutingData(); // Reset all form data
    router.replace('/'); // Navigate back to the index page
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
              {qrValue ? JSON.stringify(JSON.parse(qrValue), null, 2) : 'No data available'}
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
    paddingBottom: 100,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  content: {
    gap: 20,
    alignItems: 'center',
    paddingBottom: 100,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
  button: {
    marginVertical: 5,
  },
  clearButton: {
    backgroundColor: '#f44336',
  },
  dataPreview: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
  },
  dataPreviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color:'#000000',
  },
  dataScroll: {
    maxHeight: 200,
  },
  dataText: {
    fontFamily: 'monospace',
    color:'#000000',
  },
}); 