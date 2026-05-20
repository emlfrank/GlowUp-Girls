import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
import { displayDate, USERS } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

export default function ScheduleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentUser, setCurrentUser, getUpcomingBookings, cancelBooking } = useApp();
  const user = USERS[currentUser];
  const bookings = getUpcomingBookings(currentUser);

  const grouped = bookings.reduce<Record<string, typeof bookings>>((acc, b) => {
    if (!acc[b.date]) acc[b.date] = [];
    acc[b.date].push(b);
    return acc;
  }, {});

  const handleCancel = (bookingId: string, className: string) => {
    Alert.alert(
      "Cancel Class",
      `Remove "${className}" from your schedule? Your $5 contribution will be refunded from the prize pot.`,
      [
        { text: "Keep It", style: "cancel" },
        {
          text: "Cancel Class",
          style: "destructive",
          onPress: () => cancelBooking(bookingId),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#FFE0EE", "#FFF0F7"]}
        style={[
          styles.header,
          { paddingTop: Platform.OS === "web" ? 67 : insets.top + 16 },
        ]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: colors.primary }]}>My Schedule</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {bookings.length} upcoming {bookings.length === 1 ? "class" : "classes"}
            </Text>
          </View>
          <Pressable
            style={[
              styles.userPill,
              { backgroundColor: user.color + "22", borderColor: user.color + "55" },
            ]}
            onPress={() =>
              setCurrentUser(currentUser === "kelsey" ? "elizabeth" : "kelsey")
            }
          >
            <Ionicons name="person-circle" size={18} color={user.color} />
            <Text style={[styles.userName, { color: user.color }]}>{user.name}</Text>
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "web" ? 120 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {Object.keys(grouped).length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={56} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No classes yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
              Head to Classes to book your first workout!
            </Text>
          </View>
        ) : (
          Object.entries(grouped).map(([date, dayBookings]) => (
            <View key={date} style={styles.dayGroup}>
              <View style={styles.dayHeader}>
                <View
                  style={[styles.dayDot, { backgroundColor: colors.primary }]}
                />
                <Text style={[styles.dayLabel, { color: colors.text }]}>
                  {displayDate(date)}
                </Text>
              </View>
              {dayBookings.map((booking) => (
                <View
                  key={booking.id}
                  style={[
                    styles.bookingCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.bookingLeft}>
                    <View
                      style={[
                        styles.timeBadge,
                        { backgroundColor: colors.primary + "18" },
                      ]}
                    >
                      <Text style={[styles.timeText, { color: colors.primary }]}>
                        {booking.time}
                      </Text>
                    </View>
                    <View style={styles.bookingInfo}>
                      <Text
                        style={[styles.bookingClass, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {booking.className}
                      </Text>
                      <Text style={[styles.bookingCreator, { color: colors.mutedForeground }]}>
                        {booking.creatorName}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.bookingRight}>
                    <View
                      style={[styles.priceBadge, { backgroundColor: colors.gold + "33" }]}
                    >
                      <Text style={[styles.priceText, { color: "#B8860B" }]}>$5</Text>
                    </View>
                    <Pressable
                      onPress={() => handleCancel(booking.id, booking.className)}
                      style={styles.cancelBtn}
                      hitSlop={8}
                    >
                      <Ionicons name="close-circle" size={22} color={colors.mutedForeground} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 28, fontFamily: "Poppins_700Bold", letterSpacing: -0.5 },
  subtitle: { fontSize: 14, fontFamily: "Poppins_400Regular", marginTop: 2 },
  userPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  userName: { fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  scrollContent: { padding: 20, gap: 24 },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 20, fontFamily: "Poppins_700Bold" },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  dayGroup: { gap: 10 },
  dayHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  dayDot: { width: 8, height: 8, borderRadius: 4 },
  dayLabel: { fontSize: 16, fontFamily: "Poppins_700Bold" },
  bookingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  timeBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  timeText: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  bookingInfo: { flex: 1 },
  bookingClass: { fontSize: 15, fontFamily: "Poppins_600SemiBold" },
  bookingCreator: { fontSize: 12, fontFamily: "Poppins_400Regular", marginTop: 2 },
  bookingRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  priceBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  priceText: { fontSize: 13, fontFamily: "Poppins_700Bold" },
  cancelBtn: {},
});
