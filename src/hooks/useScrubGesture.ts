import { useEffect, useRef } from 'react';
import { GestureResponderHandlers, PanResponder } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CurrencyCode } from '../core/entities/Currency';
import { useCurrency } from './useCurrency';

const SCRUB_START_PX = 10;
const SCRUB_STEP_PX = 20;

/**
 * Horizontal drag on a number walks it through nice amounts,
 * one haptic tick per step. Vertical movement is left alone.
 */
export const useScrubGesture = (
  currency: CurrencyCode,
  enabled: boolean
): GestureResponderHandlers => {
  const store = useCurrency();
  const enabledRef = useRef(enabled);
  const lastSteps = useRef(0);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        enabledRef.current &&
        Math.abs(dx) > SCRUB_START_PX &&
        Math.abs(dx) > Math.abs(dy) * 2,
      onPanResponderGrant: () => {
        lastSteps.current = 0;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        store.beginScrub(currency);
      },
      onPanResponderMove: (_, { dx }) => {
        const steps = Math.trunc(dx / SCRUB_STEP_PX);
        if (steps === lastSteps.current) return;
        lastSteps.current = steps;
        Haptics.selectionAsync();
        store.scrub(steps);
      },
      onPanResponderRelease: () => store.endScrub(),
      onPanResponderTerminate: () => store.endScrub(),
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  return panResponder.panHandlers;
};
