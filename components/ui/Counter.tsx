import React, { useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Text } from "../Themed";
import { FontAwesome } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import { Colors } from "../../constants/Colors";

interface CounterProps {
  label: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export const Counter: React.FC<CounterProps> = ({
  label,
  value,
  onIncrement,
  onDecrement,
}) => {
  const colorScheme = useColorScheme() ?? "light";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].cardBackground },
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={onDecrement}
          style={[
            styles.button,
            { backgroundColor: Colors[colorScheme].buttonBackground },
          ]}
        >
          <FontAwesome name="minus" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.value}>{value}</Text>
        <TouchableOpacity
          onPress={onIncrement}
          style={[
            styles.button,
            { backgroundColor: Colors[colorScheme].buttonBackground },
          ]}
        >
          <FontAwesome name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontSize: 24,
    fontWeight: "bold",
    minWidth: 40,
    textAlign: "center",
  },
});
