import { Ionicons } from "@expo/vector-icons";
import * as Calendar from "expo-calendar";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { useLocalSearchParams, router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import {
  displayDate, formatDate, getClassById, getNext7Days,
  isTimePast, TIME_SLOTS, USERS,
} from "@/constants/data";
import { useColors } from "@/hooks/useColors";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const LEVEL_COLORS: Record<string, string> = {
  Beginner: "#4D8E89",
  Intermediate: "#BF6375",
  Advanced: "#8B7DB0",
};

async function addToDeviceCalendar(title: string, dateStr: string, timeStr: string, notes: string): Promise<boolean> {
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
      title: `GlowUp: ${title}`, startDate, endDate, notes,
      alarms: [{ relativeOffset: -15 }],
    });
    return true;
  } catch { return false; }
}

async function scheduleReminder(className: string, dateStr: string, timeStr: string): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return false;
    const [timePart, ampm] = timeStr.split(" ");
    const [h, m] = timePart.split(":").map(Number);
    let hours = h;
    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    const classDate = new Date(dateStr + "T12:00:00");
    classDate.setHours(hours, m || 0, 0, 0);
    const reminderTime = new Date(classDate.getTime() - 15 * 60 * 1000);
    if (reminderTime <= new Date()) return false;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "GlowUp Girls",
        body: `"${className}" starts in 15 minutes — time to move!`,
        sound: true,
      } as any,
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderTime },
    });
    return true;
  } catch { return false; }
}

