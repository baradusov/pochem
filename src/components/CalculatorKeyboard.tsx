import React, { useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface CalculatorKeyboardProps {
  onDigit: (digit: string) => void;
  onOperator: (operator: string) => void;
  onDecimal: () => void;
  onBackspace: () => void;
  onClear: () => void;
  onEvaluate: () => void;
  onHeightChange?: (height: number) => void;
}

const OPERATORS = [
  { label: '+', value: '+' },
  { label: '−', value: '-' },
  { label: '×', value: '*' },
  { label: '÷', value: '/' },
];

const DIGITS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

const hapticTap = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

interface KeyButtonProps {
  onPress: () => void;
  onLongPress?: () => void;
  children: React.ReactNode;
}

const KeyButton = ({ onPress, onLongPress, children }: KeyButtonProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scale, {
      toValue: 0.92,
      duration: 60,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    hapticTap();
    onPress();
  };

  const handleLongPress = () => {
    if (onLongPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onLongPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress ? handleLongPress : undefined}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.keyPressable}
    >
      <Animated.View style={[styles.key, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export const CalculatorKeyboard = ({
  onDigit,
  onOperator,
  onDecimal,
  onBackspace,
  onClear,
  onEvaluate,
  onHeightChange,
}: CalculatorKeyboardProps) => {
  const insets = useSafeAreaInsets();

  const handleLayout = (e: LayoutChangeEvent) => {
    onHeightChange?.(e.nativeEvent.layout.height);
  };

  return (
    <View
      style={[styles.container, { paddingBottom: insets.bottom }]}
      onLayout={handleLayout}
    >
      <View style={styles.operatorRow}>
        {OPERATORS.map(({ label, value }) => (
          <KeyButton key={value} onPress={() => onOperator(value)}>
            <Text style={styles.operatorText}>{label}</Text>
          </KeyButton>
        ))}
        <KeyButton onPress={onEvaluate}>
          <Feather name="check" size={22} color="#6BC880" />
        </KeyButton>
      </View>

      {DIGITS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.digitRow}>
          {row.map((digit, digitIndex) => (
            <React.Fragment key={digit}>
              {digitIndex > 0 && <View style={styles.verticalSeparator} />}
              <KeyButton onPress={() => onDigit(digit)}>
                <Text style={styles.digitText}>{digit}</Text>
              </KeyButton>
            </React.Fragment>
          ))}
        </View>
      ))}

      <View style={styles.digitRow}>
        <KeyButton onPress={onDecimal}>
          <Text style={styles.digitText}>,</Text>
        </KeyButton>
        <View style={styles.verticalSeparator} />
        <KeyButton onPress={() => onDigit('0')}>
          <Text style={styles.digitText}>0</Text>
        </KeyButton>
        <View style={styles.verticalSeparator} />
        <KeyButton onPress={onBackspace} onLongPress={onClear}>
          <Feather name="delete" size={24} color="#000" />
        </KeyButton>
      </View>
    </View>
  );
};

const SEPARATOR_COLOR = '#B0B1B8';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E8E8ED',
  },
  operatorRow: {
    flexDirection: 'row',
    height: 42,
    backgroundColor: '#9B9CA1',
  },
  digitRow: {
    flexDirection: 'row',
    height: 58,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: SEPARATOR_COLOR,
  },
  verticalSeparator: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: SEPARATOR_COLOR,
  },
  keyPressable: {
    flex: 1,
  },
  key: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  operatorText: {
    fontSize: 26,
    fontWeight: '500',
    color: '#fff',
  },
  digitText: {
    fontSize: 28,
    fontWeight: '400',
    color: '#000',
  },
});
