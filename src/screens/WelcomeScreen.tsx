import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, Pressable, ScrollView, Animated, Dimensions } from "react-native";
import { ArrowRight, Check } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Text as SvgText, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";

import { Screen } from "../components/Screen";
import { useAppTheme } from "../theme/ThemeProvider";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

export function WelcomeScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [activeIndex, setActiveIndex] = useState(0);

  // Floating animations for weightless antigravity feel
  const floatCardY = useRef(new Animated.Value(0)).current;
  const floatDot1Y = useRef(new Animated.Value(0)).current;
  const floatDot2Y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createFloatLoop = (anim: Animated.Value, toValue: number, duration: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue,
            duration,
            useNativeDriver: true
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration,
            useNativeDriver: true
          })
        ])
      ).start();
    };

    createFloatLoop(floatCardY, -8, 2600);
    createFloatLoop(floatDot1Y, 6, 2000);
    createFloatLoop(floatDot2Y, -6, 2300);
  }, [floatCardY, floatDot1Y, floatDot2Y]);

  const handleScroll = (event: any) => {
    const width = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / width);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <Screen scroll={false}>
      {/* Hero illustration zone (top 45% of screen) */}
      <View style={styles.heroZone}>
        {/* Soft radial glow behind cards */}
        <View style={styles.radialGlow} />

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.cardSwiper}
        >
          {/* Card 1: Design Review (Violet theme) */}
          <View style={styles.swiperSlide}>
            <Animated.View style={[styles.cardContainer, { transform: [{ rotate: "-8deg" }, { translateY: floatCardY }] }]}>
              {/* Back card (offset 12px down-right, blurred/low opacity) */}
              <View style={[styles.taskCardBack, { borderColor: colors.cardBorder }]} />
              
              {/* Main task card */}
              <View style={[styles.taskCardFront, { borderColor: colors.cardBorder, shadowColor: colors.accent }]}>
                {/* 1px Gradient accent line on top edge of hero card */}
                <LinearGradient
                  colors={[colors.accent, colors.cyan]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.cardGradientAccent}
                />
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Design Review</Text>
                  <View style={[styles.iconBox, { borderColor: colors.line }]}>
                    <Check color={colors.accent} size={14} strokeWidth={3} />
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <View style={styles.progressTextRow}>
                    <Text style={styles.cardProgressLabel}>Progress</Text>
                    <Text style={styles.cardProgressValue}>70%</Text>
                  </View>
                  <View style={[styles.progressBarTrack, { backgroundColor: colors.line }]}>
                    <LinearGradient
                      colors={[colors.accent, colors.secondary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressBarFill, { width: "70%" }]}
                    />
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Floating accent dots (out-of-phase float animation) */}
            <Animated.View style={[styles.accentDot, { width: 10, height: 10, borderRadius: 5, backgroundColor: "#7C3AED", top: 40, left: 50, transform: [{ translateY: floatDot1Y }] }]} />
            <Animated.View style={[styles.accentDot, { width: 8, height: 8, borderRadius: 4, backgroundColor: "#06B6D4", top: 110, right: 40, transform: [{ translateY: floatDot2Y }] }]} />
            <Animated.View style={[styles.accentDot, { width: 6, height: 6, borderRadius: 3, backgroundColor: "#EC4899", bottom: 40, left: 60, transform: [{ translateY: floatCardY }] }]} />
          </View>

          {/* Card 2: Sprint Planning (Cyan theme) */}
          <View style={styles.swiperSlide}>
            <Animated.View style={[styles.cardContainer, { transform: [{ rotate: "-6deg" }, { translateY: floatCardY }] }]}>
              <View style={[styles.taskCardBack, { borderColor: colors.cardBorder }]} />
              <View style={[styles.taskCardFront, { borderColor: colors.cardBorder, shadowColor: colors.accent1 }]}>
                <LinearGradient
                  colors={[colors.accent1, colors.accent2]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.cardGradientAccent}
                />
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Sprint Planning</Text>
                  <View style={[styles.iconBox, { borderColor: colors.line }]}>
                    <Check color={colors.accent1} size={14} strokeWidth={3} />
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <View style={styles.progressTextRow}>
                    <Text style={styles.cardProgressLabel}>Progress</Text>
                    <Text style={styles.cardProgressValue}>40%</Text>
                  </View>
                  <View style={[styles.progressBarTrack, { backgroundColor: colors.line }]}>
                    <LinearGradient
                      colors={[colors.accent1, colors.accent1Lt]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressBarFill, { width: "40%" }]}
                    />
                  </View>
                </View>
              </View>
            </Animated.View>

            <Animated.View style={[styles.accentDot, { width: 10, height: 10, borderRadius: 5, backgroundColor: "#06B6D4", top: 50, left: 70, transform: [{ translateY: floatDot2Y }] }]} />
            <Animated.View style={[styles.accentDot, { width: 8, height: 8, borderRadius: 4, backgroundColor: "#EC4899", top: 120, right: 30, transform: [{ translateY: floatCardY }] }]} />
            <Animated.View style={[styles.accentDot, { width: 6, height: 6, borderRadius: 3, backgroundColor: "#7C3AED", bottom: 30, left: 40, transform: [{ translateY: floatDot1Y }] }]} />
          </View>

          {/* Card 3: Release Build (Success Emerald theme) */}
          <View style={styles.swiperSlide}>
            <Animated.View style={[styles.cardContainer, { transform: [{ rotate: "-4deg" }, { translateY: floatCardY }] }]}>
              <View style={[styles.taskCardBack, { borderColor: colors.cardBorder }]} />
              <View style={[styles.taskCardFront, { borderColor: colors.cardBorder, shadowColor: colors.success }]}>
                <LinearGradient
                  colors={[colors.success, colors.accent1]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.cardGradientAccent}
                />
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Release Build</Text>
                  <View style={[styles.iconBox, { borderColor: colors.line, backgroundColor: "rgba(16,185,129,0.08)" }]}>
                    <Check color={colors.success} size={14} strokeWidth={3} />
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <View style={styles.progressTextRow}>
                    <Text style={styles.cardProgressLabel}>Progress</Text>
                    <Text style={styles.cardProgressValue}>100%</Text>
                  </View>
                  <View style={[styles.progressBarTrack, { backgroundColor: colors.line }]}>
                    <LinearGradient
                      colors={[colors.success, "#34D399"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressBarFill, { width: "100%" }]}
                    />
                  </View>
                </View>
              </View>
            </Animated.View>

            <Animated.View style={[styles.accentDot, { width: 10, height: 10, borderRadius: 5, backgroundColor: "#10B981", top: 40, left: 60, transform: [{ translateY: floatDot1Y }] }]} />
            <Animated.View style={[styles.accentDot, { width: 8, height: 8, borderRadius: 4, backgroundColor: "#7C3AED", top: 130, right: 50, transform: [{ translateY: floatDot2Y }] }]} />
            <Animated.View style={[styles.accentDot, { width: 6, height: 6, borderRadius: 3, backgroundColor: "#06B6D4", bottom: 45, left: 50, transform: [{ translateY: floatCardY }] }]} />
          </View>
        </ScrollView>
      </View>

      {/* Content zone (bottom 55%) */}
      <View style={styles.contentZone}>
        {/* Pill Label */}
        <View style={styles.pillLabelContainer}>
          <View style={[styles.pillLabel, { backgroundColor: "rgba(124,58,237,0.1)" }]}>
            <Text style={[styles.pillLabelText, { color: colors.accent }]}>GET STARTED</Text>
          </View>
        </View>

        {/* Headline */}
        <View style={styles.headlineContainer}>
          <Text style={styles.headlineLine1}>Organise</Text>
          <View style={styles.gradientTextWrapper}>
            <Svg height="40" width="310">
              <Defs>
                <SvgGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#7C3AED" />
                  <Stop offset="100%" stopColor="#06B6D4" />
                </SvgGradient>
              </Defs>
              <SvgText
                fill="url(#textGrad)"
                fontSize="28"
                fontWeight="800"
                x="0"
                y="30"
                fontFamily="Inter"
              >
                your life
              </SvgText>
            </Svg>
          </View>
        </View>

        {/* Body Copy */}
        <Text style={styles.bodyCopy}>
          Tasks, reminders, streaks and stats — all in one beautiful space.
        </Text>

        {/* Page indicator dots */}
        <View style={styles.pageDotsContainer}>
          {[0, 1, 2].map((idx) => (
            <View
              key={idx}
              style={[
                styles.pageDot,
                idx === activeIndex
                  ? [styles.pageDotActive, { backgroundColor: colors.accent }]
                  : { backgroundColor: "#E5E7EB" }
              ]}
            />
          ))}
        </View>

        {/* CTA Button */}
        <Pressable
          onPress={() => navigation.navigate("Login")}
          style={({ pressed }) => [
            styles.ctaButton,
            {
              transform: [{ scale: pressed ? 1.01 : 1 }],
              shadowColor: colors.accent
            }
          ]}
        >
          <LinearGradient
            colors={["#7C3AED", "#9333EA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>Get Started</Text>
            <View style={styles.arrowCircle}>
              <ArrowRight color="#7C3AED" size={16} strokeWidth={3} />
            </View>
          </LinearGradient>
        </Pressable>

        {/* Secondary Link */}
        <Pressable 
          onPress={() => navigation.navigate("Login")} 
          style={styles.secondaryLink}
        >
          <Text style={[styles.secondaryLinkText, { color: colors.accent }]}>
            I already have an account
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroZone: {
    height: "45%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden"
  },
  radialGlow: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(124,58,237,0.07)",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -150 }, { translateY: -150 }],
    zIndex: 1
  },
  cardSwiper: {
    flex: 1,
    zIndex: 5
  },
  swiperSlide: {
    width: 350, // width matches content width inside frame
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  cardContainer: {
    width: 280,
    height: 160,
    position: "relative"
  },
  taskCardBack: {
    width: 280,
    height: 160,
    borderRadius: 20,
    backgroundColor: "#F8F7FF",
    borderWidth: 1,
    position: "absolute",
    top: 12,
    left: 12,
    opacity: 0.7,
    zIndex: 1
  },
  taskCardFront: {
    width: 280,
    height: 160,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    padding: 18,
    justifyContent: "space-between",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 2,
    // Floating premium card shadow
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: "hidden"
  },
  cardGradientAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  cardTitle: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1040"
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  cardFooter: {
    gap: 8
  },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  cardProgressLabel: {
    fontFamily: "Inter",
    fontSize: 11,
    fontWeight: "500",
    color: "#6B7280"
  },
  cardProgressValue: {
    fontFamily: "Inter",
    fontSize: 11,
    fontWeight: "700",
    color: "#7C3AED"
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    width: "100%",
    overflow: "hidden"
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3
  },
  accentDot: {
    position: "absolute",
    zIndex: 3
  },
  contentZone: {
    height: "55%",
    paddingHorizontal: 12,
    justifyContent: "space-between",
    paddingBottom: 16
  },
  pillLabelContainer: {
    alignItems: "flex-start"
  },
  pillLabel: {
    borderRadius: 30,
    paddingHorizontal: 14,
    paddingVertical: 6
  },
  pillLabelText: {
    fontFamily: "Inter",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8
  },
  headlineContainer: {
    gap: 0,
    marginTop: 8
  },
  headlineLine1: {
    fontFamily: "Inter",
    fontSize: 28,
    fontWeight: "800",
    color: "#0F0A1E",
    lineHeight: 34
  },
  gradientTextWrapper: {
    height: 38,
    justifyContent: "center"
  },
  bodyCopy: {
    fontFamily: "Inter",
    fontSize: 13,
    lineHeight: 22,
    fontWeight: "400",
    color: "#6B7280",
    marginTop: 8
  },
  pageDotsContainer: {
    flexDirection: "row",
    gap: 6,
    marginVertical: 16,
    alignItems: "center"
  },
  pageDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  pageDotActive: {
    width: 20,
    height: 6,
    borderRadius: 3
  },
  ctaButton: {
    height: 54,
    borderRadius: 16,
    overflow: "hidden",
    shadowOpacity: 0.35,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    marginTop: 10
  },
  ctaGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20
  },
  ctaText: {
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF"
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  secondaryLink: {
    alignItems: "center",
    marginTop: 14,
    marginBottom: 4
  },
  secondaryLinkText: {
    fontFamily: "Inter",
    fontSize: 13,
    fontWeight: "500"
  }
});
