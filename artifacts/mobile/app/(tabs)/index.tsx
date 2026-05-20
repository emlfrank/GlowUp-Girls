import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { CREATORS, USERS } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

export default function ClassesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentUser, setCurrentUser, getMonthlyPoints } = useApp();
  const user = USERS[currentUser];
  const pts = getMonthlyPoints(currentUser);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            paddingTop: Platform.OS === "web" ? 52 : insets.top + 12,
          },
        ]}
      >
        <View>
          <Text style={[styles.appName, { color: colors.text }]}>GlowUp Girls</Text>
          <View style={styles.subtitleRow}>
            <View style={[styles.ruleLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>STUDIO</Text>
            <View style={[styles.ruleLine, { backgroundColor: colors.border }]} />
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.pointsBadge, { backgroundColor: colors.accent + "18", borderColor: colors.accent + "50" }]}>
            <Ionicons name="star" size={12} color={colors.accent} />
            <Text style={[styles.pointsText, { color: colors.accent }]}>{pts} pts</Text>
          </View>
          <Pressable
            style={[styles.userPill, { backgroundColor: user.color + "18", borderColor: user.color + "50" }]}
            onPress={() => setCurrentUser(currentUser === "kelsey" ? "elizabeth" : "kelsey")}
          >
            <Ionicons name="person-circle" size={16} color={user.color} />
            <Text style={[styles.userName, { color: user.color }]}>{user.name}</Text>
            <Ionicons name="chevron-down" size={11} color={user.color} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "web" ? 120 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>CHOOSE A CREATOR</Text>

        {CREATORS.map((creator, idx) => (
          <Pressable
            key={creator.id}
            style={({ pressed }) => [
              styles.creatorCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.88 : 1,
              },
            ]}
            onPress={() => router.push(`/creator/${creator.id}`)}
          >
            {/* Color accent strip */}
            <View style={[styles.accentStrip, { backgroundColor: creator.iconColor }]} />
            <View style={styles.creatorContent}>
              <View style={styles.creatorLeft}>
                <Text style={[styles.creatorIndex, { color: creator.iconColor }]}>
                  {String(idx + 1).padStart(2, "0")}
                </Text>
                <View style={styles.creatorTextBlock}>
                  <Text style={[styles.creatorName, { color: colors.text }]}>{creator.name}</Text>
                  <Text style={[styles.creatorTagline, { color: colors.mutedForeground }]}>
                    {creator.tagline}
                  </Text>
                  <View style={[styles.classCountBadge, { borderColor: creator.iconColor + "40" }]}>
                    <Text style={[styles.classCountText, { color: creator.iconColor }]}>
                      {creator.classes.length} classes
                    </Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.border} />
            </View>
          </Pressable>
        ))}

        {/* Points reminder */}
        <View style={[styles.infoCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={16} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
              Each class earns <Text style={{ color: colors.accent, fontFamily: "Poppins_700Bold" }}>100 pts</Text>.
              Miss a week: <Text style={{ color: colors.destructive, fontFamily: "Poppins_700Bold" }}>−500</Text>.
              Hit your steps goal: <Text style={{ color: colors.secondary, fontFamily: "Poppins_700Bold" }}>+25</Text>.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  appName: { fontSize: 26, fontFamily: "Poppins_700Bold", letterSpacing: 0.5 },
  subtitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  ruleLine: { flex: 1, height: 1 },
  subtitle: { fontSize: 10, fontFamily: "Poppins_600SemiBold", letterSpacing: 3 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8, paddingBottom: 2 },
  pointsBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1,
  },
  pointsText: { fontSize: 12, fontFamily: "Poppins_700Bold" },
  userPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1,
  },
  userName: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  scrollContent: { padding: 20, gap: 12 },
  sectionLabel: { fontSize: 10, fontFamily: "Poppins_700Bold", letterSpacing: 3, marginBottom: 4 },
  creatorCard: {
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  accentStrip: { width: 5 },
  creatorContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 12,
  },
  creatorLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  creatorIndex: { fontSize: 22, fontFamily: "Poppins_700Bold", opacity: 0.35, width: 28 },
  creatorTextBlock: { flex: 1, gap: 3 },
  creatorName: { fontSize: 16, fontFamily: "Poppins_700Bold" },
  creatorTagline: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  classCountBadge: {
    borderWidth: 1, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start", marginTop: 2,
  },
  classCountText: { fontSize: 11, fontFamily: "Poppins_600SemiBold" },
  infoCard: {
    borderRadius: 10, borderWidth: 1, padding: 14, marginTop: 4,
  },
  infoRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  infoText: { fontSize: 12, fontFamily: "Poppins_400Regular", flex: 1, lineHeight: 18 },
});
