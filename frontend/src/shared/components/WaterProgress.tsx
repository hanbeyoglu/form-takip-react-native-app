import React from "react";
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  StyleSheet,
  UIManager,
  View
} from "react-native";

import { colors, radius, shadows } from "../../theme/tokens";

let SvgModule:
  | {
      Svg?: React.ComponentType<any>;
      Path?: React.ComponentType<any>;
    }
  | null = null;

try {
  SvgModule = require("react-native-svg") as {
    Svg?: React.ComponentType<any>;
    Path?: React.ComponentType<any>;
  };
} catch {
  SvgModule = null;
}

const SvgComponent = SvgModule?.Svg;
const PathComponent = SvgModule?.Path;
const HAS_SVG_JS = Boolean(SvgComponent && PathComponent);
const HAS_SVG_NATIVE = Boolean(
  typeof UIManager.getViewManagerConfig === "function" &&
    UIManager.getViewManagerConfig("RNSVGPath")
);
const HAS_SVG = HAS_SVG_JS && HAS_SVG_NATIVE;
const COMPONENT_HEIGHT = 26;
const WAVE_HEIGHT = 18;
const EXTRA_WAVE_DEPTH = 56;

type WaterProgressProps = {
  progress: number;
  variant?: "default" | "hero";
};

function buildWavePath(
  width: number,
  baseline: number,
  amplitude: number,
  totalHeight: number,
  phaseShift = 0
): string {
  const safeWidth = Math.max(width, 1);
  const step = safeWidth / 4;
  let path = `M ${phaseShift} ${baseline}`;

  for (let index = 0; index < 4; index += 1) {
    const startX = phaseShift + index * step;
    const midX = startX + step / 2;
    const endX = startX + step;
    const crestY = baseline - amplitude;
    const troughY = baseline + amplitude * 0.68;

    path += ` C ${startX + step * 0.18} ${crestY} ${midX - step * 0.12} ${crestY} ${midX} ${baseline}`;
    path += ` C ${midX + step * 0.12} ${troughY} ${endX - step * 0.18} ${troughY} ${endX} ${baseline}`;
  }

  path += ` L ${phaseShift + safeWidth} ${totalHeight} L ${phaseShift} ${totalHeight} Z`;
  return path;
}

