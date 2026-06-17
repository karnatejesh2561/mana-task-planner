import { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, View, Platform, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "../theme/ThemeProvider";

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
}>;

export function Screen({ children, scroll = true }: ScreenProps) {
  const { colors } = useAppTheme();
  
  // Custom screen content structure
  const content = <View style={styles.content}>{children}</View>;

  const screenBody = scroll ? (
    <ScrollView 
      showsVerticalScrollIndicator={false} 
      contentContainerStyle={styles.scroll}
      style={{ flex: 1 }}
    >
      {content}
    </ScrollView>
  ) : (
    <View style={{ flex: 1 }}>{content}</View>
  );

  if (Platform.OS === "web") {
    return (
      <View style={styles.webContainer}>
        <View style={[styles.phoneFrame, { borderColor: "#E5E7EB", backgroundColor: "#FFFFFF" }]}>
          {/* Status Bar simulation: white bg, dark text/icons */}
          <View style={styles.statusBarSim}>
            <Text style={styles.statusBarTime}>16:08</Text>
            <View style={styles.statusBarIcons}>
              {/* Cellular Signal Icon */}
              <View style={styles.signalIcon}>
                <View style={[styles.signalBar, { height: 4 }]} />
                <View style={[styles.signalBar, { height: 6 }]} />
                <View style={[styles.signalBar, { height: 8 }]} />
                <View style={[styles.signalBar, { height: 10 }]} />
              </View>
              {/* WiFi Icon (simplified SVG/shapes) */}
              <View style={styles.wifiIcon}>
                <View style={styles.wifiDot} />
              </View>
              {/* Battery Icon */}
              <View style={styles.batteryIcon}>
                <View style={styles.batteryBody} />
                <View style={styles.batteryTip} />
              </View>
            </View>
          </View>
          
          {/* Phone Content viewport */}
          <View style={styles.phoneViewport}>
            {screenBody}
          </View>
          
          {/* Bottom safe area: 34px with Home Indicator */}
          <View style={styles.bottomSafeAreaSim}>
            <View style={styles.homeIndicator} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {screenBody}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1
  },
  scroll: {
    paddingBottom: 40
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 18
  },
  // Web Phone Frame simulation styles
  webContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6", // soft gray background for the workspace
    minHeight: "100%",
    paddingVertical: 40
  },
  phoneFrame: {
    width: 390,
    height: 844,
    borderRadius: 48,
    borderWidth: 2,
    overflow: "hidden",
    shadowColor: "#7C3AED",
    shadowOpacity: 0.15,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 20 },
    position: "relative",
    display: "flex",
    flexDirection: "column"
  },
  statusBarSim: {
    height: 44,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    zIndex: 10
  },
  statusBarTime: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000"
  },
  statusBarIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  signalIcon: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 1.5,
    width: 14,
    height: 10
  },
  signalBar: {
    width: 2,
    backgroundColor: "#000000",
    borderRadius: 0.5
  },
  wifiIcon: {
    width: 12,
    height: 10,
    alignItems: "center",
    justifyContent: "flex-end"
  },
  wifiDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#000000"
  },
  batteryIcon: {
    width: 20,
    height: 10,
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 3,
    padding: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  batteryBody: {
    flex: 1,
    height: "100%",
    backgroundColor: "#000000",
    borderRadius: 1
  },
  batteryTip: {
    width: 1.5,
    height: 4,
    backgroundColor: "#000000",
    borderTopRightRadius: 1,
    borderBottomRightRadius: 1,
    marginLeft: 0.5
  },
  phoneViewport: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  bottomSafeAreaSim: {
    height: 34,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  homeIndicator: {
    width: 120,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#000000"
  }
});
