import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { observer } from 'mobx-react-lite';
import { CurrencyCode } from '../core/entities/Currency';
import { useCurrency } from '../hooks/useCurrency';
import { useScrubGesture } from '../hooks/useScrubGesture';

interface CurrencyBlockProps {
  currency: CurrencyCode;
  isLast: boolean;
  flex: number;
  fontSize: number;
  onPress: (currency: CurrencyCode) => void;
  onCurrencyCodePress: () => void;
}

export const BLOCK_PADDING_HORIZONTAL = 24;
const HEADER_HEIGHT = 44;
const VALUE_PADDING_BOTTOM = 12;
/** Vertical space in a block not available to the number */
export const BLOCK_CHROME_HEIGHT = HEADER_HEIGHT + VALUE_PADDING_BOTTOM;

export const CurrencyBlock = observer(function CurrencyBlock({
  currency,
  isLast,
  flex,
  fontSize,
  onPress,
  onCurrencyCodePress,
}: CurrencyBlockProps) {
  const store = useCurrency();
  const isActive = store.activeCurrency === currency;
  const isEditingThis = store.isEditing && isActive;
  const displayValue = store.formatAmount(currency);
  const scrubHandlers = useScrubGesture(currency, !store.isEditing);

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isEditingThis) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isEditingThis]);

  const copyScale = useRef(new Animated.Value(1)).current;

  const handleCopy = () => {
    if (!store.hasInput) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    <View
      style={[styles.container, { flex }, !isLast && styles.borderBottom]}
      {...scrubHandlers}
    >
      <Pressable
        style={styles.pressable}
        onPress={() => onPress(currency)}
        onLongPress={handleCopy}
      >
        <View style={styles.header}>
          {store.hasInput && (
            <Pressable onPress={handleCopy} hitSlop={12}>
              <Animated.View style={{ transform: [{ scale: copyScale }] }}>
                <Feather name="copy" size={16} color="#999" />
              </Animated.View>
            </Pressable>
          )}
          <Pressable onPress={onCurrencyCodePress} hitSlop={8}>
            <Text style={styles.currencyCode}>
              {currency}
              <Text style={styles.dropIcon}>⇅</Text>
            </Text>
          </Pressable>
        </View>

        <View style={styles.valueContainer}>
          {isEditingThis ? (
            <TextInput
              ref={inputRef}
              value={displayValue}
              selection={{
                start: store.cursorPosition,
                end: store.cursorPosition,
              }}
              onSelectionChange={(e) =>
                store.moveCursor(e.nativeEvent.selection.start)
              }
              onChangeText={(text) => store.updateInput(text)}
              showSoftInputOnFocus={false}
              inputMode="none"
              contextMenuHidden
              autoCorrect={false}
              spellCheck={false}
              selectionColor="#000"
              underlineColorAndroid="transparent"
              style={[styles.valueText, styles.textInput, { fontSize }]}
            />
          ) : (
            <Text
              style={[
                styles.valueText,
                { fontSize },
                store.isEditing && styles.dimmedText,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.3}
            >
              {displayValue}
            </Text>
          )}
        </View>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  pressable: {
    flex: 1,
    paddingHorizontal: BLOCK_PADDING_HORIZONTAL,
    paddingBottom: VALUE_PADDING_BOTTOM,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 14,
    marginRight: 16 - BLOCK_PADDING_HORIZONTAL,
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
  valueContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  valueText: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    color: '#000',
    padding: 0,
    margin: 0,
  },
  textInput: {
    height: '100%',
  },
  dimmedText: {
    color: '#999',
  },
});