export function WaterProgress({
  progress,
  variant = "default"
}: WaterProgressProps): React.JSX.Element {
  const safeProgress = Math.max(0, Math.min(100, progress));
  const progressRatio = safeProgress / 100;
  const isHero = variant === "hero";
  const componentHeight = isHero ? 38 : COMPONENT_HEIGHT;
  const waveHeight = isHero ? 24 : WAVE_HEIGHT;
  const extraWaveDepth = isHero ? 74 : EXTRA_WAVE_DEPTH;
  const [width, setWidth] = React.useState(0);
  const waveX = React.useRef(new Animated.Value(0)).current;
  const waveY = React.useRef(new Animated.Value(0)).current;
  const levelTranslateY = React.useRef(new Animated.Value(componentHeight)).current;
  const isComplete = safeProgress >= 100;

  React.useEffect(() => {
    const calmFactor = isComplete ? 1.28 : 1;
    const horizontalLoop = Animated.loop(
      Animated.timing(waveX, {
        toValue: -1,
        duration: (isHero ? 4200 : 3600) * calmFactor,
        easing: Easing.linear,
        useNativeDriver: true
      })
    );

    const verticalLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(waveY, {
          toValue: isComplete ? (isHero ? -1 : -0.6) : isHero ? -3 : -2,
          duration: (isHero ? 1700 : 1500) * calmFactor,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(waveY, {
          toValue: 0,
          duration: (isHero ? 1700 : 1500) * calmFactor,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    );

    horizontalLoop.start();
    verticalLoop.start();

    return () => {
      horizontalLoop.stop();
      verticalLoop.stop();
    };
  }, [isComplete, waveX, waveY]);

  React.useEffect(() => {
    Animated.timing(levelTranslateY, {
      toValue: (1 - progressRatio) * componentHeight,
      duration: 900,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: true
    }).start();
  }, [componentHeight, levelTranslateY, progressRatio]);

  const handleLayout = React.useCallback((event: LayoutChangeEvent): void => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth > 0 && nextWidth !== width) {
      setWidth(nextWidth);
      waveX.setValue(0);
    }
  }, [waveX, width]);

  const animatedWaveX = width
    ? waveX.interpolate({
        inputRange: [-1, 0],
        outputRange: [-width, 0]
      })
    : 0;

  const waveBaseline = waveHeight;
  const svgHeight = componentHeight + extraWaveDepth;
  const waveWidth = width > 0 ? width * 2 : 0;
  const primaryWavePath = waveWidth
    ? buildWavePath(waveWidth, waveBaseline, isComplete ? (isHero ? 4.2 : 4) : isHero ? 7 : 6, svgHeight)
    : "";
  const secondaryWavePath = waveWidth
    ? buildWavePath(
        waveWidth,
        waveBaseline + (isHero ? 3 : 2),
        isComplete ? (isHero ? 3.2 : 3) : isHero ? 5.2 : 4.5,
        svgHeight,
        -width / 6
      )
    : "";

  return (
    <View
      style={[
        styles.track,
        isHero ? styles.trackHero : null,
        isComplete ? styles.trackComplete : null
      ]}
      onLayout={handleLayout}
    >
      <View style={styles.backdropLayer} />
      <Animated.View
        style={[
          styles.waterLayer,
          isHero ? styles.waterLayerHero : null,
          isComplete ? styles.waterLayerComplete : null,
          { transform: [{ translateY: levelTranslateY }] }
        ]}
      >
        <View style={styles.waterBase} />
        <View style={styles.waterAuraPrimary} />
        <View style={styles.waterAuraSecondary} />
        <View style={styles.waterTint} />

        {HAS_SVG && SvgComponent && PathComponent && width > 0 ? (
          <>
            <Animated.View
              style={[
                styles.waveAnimated,
                isHero ? styles.waveAnimatedHero : null,
                {
                  width: waveWidth,
                  transform: [{ translateX: animatedWaveX as never }, { translateY: waveY }]
                }
              ]}
            >
              <SvgComponent width={waveWidth} height={svgHeight} viewBox={`0 0 ${waveWidth} ${svgHeight}`}>
                <PathComponent d={secondaryWavePath} fill="rgba(176, 219, 255, 0.42)" />
                <PathComponent d={primaryWavePath} fill="rgba(120, 196, 255, 0.88)" />
              </SvgComponent>
            </Animated.View>
            <Animated.View
              style={[
                styles.waveAnimated,
                styles.waveSecondary,
                isHero ? styles.waveAnimatedHero : null,
                {
                  width: waveWidth,
                  transform: [
                    {
                      translateX: Animated.add(animatedWaveX as Animated.AnimatedInterpolation<number>, new Animated.Value(width * 0.22))
                    },
                    { translateY: Animated.multiply(waveY, 0.6) }
                  ]
                }
              ]}
            >
              <SvgComponent width={waveWidth} height={svgHeight} viewBox={`0 0 ${waveWidth} ${svgHeight}`}>
                <PathComponent d={secondaryWavePath} fill="rgba(255,255,255,0.18)" />
              </SvgComponent>
            </Animated.View>
          </>
        ) : (
          <>
            <Animated.View
              style={[
                styles.fallbackWave,
                isHero ? styles.fallbackWaveHero : null,
                {
                  transform: [{ translateX: animatedWaveX as never }, { translateY: waveY }]
                }
              ]}
            />
            <Animated.View
              style={[
                styles.fallbackWave,
                styles.fallbackWaveSecondary,
                isHero ? styles.fallbackWaveHeroSecondary : null,
                {
                  transform: [{ translateX: animatedWaveX as never }, { translateY: Animated.multiply(waveY, 0.6) }]
                }
              ]}
            />
          </>
        )}

        <View style={styles.waterGloss} />
      </Animated.View>
      <View style={styles.surfaceGloss} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: COMPONENT_HEIGHT,
    borderRadius: radius.pill,
    overflow: "hidden",
    backgroundColor: "rgba(223, 229, 242, 0.62)",
    borderWidth: 1,
    borderColor: "rgba(223, 229, 242, 0.82)",
    ...shadows.shadowSmall
  },
  trackHero: {
    height: 38,
    borderWidth: 1,
    borderColor: "rgba(122, 140, 255, 0.18)",
    backgroundColor: "rgba(234, 239, 253, 0.78)",
    shadowColor: colors.primaryGlow,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4
  },
  trackComplete: {
    shadowColor: colors.primaryGlow,
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 4
  },
  backdropLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.18)"
  },
  waterLayer: {
    ...StyleSheet.absoluteFillObject
  },
  waterLayerHero: {
    shadowColor: colors.primaryGlow,
    shadowOpacity: 0.12,
    shadowRadius: 12
  },
  waterLayerComplete: {
    opacity: 0.98
  },
  waterBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#77C7FF"
  },
  waterAuraPrimary: {
    position: "absolute",
    left: -12,
    right: "28%",
    bottom: -8,
    top: 0,
    borderRadius: radius.xl,
    backgroundColor: "rgba(166, 222, 255, 0.55)"
  },
  waterAuraSecondary: {
    position: "absolute",
    right: -14,
    width: "48%",
    top: 2,
    bottom: -6,
    borderRadius: radius.xl,
    backgroundColor: "rgba(84, 93, 223, 0.34)"
  },
  waterTint: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: "48%",
    backgroundColor: "rgba(67, 89, 210, 0.16)"
  },
  waveAnimated: {
    position: "absolute",
    top: -WAVE_HEIGHT + 2,
    left: 0
  },
  waveAnimatedHero: {
    top: -20
  },
  waveSecondary: {
    opacity: 0.9
  },
  fallbackWave: {
    position: "absolute",
    top: -6,
    left: "-50%",
    width: "200%",
    height: 16,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.2)"
  },
  fallbackWaveHero: {
    top: -10,
    height: 22,
    backgroundColor: "rgba(255,255,255,0.26)"
  },
  fallbackWaveSecondary: {
    top: -2,
    height: 12,
    backgroundColor: "rgba(195, 232, 255, 0.22)"
  },
  fallbackWaveHeroSecondary: {
    top: -4,
    height: 16,
    backgroundColor: "rgba(215, 242, 255, 0.24)"
  },
  waterGloss: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "42%",
    backgroundColor: "rgba(255,255,255,0.16)"
  },
  surfaceGloss: {
    position: "absolute",
    top: 1,
    left: 10,
    right: 10,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.3)"
  }
});
