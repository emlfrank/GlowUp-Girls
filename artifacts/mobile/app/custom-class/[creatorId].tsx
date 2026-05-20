import { Ionicons } from "@expo/vector-icons";
import * as Calendar from "expo-calendar";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import {
  displayDate,
  extractYouTubeId,
  formatDate,
  getCreatorById,
  getNext7Days,
  getYouTubeThumbnail,
  TIME_SLOTS,
  USERS,
} from "@/constants/data";
import { useColors } from "@/hooks/useColors";

const DURATIONS = [10, 15, 20, 25, 30, 35, 40, 45, 60];

async function addToDeviceCalendar(
  title: string,
  dateStr: string,
  timeStr: string,
  notes: string
): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== "granted") return false;
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const cal =
      calendars.find((c) => c.allowsModifications && c.source?.isLocalAccount) ||
      calendars.find((c) => c.allowsModifications) ||
      calendars[0];
    if (!cal) return false;
    const [timePart, ampm] = timeStr.split(" ");
    const [h, m] = timePart.split(":").map(Number);
    let hours = h;
    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    const startDate = new Date(dateStr + "T12:00:00");
    startDate.setHours(hours, m || 0, 0, 0);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    await Calendar.createEventAsync(cal.id, {
      title: `GlowUp: ${title}`,
      startDate,
      endDate,
      notes,
      alarms: [{ relativeOffset: -15 }],
    });
    return true;
  } catch {
    return false;
  }
}

