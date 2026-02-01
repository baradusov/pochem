import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { CurrencyCode } from '../core/entities/Currency';
import { useCurrency } from '../hooks/useCurrency';

interface CurrencyBlockProps {
  currency: CurrencyCode;
  isLast: boolean;
  onPress: (currency: CurrencyCode) => void;
  onCurrencyCodePress: () => void;
  onClear: () => void;
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
  onClear,
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

  const handleClear = () => {
    onClear();
  };

  const showClear = isActive && isKeyboardVisible && displayValue !== '';

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

      {showClear && (
        <View style={styles.clearContainer}>
          <Pressable onPress={handleClear} hitSlop={8}>
            <Text style={styles.clearIcon}>×</Text>
          </Pressable>
        </View>
      )}

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
  clearContainer: {
    position: 'absolute',
    bottom: 12,
    right: 16,
  },
  clearIcon: {
    fontSize: 26,
    color: '#999',
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
