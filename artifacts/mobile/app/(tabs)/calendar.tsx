import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
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
  return new Date(year, month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function CalendarScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    currentUser, setCurrentUser,
    bookings, outsideWorkouts, reactions,
    addReaction, removeReaction, getReactionsForBooking,
    getStreak, getActivitiesForDate, getActivityDates, getStepsGoalDates,
    cancelBooking, getPendingInvitationsForUser, acceptInvitation, declineInvitation,
  } = useApp();

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(formatDate(now));

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
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const selectedActivities = getActivitiesForDate(selectedDate);
  const selectedBookings = selectedActivities.bookings;
  const selectedWorkouts = selectedActivities.outsideWorkouts;

  const handleReact = (bookingId: string, bookingUserId: string, emoji: string) => {
    if (bookingUserId === currentUser) return;
    const existing = reactions.find((r) => r.bookingId === bookingId && r.fromUserId === currentUser);
    Haptics.selectionAsync();
    if (existing?.emoji === emoji) removeReaction(bookingId, currentUser);
    else addReaction(bookingId, currentUser, emoji);
  };

  const handleCancelBooking = (bookingId: string, className: string) => {
    Alert.alert("Cancel Class", `Cancel "${className}"?\n\nThis docks 100 points from your total.`, [
      { text: "Keep It", style: "cancel" },
      { text: "Cancel Class (−100 pts)", style: "destructive", onPress: () => cancelBooking(bookingId) },
    ]);
  };

  const handleAcceptInvite = (inviteId: string, className: string) => {
    acceptInvitation(inviteId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("You're in!", `"${className}" has been added to your schedule. +100 pts!`);
  };

  const handleDeclineInvite = (inviteId: string) => {
    declineInvitation(inviteId);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Flat Wes Anderson header */}
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
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Activity</Text>
            <View style={styles.subtitleRow}>
              <View style={[styles.ruleLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>CALENDAR</Text>
              <View style={[styles.ruleLine, { backgroundColor: colors.border }]} />
            </View>
          </View>
          <View style={styles.headerRight}>
            {/* Streaks */}
            <View style={[styles.streakBadge, { backgroundColor: user.color + "18", borderColor: user.color + "40" }]}>
              <Text style={styles.streakFire}>🔥</Text>
              <Text style={[styles.streakCount, { color: user.color }]}>{myStreak}d</Text>
            </View>
            <Pressable
              style={[styles.userPill, { backgroundColor: user.color + "18", borderColor: user.color + "40" }]}
              onPress={() => setCurrentUser(besties)}
            >
              <Ionicons name="person-circle" size={16} color={user.color} />
              <Text style={[styles.userName, { color: user.color }]}>{user.name}</Text>
              <Ionicons name="chevron-down" size={11} color={user.color} />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Platform.OS === "web" ? 120 : 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Pending invitations */}
        {pendingInvites.length > 0 && (
          <View style={styles.inviteSection}>
            <Text style={[styles.inviteSectionLabel, { color: colors.mutedForeground }]}>
              PENDING INVITATIONS
            </Text>
            {pendingInvites.map((inv) => {
              const from = USERS[inv.fromUserId];
              return (
                <View key={inv.id} style={[styles.inviteCard, { backgroundColor: from.color + "10", borderColor: from.color + "40" }]}>
                  <View style={styles.inviteInfo}>
                    <Text style={[styles.inviteTitle, { color: colors.text }]}>
                      {from.name} invited you to {inv.className}
                    </Text>
                    <Text style={[styles.inviteDate, { color: colors.mutedForeground }]}>
                      {displayDate(inv.date)} · {inv.time}
                    </Text>
                  </View>
                  <View style={styles.inviteActions}>
                    <Pressable
                      style={[styles.inviteBtn, { backgroundColor: colors.secondary }]}
                      onPress={() => handleAcceptInvite(inv.id, inv.className)}
                    >
                      <Ionicons name="checkmark" size={14} color="#fff" />
                      <Text style={styles.inviteBtnText}>Join</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.inviteBtn, { backgroundColor: colors.muted, borderWidth: 1, borderColor: colors.border }]}
                      onPress={() => handleDeclineInvite(inv.id)}
                    >
                      <Ionicons name="close" size={14} color={colors.mutedForeground} />
                      <Text style={[styles.inviteBtnText, { color: colors.mutedForeground }]}>Decline</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Month navigation */}
        <View style={styles.monthNav}>
          <Pressable onPress={prevMonth} hitSlop={12}>
            <Ionicons name="chevron-back" size={20} color={colors.primary} />
          </Pressable>
          <Pressable onPress={() => { setViewYear(now.getFullYear()); setViewMonth(now.getMonth()); }}>
            <Text style={[styles.monthLabel, { color: colors.text }]}>{formatMonthYear(viewYear, viewMonth)}</Text>
          </Pressable>
          <Pressable onPress={nextMonth} hitSlop={12}>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </Pressable>
        </View>

        {/* Weekday headers */}
        <View style={styles.weekdayRow}>
          {WEEKDAY_LABELS.map((d) => (
            <Text key={d} style={[styles.weekdayLabel, { color: colors.mutedForeground }]}>{d}</Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.calGrid}>
          {calDays.map((dateStr, idx) => {
            const inMonth = dateStr.startsWith(currentYearMonth);
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;
            const hasMyActivity = myDates.has(dateStr);
            const hasBestieActivity = bestieDates.has(dateStr);
            const hasStepsGoal = myStepsDates.has(dateStr);
            const isPast = dateStr <= today;

            const dayBookings = bookings.filter((b) => b.userId === currentUser && b.date === dateStr && !b.canceled);
            const dayWorkouts = outsideWorkouts.filter((w) => w.userId === currentUser && w.date === dateStr);
            const firstEmoji = dayBookings.length > 0
              ? getBookingEmoji(dayBookings[0].creatorId, dayBookings[0].isCustom)
              : dayWorkouts.length > 0
              ? dayWorkouts[0].emoji
              : null;
            const activityCount = dayBookings.length + dayWorkouts.length;

            return (
              <Pressable
                key={`${dateStr}-${idx}`}
                style={[
                  styles.dayCell,
                  isSelected && { backgroundColor: colors.primary + "15", borderRadius: 10 },
                ]}
                onPress={() => { setSelectedDate(dateStr); Haptics.selectionAsync(); }}
              >
                <View
                  style={[
                    styles.dayCircle,
                    isToday && { backgroundColor: colors.primary },
                    isSelected && !isToday && { borderWidth: 1.5, borderColor: colors.primary },
                  ]}
                >
                  <Text style={[styles.dayNumber, { color: !inMonth ? colors.border : isToday ? "#fff" : colors.text }]}>
                    {new Date(dateStr + "T12:00:00").getDate()}
                  </Text>
                </View>

                {/* Activity emoji sticker */}
                {hasMyActivity && inMonth && firstEmoji && (
                  <View style={styles.emojiSticker}>
                    <Text style={[styles.stickerEmoji, { opacity: isPast ? 1 : 0.5 }]}>
                      {firstEmoji}
                    </Text>
                    {activityCount > 1 && (
                      <View style={[styles.countBubble, { backgroundColor: colors.primary }]}>
                        <Text style={styles.countText}>{activityCount}</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Steps goal emoji — shown at bottom if steps goal was met */}
                {hasStepsGoal && inMonth && (
                  <Text style={styles.stepsEmoji}>👟</Text>
                )}

                {/* Bestie dot */}
                {hasBestieActivity && inMonth && (
                  <View style={[styles.bestieDot, { backgroundColor: bestie.color }]} />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <Text style={styles.legendEmoji}>🌸</Text>
            <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Your activity</Text>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.legendEmoji}>👟</Text>
            <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Steps goal</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: bestie.color }]} />
            <Text style={[styles.legendText, { color: colors.mutedForeground }]}>{bestie.name}</Text>
          </View>
        </View>

        {/* Selected day */}
        <View style={[styles.dayDetailHeader, { borderTopColor: colors.border }]}>
          <View style={styles.dayDetailRow}>
            <Text style={[styles.dayDetailTitle, { color: colors.text }]}>{displayDate(selectedDate)}</Text>
            {myStepsDates.has(selectedDate) && (
              <View style={[styles.stepsBadge, { backgroundColor: colors.secondary + "18", borderColor: colors.secondary + "40" }]}>
                <Text>👟</Text>
                <Text style={[styles.stepsBadgeText, { color: colors.secondary }]}>Steps goal met +25 pts</Text>
              </View>
            )}
          </View>
          {(selectedBookings.length + selectedWorkouts.length) === 0 && (
            <Text style={[styles.emptyDay, { color: colors.mutedForeground }]}>No activities logged</Text>
          )}
        </View>

        {selectedBookings.map((booking) => {
          const emoji = getBookingEmoji(booking.creatorId, booking.isCustom);
          const bookingReactions = getReactionsForBooking(booking.id);
          const myReaction = bookingReactions.find((r) => r.fromUserId === currentUser);
          const isMyBooking = booking.userId === currentUser;
          const bookingUser = USERS[booking.userId];

          return (
            <View
              key={booking.id}
              style={[
                styles.activityCard,
                {
                  backgroundColor: colors.card,
                  borderColor: isMyBooking ? bookingUser.color + "40" : bestie.color + "30",
                  borderLeftColor: bookingUser.color,
                  borderLeftWidth: 3,
                },
              ]}
            >
              <View style={styles.activityTop}>
                <View style={[styles.activityEmojiCircle, { backgroundColor: bookingUser.color + "18" }]}>
                  <Text style={styles.activityEmoji}>{emoji}</Text>
                </View>
                <View style={styles.activityInfo}>
                  <View style={styles.activityNameRow}>
                    <Text style={[styles.activityName, { color: colors.text }]} numberOfLines={1}>{booking.className}</Text>
                    <View style={[styles.userTag, { backgroundColor: bookingUser.color + "18" }]}>
                      <Text style={[styles.userTagText, { color: bookingUser.color }]}>{bookingUser.name}</Text>
                    </View>
                  </View>
                  <Text style={[styles.activitySub, { color: colors.mutedForeground }]}>
                    {booking.creatorName} · {booking.time}
                  </Text>
                  <Text style={[styles.activityPts, { color: colors.accent }]}>+100 pts</Text>
                </View>
                {isMyBooking && (
                  <Pressable onPress={() => handleCancelBooking(booking.id, booking.className)} hitSlop={8}>
                    <Ionicons name="close-circle-outline" size={20} color={colors.mutedForeground} />
                  </Pressable>
                )}
              </View>

              {isMyBooking && bookingReactions.length > 0 && (
                <View style={styles.receivedReactions}>
                  {bookingReactions.map((r) => (
                    <View key={r.id} style={[styles.receivedReaction, { backgroundColor: USERS[r.fromUserId].color + "18" }]}>
                      <Text style={styles.receivedEmoji}>{r.emoji}</Text>
                      <Text style={[styles.receivedFrom, { color: USERS[r.fromUserId].color }]}>
                        from {USERS[r.fromUserId].name}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {!isMyBooking && (
                <View style={styles.reactionRow}>
                  <Text style={[styles.reactionLabel, { color: colors.mutedForeground }]}>Cheer on {bestie.name}:</Text>
                  <View style={styles.reactionEmojis}>
                    {REACTION_EMOJIS.map((emoji) => (
                      <Pressable
                        key={emoji}
                        style={[
                          styles.reactionBtn,
                          {
                            borderColor: myReaction?.emoji === emoji ? user.color + "80" : colors.border,
                            backgroundColor: myReaction?.emoji === emoji ? user.color + "18" : "transparent",
                          },
                        ]}
                        onPress={() => handleReact(booking.id, booking.userId, emoji)}
                      >
                        <Text style={styles.reactionEmoji}>{emoji}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {selectedWorkouts.map((workout) => {
          const workoutUser = USERS[workout.userId];
          return (
            <View
              key={workout.id}
              style={[
                styles.activityCard,
                {
                  backgroundColor: colors.card,
                  borderColor: workoutUser.color + "30",
                  borderLeftColor: workoutUser.color,
                  borderLeftWidth: 3,
                },
              ]}
            >
              <View style={styles.activityTop}>
                <View style={[styles.activityEmojiCircle, { backgroundColor: workoutUser.color + "18" }]}>
                  <Text style={styles.activityEmoji}>{workout.emoji}</Text>
                </View>
                <View style={styles.activityInfo}>
                  <View style={styles.activityNameRow}>
                    <Text style={[styles.activityName, { color: colors.text }]} numberOfLines={1}>{workout.name}</Text>
                    <View style={[styles.userTag, { backgroundColor: workoutUser.color + "18" }]}>
                      <Text style={[styles.userTagText, { color: workoutUser.color }]}>{workoutUser.name}</Text>
                    </View>
                  </View>
                  <Text style={[styles.activitySub, { color: colors.mutedForeground }]}>
                    {workout.type} · {workout.duration} min
                  </Text>
                  {workout.notes ? (
                    <Text style={[styles.workoutNotes, { color: colors.mutedForeground }]}>{workout.notes}</Text>
                  ) : null}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const CELL_SIZE = 46;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  title: { fontSize: 26, fontFamily: "Poppins_700Bold", letterSpacing: 0.3 },
  subtitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  ruleLine: { flex: 1, height: 1 },
  headerSub: { fontSize: 9, fontFamily: "Poppins_600SemiBold", letterSpacing: 2.5 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8, paddingBottom: 2 },
  streakBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, borderWidth: 1,
  },
  streakFire: { fontSize: 14 },
  streakCount: { fontSize: 13, fontFamily: "Poppins_700Bold" },
  userPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1,
  },
  userName: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  scrollContent: { padding: 16, gap: 12 },
  inviteSection: { gap: 8 },
  inviteSectionLabel: { fontSize: 10, fontFamily: "Poppins_700Bold", letterSpacing: 3 },
  inviteCard: {
    borderRadius: 10, borderWidth: 1.5, padding: 12, gap: 10,
  },
  inviteInfo: { gap: 3 },
  inviteTitle: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  inviteDate: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  inviteActions: { flexDirection: "row", gap: 8 },
  inviteBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, paddingVertical: 9, borderRadius: 8,
  },
  inviteBtnText: { fontSize: 13, fontFamily: "Poppins_700Bold", color: "#fff" },
  monthNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  monthLabel: { fontSize: 17, fontFamily: "Poppins_700Bold" },
  weekdayRow: { flexDirection: "row" },
  weekdayLabel: { flex: 1, textAlign: "center", fontSize: 10, fontFamily: "Poppins_700Bold", letterSpacing: 0.5, paddingBottom: 6 },
  calGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: {
    width: `${100 / 7}%` as any,
    height: CELL_SIZE + 22,
    alignItems: "center",
    paddingTop: 4,
    position: "relative",
  },
  dayCircle: { width: 28, height: 28, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  dayNumber: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  emojiSticker: { position: "absolute", bottom: 14, alignItems: "center", justifyContent: "center" },
  stickerEmoji: { fontSize: 14, lineHeight: 16 },
  stepsEmoji: { position: "absolute", bottom: 2, fontSize: 10 },
  countBubble: {
    position: "absolute", top: -4, right: -8,
    width: 13, height: 13, borderRadius: 6.5, alignItems: "center", justifyContent: "center",
  },
  countText: { fontSize: 7, fontFamily: "Poppins_700Bold", color: "#fff" },
  bestieDot: { position: "absolute", top: 4, right: 5, width: 5, height: 5, borderRadius: 2.5 },
  legend: { flexDirection: "row", gap: 14, justifyContent: "center", flexWrap: "wrap" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendEmoji: { fontSize: 12 },
  legendDot: { width: 7, height: 7, borderRadius: 3.5 },
  legendText: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  dayDetailHeader: { borderTopWidth: 1, paddingTop: 14, gap: 8 },
  dayDetailRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  dayDetailTitle: { fontSize: 17, fontFamily: "Poppins_700Bold" },
  stepsBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1,
  },
  stepsBadgeText: { fontSize: 11, fontFamily: "Poppins_700Bold" },
  emptyDay: { fontSize: 13, fontFamily: "Poppins_400Regular", fontStyle: "italic" },
  activityCard: { borderRadius: 10, borderWidth: 1, padding: 14, gap: 10 },
  activityTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  activityEmojiCircle: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  activityEmoji: { fontSize: 20 },
  activityInfo: { flex: 1, gap: 2 },
  activityNameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  activityName: { fontSize: 14, fontFamily: "Poppins_700Bold", flex: 1 },
  userTag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  userTagText: { fontSize: 10, fontFamily: "Poppins_700Bold" },
  activitySub: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  activityPts: { fontSize: 11, fontFamily: "Poppins_700Bold" },
  workoutNotes: { fontSize: 11, fontFamily: "Poppins_400Regular", fontStyle: "italic" },
  receivedReactions: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  receivedReaction: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  receivedEmoji: { fontSize: 14 },
  receivedFrom: { fontSize: 10, fontFamily: "Poppins_600SemiBold" },
  reactionRow: { gap: 6 },
  reactionLabel: { fontSize: 11, fontFamily: "Poppins_500Medium" },
  reactionEmojis: { flexDirection: "row", gap: 6 },
  reactionBtn: { width: 36, height: 36, borderRadius: 8, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  reactionEmoji: { fontSize: 16 },
});
