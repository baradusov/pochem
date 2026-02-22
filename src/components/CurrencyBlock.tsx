import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  LayoutChangeEvent,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import { CurrencyCode } from '../core/entities/Currency';
import { useCurrency } from '../hooks/useCurrency';

interface CurrencyBlockProps {
  currency: CurrencyCode;
  isLast: boolean;
  onPress: (currency: CurrencyCode) => void;
  onCurrencyCodePress: () => void;
  isKeyboardVisible: boolean;
}

const MIN_FONT_SIZE = 24;
const MAX_FONT_SIZE = 100;
const PADDING_HORIZONTAL = 24;

export const CurrencyBlock = observer(function CurrencyBlock({
  currency,
  isLast,
  onPress,
  onCurrencyCodePress,
  isKeyboardVisible,
}: CurrencyBlockProps) {
  const store = useCurrency();
  const isActive = store.activeCurrency === currency;
  const isHighlighted = !isKeyboardVisible || isActive;
  const displayValue = store.formatAmount(currency);

  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [fontSize, setFontSize] = useState(MAX_FONT_SIZE);

  const onContainerLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerWidth(width);
    setContainerHeight(height);
  }, []);

  useEffect(() => {
    if (!containerWidth || !containerHeight) return;

    const text = displayValue || '0';
    const charCount = text.length;
    const availableWidth = containerWidth - PADDING_HORIZONTAL * 2;
    const availableHeight = containerHeight - 80;

    const charWidthRatio = 0.65;
    const maxFontByWidth = availableWidth / (charCount * charWidthRatio);
    const maxFontByHeight = availableHeight * 0.7;

    const optimalSize = Math.min(
      maxFontByWidth,
      maxFontByHeight,
      MAX_FONT_SIZE
    );
    const finalSize = Math.max(MIN_FONT_SIZE, Math.floor(optimalSize));

    setFontSize(finalSize);
  }, [displayValue, containerWidth, containerHeight]);

  const handlePress = () => {
    onPress(currency);
  };

  const showCopy = displayValue !== '' && displayValue !== '0';

  const copyScale = useRef(new Animated.Value(1)).current;

  const handleCopy = () => {
    Animated.sequence([
      Animated.timing(copyScale, {
        toValue: 0.6,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(copyScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    store.copyAmount(currency);
  };

  return (
    <Pressable
      style={[styles.container, !isLast && styles.borderBottom]}
      onPress={handlePress}
      onLayout={onContainerLayout}
    >
      <View style={styles.currencyCodeContainer}>
        <Pressable onPress={onCurrencyCodePress} hitSlop={8}>
          <Text style={styles.currencyCode}>
            {currency}
            <Text style={styles.dropIcon}>⇅</Text>
          </Text>
        </Pressable>
      </View>

      <View style={styles.actionsContainer}>
        {showCopy && (
          <Pressable onPress={handleCopy} hitSlop={8}>
            <Animated.View style={{ transform: [{ scale: copyScale }] }}>
              <Feather name="copy" size={18} color="#999" />
            </Animated.View>
          </Pressable>
        )}
      </View>

      <View style={styles.valueContainer}>
        <Text
          style={[
            styles.valueText,
            { fontSize },
            isHighlighted && styles.activeText,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.3}
        >
          {displayValue || '0'}
        </Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: PADDING_HORIZONTAL,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  currencyCodeContainer: {
    position: 'absolute',
    top: 12,
    right: 16,
  },
  currencyCode: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
  },
  dropIcon: {
    fontSize: 16,
    fontWeight: '200',
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  valueText: {
    fontWeight: '700',
    color: '#999',
    padding: 0,
    margin: 0,
  },
  activeText: {
    color: '#000',
  },
});