export default function CustomClassScreen() {
  const { creatorId } = useLocalSearchParams<{ creatorId: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentUser, addBooking, addCustomClass, isSlotBooked, markCalendarAdded } = useApp();

  const creator = getCreatorById(creatorId ?? "");
  const user = USERS[currentUser];
  const days = getNext7Days();

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [className, setClassName] = useState("");
  const [duration, setDuration] = useState(30);
  const [selectedDate, setSelectedDate] = useState(formatDate(days[0]));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleUrlChange = (text: string) => {
    setYoutubeUrl(text);
    const id = extractYouTubeId(text.trim());
    setVideoId(id);
  };

  const handleBook = async () => {
    if (!videoId) {
      Alert.alert("Invalid URL", "Please paste a valid YouTube video link.");
      return;
    }
    if (!selectedTime) {
      Alert.alert("Select a time", "Please pick a time slot to book this class.");
      return;
    }

    const finalName = className.trim() || `${creator?.name ?? "Custom"} Class`;
    const finalUrl = `https://www.youtube.com/watch?v=${videoId}`;

    const customCls = addCustomClass({
      creatorId: creatorId ?? "",
      creatorName: creator?.name ?? "Custom",
      name: finalName,
      duration,
      youtubeUrl: finalUrl,
      videoId,
      createdBy: currentUser,
    });

    const booking = addBooking({
      classId: customCls.id,
      creatorId: creatorId ?? "",
      className: finalName,
      creatorName: creator?.name ?? "Custom",
      userId: currentUser,
      date: selectedDate,
      time: selectedTime,
      isCustom: true,
      youtubeUrl: finalUrl,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (Platform.OS !== "web") {
      Alert.alert(
        "Class Booked!",
        `${finalName} on ${displayDate(selectedDate)} at ${selectedTime}.\n\n$5 added to your prize pot!\n\nAdd to your calendar?`,
        [
          { text: "Skip", style: "cancel" },
          {
            text: "Add to Calendar",
            onPress: async () => {
              const ok = await addToDeviceCalendar(
                finalName,
                selectedDate,
                selectedTime,
                `${creator?.name ?? "Custom"} · ${duration} min · YouTube`
              );
              if (ok) markCalendarAdded(booking.id);
              Alert.alert(ok ? "Added!" : "Couldn't add", ok ? "Class added to your calendar." : "Please add manually.");
            },
          },
        ]
      );
    } else {
      Alert.alert("Class Booked!", `${finalName} on ${displayDate(selectedDate)} at ${selectedTime}.\n\n$5 added to your prize pot!`);
    }

    setTimeout(() => router.back(), 300);
  };

  if (!creator) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Creator not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={creator.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroHeader, { paddingTop: Platform.OS === "web" ? 80 : insets.top + 60 }]}
      >
        <View style={[styles.customIconBig, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
          <Ionicons name="logo-youtube" size={32} color="#fff" />
        </View>
        <Text style={styles.heroTitle}>Choose Your Own Video</Text>
        <Text style={styles.heroSub}>{creator.name}</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "web" ? 160 : 140 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* YouTube URL input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>YouTube Video Link</Text>
          <Text style={[styles.labelHint, { color: colors.mutedForeground }]}>
            Paste any YouTube video URL from {creator.name}
          </Text>
          <View
            style={[
              styles.urlInputRow,
              {
                borderColor: videoId ? "#4CAF50" : youtubeUrl.length > 5 ? colors.destructive + "80" : colors.border,
                backgroundColor: colors.card,
              },
            ]}
          >
            <Ionicons
              name="logo-youtube"
              size={20}
              color={videoId ? "#4CAF50" : "#FF0000"}
              style={styles.urlIcon}
            />
            <TextInput
              style={[styles.urlInput, { color: colors.text }]}
              placeholder="https://www.youtube.com/watch?v=..."
              placeholderTextColor={colors.mutedForeground}
              value={youtubeUrl}
              onChangeText={handleUrlChange}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
            />
            {youtubeUrl.length > 0 && (
              <Pressable onPress={() => { setYoutubeUrl(""); setVideoId(null); }} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>
          <Pressable
            style={styles.channelLink}
            onPress={() => Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(creator.name)}+workout`)}
          >
            <Ionicons name="open-outline" size={13} color={colors.accent} />
            <Text style={[styles.channelLinkText, { color: colors.accent }]}>
              Browse {creator.name}'s channel
            </Text>
          </Pressable>
        </View>

        {/* Thumbnail preview */}
        {videoId && (
          <View style={[styles.previewCard, { backgroundColor: colors.card, borderColor: "#4CAF50" + "50" }]}>
            <Image
              source={{ uri: getYouTubeThumbnail(videoId) }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <View style={styles.previewOverlay}>
              <View style={styles.previewPlayBtn}>
                <Ionicons name="play" size={24} color="#fff" />
              </View>
            </View>
            <View style={[styles.validBadge, { backgroundColor: "#4CAF50" }]}>
              <Ionicons name="checkmark" size={12} color="#fff" />
              <Text style={styles.validText}>Video found!</Text>
            </View>
            <Pressable
              style={styles.watchNowBtn}
              onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`)}
            >
              <Ionicons name="logo-youtube" size={14} color="#FF0000" />
              <Text style={[styles.watchNowText, { color: "#FF0000" }]}>Preview on YouTube</Text>
            </Pressable>
          </View>
        )}

        {/* Class name */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Class Name</Text>
          <TextInput
            style={[styles.nameInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
            placeholder={`${creator.name} Class`}
            placeholderTextColor={colors.mutedForeground}
            value={className}
            onChangeText={setClassName}
            returnKeyType="done"
          />
        </View>

        {/* Duration */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Duration</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.durationRow}>
              {DURATIONS.map((d) => (
                <Pressable
                  key={d}
                  style={[
                    styles.durationPill,
                    {
                      backgroundColor: duration === d ? colors.primary : colors.card,
                      borderColor: duration === d ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setDuration(d)}
                >
                  <Text
                    style={[
                      styles.durationText,
                      { color: duration === d ? "#fff" : colors.text },
                    ]}
                  >
                    {d}m
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Date picker */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Select a Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
            <View style={styles.dateRow}>
              {days.map((day) => {
                const dateStr = formatDate(day);
                const isSelected = selectedDate === dateStr;
                return (
                  <Pressable
                    key={dateStr}
                    style={[
                      styles.datePill,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.card,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => { setSelectedDate(dateStr); setSelectedTime(null); }}
                  >
                    <Text style={[styles.dayName, { color: isSelected ? "#fff" : colors.mutedForeground }]}>
                      {day.toLocaleDateString("en-US", { weekday: "short" })}
                    </Text>
                    <Text style={[styles.dayNum, { color: isSelected ? "#fff" : colors.text }]}>
                      {day.getDate()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Time slots */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Pick a Time</Text>
          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <Pressable
                  key={time}
                  style={[
                    styles.timeSlot,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => { Haptics.selectionAsync(); setSelectedTime(time); }}
                >
                  <Text style={[styles.timeText, { color: isSelected ? "#fff" : colors.text }]}>
                    {time}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Book button */}
      <View
        style={[
          styles.bookBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 8,
          },
        ]}
      >
        <View style={styles.bookBarInfo}>
          <View style={[styles.userPill, { backgroundColor: user.color + "18" }]}>
            <Ionicons name="person-circle" size={14} color={user.color} />
            <Text style={[styles.userPillText, { color: user.color }]}>{user.name}</Text>
          </View>
          {selectedTime && (
            <Text style={[styles.selectedInfo, { color: colors.mutedForeground }]}>
              {displayDate(selectedDate)} · {selectedTime}
            </Text>
          )}
        </View>
        <Pressable
          style={[styles.bookBtn, { opacity: videoId && selectedTime ? 1 : 0.5 }]}
          onPress={handleBook}
          disabled={!videoId || !selectedTime}
        >
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bookBtnInner}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.bookBtnText}>Book Custom Class · $5</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  heroHeader: { paddingHorizontal: 24, paddingBottom: 24, alignItems: "center", gap: 8 },
  customIconBig: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  heroTitle: { fontSize: 22, fontFamily: "Poppins_700Bold", color: "#fff", textAlign: "center" },
  heroSub: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.85)" },
  scrollContent: { padding: 20, gap: 20 },
  section: { gap: 8 },
  label: { fontSize: 16, fontFamily: "Poppins_700Bold" },
  labelHint: { fontSize: 12, fontFamily: "Poppins_400Regular", marginTop: -4 },
  urlInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  urlIcon: { marginRight: 8 },
  urlInput: { flex: 1, fontSize: 13, fontFamily: "Poppins_400Regular", paddingVertical: 14 },
  channelLink: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start" },
  channelLinkText: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  previewCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1.5,
    position: "relative",
  },
  thumbnail: { width: "100%", height: 180 },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  previewPlayBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  validBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  validText: { fontSize: 11, fontFamily: "Poppins_700Bold", color: "#fff" },
  watchNowBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 12,
    backgroundColor: "#fff",
  },
  watchNowText: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  nameInput: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
  },
  durationRow: { flexDirection: "row", gap: 8 },
  durationPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    minWidth: 52,
  },
  durationText: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  dateScroll: { marginHorizontal: -20, paddingHorizontal: 20 },
  dateRow: { flexDirection: "row", gap: 10, paddingRight: 20 },
  datePill: {
    width: 56,
    height: 68,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  dayName: { fontSize: 11, fontFamily: "Poppins_600SemiBold" },
  dayNum: { fontSize: 20, fontFamily: "Poppins_700Bold" },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  timeSlot: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  timeText: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  bookBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  bookBarInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  userPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  userPillText: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  selectedInfo: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  bookBtn: { borderRadius: 16, overflow: "hidden" },
  bookBtnInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16 },
  bookBtnText: { fontSize: 16, fontFamily: "Poppins_700Bold", color: "#fff" },
});
