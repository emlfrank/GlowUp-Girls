import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { displayDate, formatDate, USERS } from "@/constants/data";
import { useColors } from "@/hooks/useColors";
import { supabase } from "@/lib/supabase"; // ✅ ADDED

const CREATOR_EMOJI: Record<string, string> = {
  "pilates-raven": "🌸",
  "yoga-adrienne": "🧘",
  "yoga-kassandra": "🌿",
  "workout-roxane": "💪",
};

const REACTION_EMOJIS = ["💪", "🔥", "⭐", "💕", "🙌"];
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getCalendarDays(year: number, month: number): string[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const days: string[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    days.push(formatDate(new Date(year, month - 1, prevMonthDays - i)));
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(formatDate(new Date(year, month, i)));
  }

  while (days.length < 42) {
    days.push(formatDate(new Date(year, month + 1, days.length - firstDay - daysInMonth + 1)));
  }

  return days;
}

function getBookingEmoji(creatorId: string, isCustom?: boolean): string {
  if (isCustom) return "⭐";
  return CREATOR_EMOJI[creatorId] ?? "⭐";
}

function formatMonthYear(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default function CalendarScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const {
    currentUser,
    setCurrentUser,
    outsideWorkouts,
    reactions,
    addReaction,
    removeReaction,
    getReactionsForBooking,
    getStreak,
    getActivitiesForDate,
    getActivityDates,
    getStepsGoalDates,
    cancelBooking,
    getPendingInvitationsForUser,
    acceptInvitation,
    declineInvitation,
  } = useApp();

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(formatDate(now));

  // ✅ SUPABASE BOOKINGS STATE
  const [sharedBookings, setSharedBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*");

      if (!error && data) {
        setSharedBookings(data);
      }
    };

    fetchBookings();
  }, []);

  const besties = currentUser === "kelsey" ? "elizabeth" : "kelsey";
  const user = USERS[currentUser];
  const bestie = USERS[besties];

  const myDates = getActivityDates(currentUser);
  const bestieDates = getActivityDates(besties);
  const myStepsDates = getStepsGoalDates(currentUser);

  const myStreak = getStreak(currentUser);
  const bestieStreak = getStreak(besties);

  const pendingInvites = getPendingInvitationsForUser(currentUser);

  const calDays = getCalendarDays(viewYear, viewMonth);
  const today = formatDate(now);
  const currentYearMonth = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  };

  const selectedActivities = getActivitiesForDate(selectedDate);
  const selectedWorkouts = selectedActivities.outsideWorkouts;

  // ✅ REPLACED: bookings now come from Supabase
  const selectedBookings = sharedBookings.filter(
    (b) => b.date === selectedDate
  );

  const handleReact = (bookingId: string, bookingUserId: string, emoji: string) => {
    if (bookingUserId === currentUser) return;

    const existing = reactions.find(
      (r) => r.bookingId === bookingId && r.fromUserId === currentUser
    );

    Haptics.selectionAsync();

    if (existing?.emoji === emoji) removeReaction(bookingId, currentUser);
    else addReaction(bookingId, currentUser, emoji);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
      >
        {/* CALENDAR GRID (UNCHANGED) */}
        <View style={styles.calGrid}>
          {calDays.map((dateStr, idx) => {
            const dayBookings = sharedBookings.filter(
              (b) => b.date === dateStr
            );

            const firstEmoji =
              dayBookings.length > 0 ? "⭐" : null;

            return (
              <Pressable
                key={`${dateStr}-${idx}`}
                onPress={() => setSelectedDate(dateStr)}
                style={styles.dayCell}
              >
                <Text>{new Date(dateStr).getDate()}</Text>

                {firstEmoji && (
                  <Text style={{ fontSize: 12 }}>{firstEmoji}</Text>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* SELECTED DAY */}
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>
            {displayDate(selectedDate)}
          </Text>

          {selectedBookings.map((b) => {
            return (
              <View key={b.id} style={{ padding: 10 }}>
                <Text style={{ fontWeight: "600" }}>{b.className}</Text>
                <Text>{b.creatorName}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  calGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: {
    width: "14.2%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});
