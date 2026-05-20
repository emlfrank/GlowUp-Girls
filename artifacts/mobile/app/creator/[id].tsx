import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { daysUntilNextMonday, getCreatorById, getWeeklyClasses } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

const LEVEL_COLORS: Record<string, string> = {
  Beginner: "#4D8E89",
  Intermediate: "#BF6375",
  Advanced: "#8B7DB0",
};

export default function CreatorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const creator = getCreatorById(id ?? "");
  const [showAll, setShowAll] = useState(false);

  if (!creator) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.text }]}>Creator not found</Text>
      </View>
    );
  }

  const daysLeft = daysUntilNextMonday();
  const weeklyClasses = getWeeklyClasses(creator);
  const displayedClasses = showAll ? creator.classes : weeklyClasses;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Flat tinted header instead of gradient */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: creator.iconColor + "18",
            borderBottomColor: creator.iconColor + "40",
            paddingTop: Platform.OS === "web" ? 80 : insets.top + 60,
          },
        ]}
      >
        <View style={[styles.handlePill, { borderColor: creator.iconColor + "40" }]}>
          <Text style={[styles.creatorHandle, { color: creator.iconColor }]}>{creator.handle}</Text>
        </View>
        <Text style={[styles.creatorName, { color: colors.text }]}>{creator.name}</Text>
        <Text style={[styles.creatorTagline, { color: colors.mutedForeground }]}>{creator.tagline}</Text>
        <View style={styles.headerBadgesRow}>
          <View style={[styles.classBadge, { borderColor: creator.iconColor + "40", backgroundColor: colors.card }]}>
            <Ionicons name="play-circle" size={12} color={creator.iconColor} />
            <Text style={[styles.classBadgeText, { color: creator.iconColor }]}>{creator.classes.length} classes</Text>
          </View>
          <View style={[styles.classBadge, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Ionicons name="refresh" size={12} color={colors.mutedForeground} />
            <Text style={[styles.classBadgeText, { color: colors.mutedForeground }]}>
              Refreshes in {daysLeft} {daysLeft === 1 ? "day" : "days"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Platform.OS === "web" ? 120 : 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Toggle */}
        <View style={[styles.toggleRow, { backgroundColor: colors.muted }]}>
          <Pressable
            style={[styles.toggleBtn, !showAll && { backgroundColor: colors.card }]}
            onPress={() => setShowAll(false)}
          >
            <Ionicons name="star" size={12} color={!showAll ? colors.primary : colors.mutedForeground} />
            <Text style={[styles.toggleText, { color: !showAll ? colors.primary : colors.mutedForeground }]}>
              This Week
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, showAll && { backgroundColor: colors.card }]}
            onPress={() => setShowAll(true)}
          >
            <Ionicons name="grid-outline" size={12} color={showAll ? colors.primary : colors.mutedForeground} />
            <Text style={[styles.toggleText, { color: showAll ? colors.primary : colors.mutedForeground }]}>
              All {creator.classes.length}
            </Text>
          </Pressable>
        </View>

        {!showAll && (
          <View style={[styles.weekBanner, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Ionicons name="calendar-outline" size={13} color={colors.mutedForeground} />
            <Text style={[styles.weekBannerText, { color: colors.mutedForeground }]}>
              {weeklyClasses.length} of {creator.classes.length} classes this week — refreshes every Monday
            </Text>
          </View>
        )}

        {displayedClasses.map((cls, idx) => (
          <Pressable
            key={cls.id}
            style={({ pressed }) => [
              styles.classCard,
              { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() => router.push(`/class/${cls.id}`)}
          >
            {/* Left accent */}
            <View style={[styles.classAccent, { backgroundColor: creator.iconColor }]} />
            <View style={styles.classCardInner}>
              <View style={styles.classTop}>
                <View style={styles.classLeft}>
                  <Text style={[styles.classIndex, { color: creator.iconColor }]}>
                    {String(idx + 1).padStart(2, "0")}
                  </Text>
                  <View style={styles.classTextBlock}>
                    <Text style={[styles.className, { color: colors.text }]}>{cls.name}</Text>
                    <View style={styles.classMeta}>
                      <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLORS[cls.level] + "18", borderColor: LEVEL_COLORS[cls.level] + "40" }]}>
                        <Text style={[styles.levelText, { color: LEVEL_COLORS[cls.level] }]}>{cls.level}</Text>
                      </View>
                      <View style={styles.durationRow}>
                        <Ionicons name="time-outline" size={11} color={colors.mutedForeground} />
                        <Text style={[styles.durationText, { color: colors.mutedForeground }]}>{cls.duration} min</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.classRight}>
                  <View style={[styles.ptsTag, { backgroundColor: colors.accent + "15", borderColor: colors.accent + "40" }]}>
                    <Ionicons name="star" size={10} color={colors.accent} />
                    <Text style={[styles.ptsText, { color: colors.accent }]}>100</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.border} />
                </View>
              </View>
              <Text style={[styles.classDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
                {cls.description}
              </Text>
              <Pressable
                style={[styles.youtubeBtn, { backgroundColor: "#FF000010", borderColor: "#FF000025" }]}
                onPress={(e) => { e.stopPropagation(); Linking.openURL(cls.youtubeUrl); }}
                hitSlop={4}
              >
                <Ionicons name="logo-youtube" size={12} color="#FF0000" />
                <Text style={[styles.youtubeBtnText, { color: "#FF0000" }]}>Watch on YouTube</Text>
                <Ionicons name="open-outline" size={11} color="#FF000099" />
              </Pressable>
            </View>
          </Pressable>
        ))}

        {/* Choose Your Own Video */}
        <Pressable
          style={({ pressed }) => [
            styles.customCard,
            { borderColor: colors.accent + "50", backgroundColor: colors.card, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={() => router.push(`/custom-class/${creator.id}`)}
        >
          <View style={[styles.customIcon, { backgroundColor: colors.accent + "20" }]}>
            <Ionicons name="search" size={22} color={colors.accent} />
          </View>
          <View style={styles.customText}>
            <Text style={[styles.customTitle, { color: colors.text }]}>Choose Your Own Video</Text>
            <Text style={[styles.customSubtitle, { color: colors.mutedForeground }]}>
              Paste any {creator.name} YouTube link and book a time for it
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.accent} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFound: { fontSize: 18, fontFamily: "Poppins_600SemiBold" },
  header: { paddingHorizontal: 20, paddingBottom: 20, gap: 6, borderBottomWidth: 1 },
  handlePill: {
    alignSelf: "flex-start", borderWidth: 1, borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  creatorHandle: { fontSize: 11, fontFamily: "Poppins_600SemiBold", letterSpacing: 1 },
  creatorName: { fontSize: 24, fontFamily: "Poppins_700Bold", letterSpacing: -0.3 },
  creatorTagline: { fontSize: 14, fontFamily: "Poppins_400Regular" },
  headerBadgesRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  classBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  classBadgeText: { fontSize: 11, fontFamily: "Poppins_600SemiBold" },
  scrollContent: { padding: 16, gap: 10 },
  toggleRow: { flexDirection: "row", borderRadius: 8, padding: 3, gap: 3 },
  toggleBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 9, borderRadius: 6 },
  toggleText: { fontSize: 12, fontFamily: "Poppins_700Bold" },
  weekBanner: {
    flexDirection: "row", alignItems: "center", gap: 7,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1,
  },
  weekBannerText: { fontSize: 11, fontFamily: "Poppins_400Regular", flex: 1 },
  classCard: {
    borderRadius: 10, borderWidth: 1, flexDirection: "row", overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  classAccent: { width: 4 },
  classCardInner: { flex: 1, padding: 14, gap: 8 },
  classTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  classLeft: { flex: 1, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  classIndex: { fontSize: 13, fontFamily: "Poppins_700Bold", opacity: 0.5, marginTop: 2, width: 24 },
  classTextBlock: { flex: 1, gap: 5 },
  className: { fontSize: 15, fontFamily: "Poppins_700Bold" },
  classMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  levelBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  levelText: { fontSize: 10, fontFamily: "Poppins_700Bold" },
  durationRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  durationText: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  classDesc: { fontSize: 12, fontFamily: "Poppins_400Regular", lineHeight: 17 },
  classRight: { alignItems: "center", gap: 4, marginLeft: 8 },
  ptsTag: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  ptsText: { fontSize: 11, fontFamily: "Poppins_700Bold" },
  youtubeBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, alignSelf: "flex-start",
  },
  youtubeBtnText: { fontSize: 11, fontFamily: "Poppins_600SemiBold" },
  customCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderRadius: 10, borderWidth: 1.5, borderStyle: "dashed", padding: 16,
  },
  customIcon: { width: 44, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  customText: { flex: 1, gap: 3 },
  customTitle: { fontSize: 15, fontFamily: "Poppins_700Bold" },
  customSubtitle: { fontSize: 12, fontFamily: "Poppins_400Regular", lineHeight: 16 },
});
