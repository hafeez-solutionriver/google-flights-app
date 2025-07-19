import React from "react";
import { TextInput, StyleSheet, View } from "react-native";

export default function AppInput({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
}) {
  return (
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.inputField}
        placeholder={placeholder}
        placeholderTextColor="#888"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    marginBottom: 15,
  },
  inputField: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
    fontFamily: "Poppins-Regular",
  },
});