export default function ClassDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentUser, addBooking, bookTogether, sendInvitation, isSlotBooked, markCalendarAdded } = useApp();

  const found = getClassById(id ?? "");
  const days = getNext7Days();

  const [selectedDate, setSelectedDate] = useState(formatDate(days[0]));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedId, setBookedId] = useState<string | null>(null);
  const [bookingMode, setBookingMode] = useState<"solo" | "together" | "invite">("solo");

  if (!found) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Class not found</Text>
      </View>
    );
  }

  const { cls, creator } = found;
  const user = USERS[currentUser];
  const bestieId = currentUser === "kelsey" ? "elizabeth" : "kelsey";
  const bestie = USERS[bestieId];

  const today = formatDate(new Date());

  const handleBook = async () => {
    if (!selectedTime) {
      Alert.alert("Select a time", "Please pick a time slot.");
      return;
    }
    if (bookingMode !== "invite" && isSlotBooked(cls.id, selectedDate, selectedTime)) {
      Alert.alert("Already booked", "You already have this slot.");
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let newBookingId: string | null = null;

    if (bookingMode === "together") {
      const [b1] = bookTogether({
        classId: cls.id, creatorId: creator.id, className: cls.name,
        creatorName: creator.name, date: selectedDate, time: selectedTime,
      });
      newBookingId = b1.id;
      Alert.alert(
        "Booked for Both!",
        `${cls.name} on ${displayDate(selectedDate)} at ${selectedTime}.\n\nKelsey & Elizabeth are both signed up! +100 pts each.`,
        [{ text: "Done" }]
      );
    } else if (bookingMode === "invite") {
      const myBooking = addBooking({
        classId: cls.id, creatorId: creator.id, className: cls.name,
        creatorName: creator.name, userId: currentUser, date: selectedDate, time: selectedTime,
      });
      newBookingId = myBooking.id;
      sendInvitation({
        classId: cls.id, creatorId: creator.id, className: cls.name,
        creatorName: creator.name, fromUserId: currentUser, toUserId: bestieId,
        date: selectedDate, time: selectedTime,
      });
      Alert.alert(
        "Booked + Invite Sent!",
        `You're signed up for ${cls.name} on ${displayDate(selectedDate)} at ${selectedTime}.\n\n${bestie.name} will see an invitation in the Activity tab.`,
        [{ text: "Done" }]
      );
    } else {
      const myBooking = addBooking({
        classId: cls.id, creatorId: creator.id, className: cls.name,
        creatorName: creator.name, userId: currentUser, date: selectedDate, time: selectedTime,
      });
      newBookingId = myBooking.id;
      Alert.alert(
        "Class Booked!",
        `${cls.name} on ${displayDate(selectedDate)} at ${selectedTime}.\n\n+100 points added to your total!`,
        [{ text: "Done" }]
      );
    }

    setBookedId(newBookingId);
  };

  const handleSetReminder = async () => {
    if (!selectedTime) return;
    const ok = await scheduleReminder(cls.name, selectedDate, selectedTime);
    Alert.alert(ok ? "Reminder set!" : "Couldn't set reminder", ok ? `You'll be notified 15 min before ${cls.name}.` : "Please enable notifications in Settings.");
  };

  const handleAddCalendar = async () => {
    if (!selectedTime || !bookedId) return;
    const ok = await addToDeviceCalendar(
      cls.name, selectedDate, selectedTime,
      `${creator.name} · ${cls.duration} min · ${cls.level}`
    );
    if (ok) markCalendarAdded(bookedId);
    Alert.alert(ok ? "Added to Calendar!" : "Couldn't add", ok ? "Your class is in your calendar." : "Please add it manually.");
  };

  const isBooked = bookedId !== null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Flat color header */}
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
        <View style={[styles.levelPill, { borderColor: LEVEL_COLORS[cls.level] + "60", backgroundColor: LEVEL_COLORS[cls.level] + "15" }]}>
          <Text style={[styles.levelText, { color: LEVEL_COLORS[cls.level] }]}>{cls.level.toUpperCase()}</Text>
        </View>
        <Text style={[styles.className, { color: colors.text }]}>{cls.name}</Text>
        <Text style={[styles.creatorName, { color: colors.mutedForeground }]}>{creator.name}</Text>
        <View style={styles.headerMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={13} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{cls.duration} min</Text>
          </View>
          <View style={[styles.metaDot, { backgroundColor: colors.border }]} />
          <View style={styles.metaItem}>
            <Ionicons name="star-outline" size={13} color={colors.accent} />
            <Text style={[styles.metaText, { color: colors.accent }]}>100 pts</Text>
          </View>
          <View style={[styles.metaDot, { backgroundColor: colors.border }]} />
          <View style={styles.metaItem}>
            <Ionicons name="person-circle-outline" size={13} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{user.name}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Platform.OS === "web" ? 200 : 180 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.description, { color: colors.mutedForeground }]}>{cls.description}</Text>

        {/* YouTube */}
        <Pressable
          style={[styles.youtubeBtn, { backgroundColor: "#FF000015", borderColor: "#FF000030" }]}
          onPress={() => Linking.openURL(cls.youtubeUrl)}
        >
          <Ionicons name="logo-youtube" size={18} color="#FF0000" />
          <Text style={styles.youtubeBtnText}>Watch on YouTube</Text>
          <Ionicons name="open-outline" size={14} color="#FF000099" />
        </Pressable>

        {/* Date picker */}
        <View>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SELECT DATE</Text>
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
        <View>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PICK A TIME</Text>
          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((time) => {
              const taken = isSlotBooked(cls.id, selectedDate, time);
              const past = isTimePast(selectedDate, time);
              const disabled = taken || past;
              const isSelected = selectedTime === time;
              return (
                <Pressable
                  key={time}
                  disabled={disabled}
                  style={[
                    styles.timeSlot,
                    {
                      backgroundColor: isSelected ? colors.primary : disabled ? colors.muted : colors.card,
                      borderColor: isSelected ? colors.primary : disabled ? colors.border : colors.border,
                      opacity: disabled ? 0.4 : 1,
                    },
                  ]}
                  onPress={() => { Haptics.selectionAsync(); setSelectedTime(time); }}
                >
                  <Text style={[styles.timeText, { color: isSelected ? "#fff" : disabled ? colors.mutedForeground : colors.text }]}>
                    {time}
                  </Text>
                  {taken && <Ionicons name="close-circle" size={10} color={colors.mutedForeground} />}
                  {past && !taken && <Ionicons name="time-outline" size={10} color={colors.mutedForeground} />}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Booking mode */}
        <View>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>BOOKING FOR</Text>
          <View style={styles.modeRow}>
            {(["solo", "together", "invite"] as const).map((mode) => {
              const labels: Record<typeof mode, string> = {
                solo: `Just ${user.name}`,
                together: "Both of us",
                invite: `Invite ${bestie.name}`,
              };
              const icons: Record<typeof mode, string> = {
                solo: "person",
                together: "people",
                invite: "mail",
              };
              const isActive = bookingMode === mode;
              return (
                <Pressable
                  key={mode}
                  style={[
                    styles.modeBtn,
                    {
                      backgroundColor: isActive ? colors.primary : colors.card,
                      borderColor: isActive ? colors.primary : colors.border,
                      flex: 1,
                    },
                  ]}
                  onPress={() => setBookingMode(mode)}
                >
                  <Ionicons name={icons[mode] as any} size={14} color={isActive ? "#fff" : colors.mutedForeground} />
                  <Text style={[styles.modeBtnText, { color: isActive ? "#fff" : colors.text }]}>
                    {labels[mode]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {bookingMode === "together" && (
            <Text style={[styles.modeHint, { color: colors.mutedForeground }]}>
              Both Kelsey & Elizabeth will be booked for this class (+100 pts each)
            </Text>
          )}
          {bookingMode === "invite" && (
            <Text style={[styles.modeHint, { color: colors.mutedForeground }]}>
              You'll be booked and {bestie.name} will get an invitation to join
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Book bar */}
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
        {isBooked ? (
          <View style={styles.confirmedRow}>
            <View style={[styles.confirmedBadge, { backgroundColor: "#4D8E8918", borderColor: "#4D8E8940" }]}>
              <Ionicons name="checkmark-circle" size={16} color="#4D8E89" />
              <Text style={[styles.confirmedText, { color: "#4D8E89" }]}>Booked for {displayDate(selectedDate)}</Text>
            </View>
            <View style={styles.confirmedActions}>
              {Platform.OS !== "web" && (
                <Pressable
                  style={[styles.actionBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
                  onPress={handleSetReminder}
                >
                  <Ionicons name="notifications-outline" size={16} color={colors.text} />
                  <Text style={[styles.actionBtnText, { color: colors.text }]}>Remind me</Text>
                </Pressable>
              )}
              {Platform.OS !== "web" && (
                <Pressable
                  style={[styles.actionBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
                  onPress={handleAddCalendar}
                >
                  <Ionicons name="calendar-outline" size={16} color={colors.text} />
                  <Text style={[styles.actionBtnText, { color: colors.text }]}>Calendar</Text>
                </Pressable>
              )}
              <Pressable
                style={[styles.actionBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                onPress={() => router.back()}
              >
                <Text style={[styles.actionBtnText, { color: "#fff" }]}>Done</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            {selectedTime && (
              <Text style={[styles.selectedInfo, { color: colors.mutedForeground }]}>
                {displayDate(selectedDate)} · {selectedTime}
              </Text>
            )}
            <Pressable
              style={[
                styles.bookBtn,
                {
                  backgroundColor: selectedTime ? colors.primary : colors.muted,
                  borderColor: selectedTime ? colors.primary : colors.border,
                },
              ]}
              onPress={handleBook}
              disabled={!selectedTime}
            >
              <Ionicons name="checkmark-circle" size={20} color={selectedTime ? "#fff" : colors.mutedForeground} />
              <Text style={[styles.bookBtnText, { color: selectedTime ? "#fff" : colors.mutedForeground }]}>
                {bookingMode === "together"
                  ? "Book for Both · 100 pts each"
                  : bookingMode === "invite"
                  ? `Book + Invite ${bestie.name} · 100 pts`
                  : "Book Class · 100 pts"}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { paddingHorizontal: 20, paddingBottom: 18, gap: 4, borderBottomWidth: 1 },
  levelPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, alignSelf: "flex-start" },
  levelText: { fontSize: 9, fontFamily: "Poppins_700Bold", letterSpacing: 2 },
  className: { fontSize: 24, fontFamily: "Poppins_700Bold", letterSpacing: -0.3 },
  creatorName: { fontSize: 13, fontFamily: "Poppins_400Regular" },
  headerMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, fontFamily: "Poppins_500Medium" },
  metaDot: { width: 3, height: 3, borderRadius: 1.5 },
  scrollContent: { padding: 20, gap: 20 },
  description: { fontSize: 14, fontFamily: "Poppins_400Regular", lineHeight: 22 },
  youtubeBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingVertical: 12, borderRadius: 8, borderWidth: 1,
  },
  youtubeBtnText: { flex: 1, fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#FF0000" },
  sectionLabel: { fontSize: 10, fontFamily: "Poppins_700Bold", letterSpacing: 2.5, marginBottom: 10 },
  dateScroll: { marginHorizontal: -20, paddingHorizontal: 20 },
  dateRow: { flexDirection: "row", gap: 8, paddingRight: 20 },
  datePill: {
    width: 54, height: 64, borderRadius: 8, borderWidth: 1,
    alignItems: "center", justifyContent: "center", gap: 3,
  },
  dayName: { fontSize: 10, fontFamily: "Poppins_600SemiBold" },
  dayNum: { fontSize: 18, fontFamily: "Poppins_700Bold" },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  timeSlot: {
    flexDirection: "row", alignItems: "center", gap: 3,
    paddingHorizontal: 12, paddingVertical: 9, borderRadius: 8, borderWidth: 1,
  },
  timeText: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  modeRow: { flexDirection: "row", gap: 8 },
  modeBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, paddingVertical: 10, borderRadius: 8, borderWidth: 1,
  },
  modeBtnText: { fontSize: 11, fontFamily: "Poppins_600SemiBold" },
  modeHint: { fontSize: 12, fontFamily: "Poppins_400Regular", marginTop: 8, lineHeight: 17 },
  bookBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    padding: 16, paddingTop: 12, borderTopWidth: 1, gap: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 8,
  },
  selectedInfo: { fontSize: 12, fontFamily: "Poppins_400Regular", textAlign: "center" },
  bookBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 15, borderRadius: 8, borderWidth: 1.5,
  },
  bookBtnText: { fontSize: 15, fontFamily: "Poppins_700Bold" },
  confirmedRow: { gap: 10 },
  confirmedBadge: {
    flexDirection: "row", alignItems: "center", gap: 8,
    padding: 10, borderRadius: 8, borderWidth: 1,
  },
  confirmedText: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  confirmedActions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 12, borderRadius: 8, borderWidth: 1,
  },
  actionBtnText: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
});
