import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useRef } from "react";
import { StyleSheet, Text, View, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Check } from "lucide-react-native";

import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

export function SplashScreen({ navigation }: Props) {
  // Navigation timer to go to Welcome screen after 3.0s (to let the user admire the UI)
  useEffect(() => {
    const timer = setTimeout(() => navigation.replace("Welcome"), 3000);
    return () => clearTimeout(timer);
  }, [navigation]);

  // Loading dots animation values
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true
          })
        ])
      ).start();
    };

    animateDot(dot1Opacity, 0);
    animateDot(dot2Opacity, 200);
    animateDot(dot3Opacity, 400);
  }, [dot1Opacity, dot2Opacity, dot3Opacity]);

  return (
    <View style={styles.wrap}>
      {/* Ambient background glow (very subtle violet radial gradient bleeding outward) */}
      <View style={styles.ambientGlow} />

      {/* Rings & Logo Area */}
      <View style={styles.centerContainer}>
        {/* Concentric rings (perfectly concentric around logo) */}
        <View style={[styles.ring, { width: 180, height: 180, borderRadius: 90, borderColor: "#EDE9FE" }]} />
        <View style={[styles.ring, { width: 130, height: 130, borderRadius: 65, borderColor: "#DDD6FE" }]} />
        <View style={[styles.ring, { width: 80, height: 80, borderRadius: 40, borderColor: "#C4B5FD" }]} />

        {/* Logo container (perfectly centered) */}
        <LinearGradient
          colors={["#7C3AED", "#06B6D4"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoContainer}
        >
          {/* Inner white box with violet checkmark for premium contrast */}
          <View style={styles.innerBox}>
            <Check color="#7C3AED" size={22} strokeWidth={3.5} />
          </View>
        </LinearGradient>
      </View>

      {/* Brand & Tagline stack */}
      <View style={styles.textContainer}>
        <Text style={styles.brandName}>ManaTask</Text>
        <Text style={styles.tagline}>YOUR PRODUCTIVITY HUB</Text>
      </View>

      {/* Animated loading dots */}
      <View style={styles.loadingContainer}>
        <Animated.View style={[styles.dot, { opacity: dot1Opacity, backgroundColor: "#7C3AED" }]} />
        <Animated.View style={[styles.dot, { opacity: dot2Opacity, backgroundColor: "#A78BFA" }]} />
        <Animated.View style={[styles.dot, { opacity: dot3Opacity, backgroundColor: "#DDD6FE" }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    position: "relative"
  },
  ambientGlow: {
    position: "absolute",
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: "rgba(124, 58, 237, 0.04)",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -300 }, { translateY: -300 }]
  },
  centerContainer: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  ring: {
    position: "absolute",
    borderWidth: 1.5,
    backgroundColor: "transparent"
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
    // Floating antigravity shadow on logo
    shadowColor: "#7C3AED",
    shadowOpacity: 0.35,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8
  },
  innerBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }
  },
  textContainer: {
    alignItems: "center",
    marginTop: 20,
    gap: 6
  },
  brandName: {
    fontFamily: "Inter",
    fontSize: 24,
    fontWeight: "800",
    color: "#0F0A1E",
    letterSpacing: -0.5
  },
  tagline: {
    fontFamily: "Inter",
    fontSize: 9,
    fontWeight: "600",
    color: "#A78BFA",
    letterSpacing: 1.26 // 0.14em of 9px is 1.26px
  },
  loadingContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 32,
    alignItems: "center",
    justifyContent: "center"
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3
  }
});
