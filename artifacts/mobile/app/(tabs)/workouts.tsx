import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp, OutsideWorkout } from "@/context/AppContext";
import { displayDate, formatDate, getNext7Days, getCurrentYearMonth, USERS } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

const WORKOUT_TYPES = [
  { type: "Running", emoji: "🏃" },
  { type: "Gym", emoji: "🏋️" },
  { type: "Swimming", emoji: "🌊" },
  { type: "Cycling", emoji: "🚴" },
  { type: "Walking", emoji: "👟" },
  { type: "Yoga", emoji: "🧘" },
  { type: "Pilates", emoji: "🌸" },
  { type: "Dance", emoji: "💃" },
  { type: "Hiking", emoji: "⛰️" },
  { type: "Sports", emoji: "🎾" },
  { type: "Other", emoji: "✨" },
];

const DURATIONS = [15, 20, 30, 45, 60, 75, 90];

export default function WorkoutsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentUser, setCurrentUser, outsideWorkouts, addOutsideWorkout, deleteOutsideWorkout } = useApp();

  const user = USERS[currentUser];
  const besties = currentUser === "kelsey" ? "elizabeth" : "kelsey";
  const bestie = USERS[besties];

  const days = getNext7Days();
  const today = formatDate(new Date());

  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState(WORKOUT_TYPES[0]);
  const [duration, setDuration] = useState(30);
  const [selectedDate, setSelectedDate] = useState(today);
  const [workoutName, setWorkoutName] = useState("");
  const [notes, setNotes] = useState("");

  const currentYM = getCurrentYearMonth();

  // All workouts sorted by date desc (both users)
  const allWorkouts = [...outsideWorkouts].sort((a, b) => b.date.localeCompare(a.date));
  const myWorkoutsThisMonth = outsideWorkouts.filter(
    (w) => w.userId === currentUser && w.date.startsWith(currentYM)
  );
  const bestieWorkoutsThisMonth = outsideWorkouts.filter(
    (w) => w.userId === besties && w.date.startsWith(currentYM)
  );
  const totalMinThis = myWorkoutsThisMonth.reduce((s, w) => s + w.duration, 0);

  const handleLog = () => {
    if (!workoutName.trim() && selectedType.type === "Other") {
      Alert.alert("Name your workout", "Please enter a workout name.");
      return;
    }
    const name = workoutName.trim() || selectedType.type;
    addOutsideWorkout({
      userId: currentUser,
      name,
      type: selectedType.type,
      emoji: selectedType.emoji,
      duration,
      date: selectedDate,
      notes: notes.trim(),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setWorkoutName("");
    setNotes("");
    setSelectedDate(today);
    setSelectedType(WORKOUT_TYPES[0]);
    setDuration(30);
    setShowForm(false);
  };

  const handleDelete = (w: OutsideWorkout) => {
    if (w.userId !== currentUser) return;
    Alert.alert("Remove Workout", `Remove "${w.name}"?`, [
      { text: "Keep It", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => deleteOutsideWorkout(w.id),
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#EDE0FF", "#F8F0FF"]}
        style={[styles.header, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 16 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: "#7C3AED" }]}>Workouts</Text>
            <Text style={[styles.subtitle, { color: "#9B6FE5" }]}>Outside the app</Text>
          </View>
          <Pressable
            style={[
              styles.userPill,
              { backgroundColor: user.color + "22", borderColor: user.color + "55" },
            ]}
            onPress={() => setCurrentUser(besties)}
          >
            <Ionicons name="person-circle" size={16} color={user.color} />
            <Text style={[styles.userName, { color: user.color }]}>{user.name}</Text>
            <Ionicons name="chevron-down" size={11} color={user.color} />
          </Pressable>
        </View>

        {/* Monthly stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: user.color + "18", borderColor: user.color + "30" }]}>
            <Text style={[styles.statNum, { color: user.color }]}>{myWorkoutsThisMonth.length}</Text>
            <Text style={[styles.statLabel, { color: user.color }]}>{user.name}'s workouts</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#9B6FE5" + "18", borderColor: "#9B6FE5" + "30" }]}>
            <Text style={[styles.statNum, { color: "#9B6FE5" }]}>{totalMinThis}m</Text>
            <Text style={[styles.statLabel, { color: "#9B6FE5" }]}>total minutes</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: bestie.color + "18", borderColor: bestie.color + "30" }]}>
            <Text style={[styles.statNum, { color: bestie.color }]}>{bestieWorkoutsThisMonth.length}</Text>
            <Text style={[styles.statLabel, { color: bestie.color }]}>{bestie.name}'s workouts</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "web" ? 120 : 100 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Log button / form toggle */}
        {!showForm ? (
          <Pressable onPress={() => setShowForm(true)} style={{ borderRadius: 20, overflow: "hidden" }}>
            <LinearGradient
              colors={["#7C3AED", "#A855F7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.logBtn}
            >
              <Ionicons name="add-circle" size={22} color="#fff" />
              <Text style={styles.logBtnText}>Log a Workout</Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: "#7C3AED30" }]}>
            <View style={styles.formHeader}>
              <Text style={[styles.formTitle, { color: colors.text }]}>Log Workout</Text>
              <Pressable onPress={() => setShowForm(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </Pressable>
            </View>

            {/* Workout type selector */}
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.typeRow}>
                {WORKOUT_TYPES.map((wt) => (
                  <Pressable
                    key={wt.type}
                    style={[
                      styles.typePill,
                      {
                        backgroundColor:
                          selectedType.type === wt.type ? "#7C3AED" : colors.background,
                        borderColor:
                          selectedType.type === wt.type ? "#7C3AED" : colors.border,
                      },
                    ]}
                    onPress={() => {
                      setSelectedType(wt);
                      Haptics.selectionAsync();
                    }}
                  >
                    <Text style={styles.typeEmoji}>{wt.emoji}</Text>
                    <Text
                      style={[
                        styles.typeLabel,
                        { color: selectedType.type === wt.type ? "#fff" : colors.text },
                      ]}
                    >
                      {wt.type}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {/* Workout name */}
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Name (optional)</Text>
            <TextInput
              style={[
                styles.nameInput,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder={selectedType.type}
              placeholderTextColor={colors.mutedForeground}
              value={workoutName}
              onChangeText={setWorkoutName}
              returnKeyType="done"
            />

            {/* Duration */}
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Duration</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.durationRow}>
                {DURATIONS.map((d) => (
                  <Pressable
                    key={d}
                    style={[
                      styles.durationPill,
                      {
                        backgroundColor: duration === d ? "#7C3AED" : colors.background,
                        borderColor: duration === d ? "#7C3AED" : colors.border,
                      },
                    ]}
                    onPress={() => setDuration(d)}
                  >
                    <Text style={[styles.durationText, { color: duration === d ? "#fff" : colors.text }]}>
                      {d}m
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {/* Date */}
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.dateRow}>
                {/* Today and past 6 days */}
                {Array.from({ length: 7 }, (_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - i);
                  return d;
                }).map((d) => {
                  const ds = formatDate(d);
                  const isSel = selectedDate === ds;
                  return (
                    <Pressable
                      key={ds}
                      style={[
                        styles.datePill,
                        {
                          backgroundColor: isSel ? "#7C3AED" : colors.background,
                          borderColor: isSel ? "#7C3AED" : colors.border,
                        },
                      ]}
                      onPress={() => setSelectedDate(ds)}
                    >
                      <Text style={[styles.dayName, { color: isSel ? "#fff" : colors.mutedForeground }]}>
                        {ds === today ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" })}
                      </Text>
                      <Text style={[styles.dayNum, { color: isSel ? "#fff" : colors.text }]}>
                        {d.getDate()}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {/* Notes */}
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Notes (optional)</Text>
            <TextInput
              style={[
                styles.notesInput,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder="How did it go? Any details..."
              placeholderTextColor={colors.mutedForeground}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              returnKeyType="done"
            />

            {/* Log button */}
            <Pressable onPress={handleLog} style={{ borderRadius: 16, overflow: "hidden" }}>
              <LinearGradient
                colors={["#7C3AED", "#A855F7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitBtn}
              >
                <Text style={styles.submitBtnText}>
                  {selectedType.emoji} Log {workoutName.trim() || selectedType.type}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}

        {/* Workout history */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>All Workouts</Text>
        {allWorkouts.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.emptyEmoji}>💪</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No workouts logged yet</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              Tap "Log a Workout" to track your first workout!
            </Text>
          </View>
        )}
        {allWorkouts.map((workout) => {
          const wUser = USERS[workout.userId];
          const ismine = workout.userId === currentUser;
          return (
            <View
              key={workout.id}
              style={[
                styles.workoutCard,
                { backgroundColor: colors.card, borderColor: wUser.color + "30" },
              ]}
            >
              <View style={[styles.workoutEmojiCircle, { backgroundColor: wUser.color + "18" }]}>
                <Text style={styles.workoutEmoji}>{workout.emoji}</Text>
              </View>
              <View style={styles.workoutInfo}>
                <View style={styles.workoutTopRow}>
                  <Text style={[styles.workoutName, { color: colors.text }]} numberOfLines={1}>
                    {workout.name}
                  </Text>
                  <View style={[styles.userTag, { backgroundColor: wUser.color + "18" }]}>
                    <Text style={[styles.userTagText, { color: wUser.color }]}>{wUser.name}</Text>
                  </View>
                </View>
                <Text style={[styles.workoutMeta, { color: colors.mutedForeground }]}>
                  {workout.type} · {workout.duration} min · {displayDate(workout.date)}
                </Text>
                {workout.notes ? (
                  <Text style={[styles.workoutNotes, { color: colors.mutedForeground }]}>
                    {workout.notes}
                  </Text>
                ) : null}
              </View>
              {ismine && (
                <Pressable onPress={() => handleDelete(workout)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={18} color={colors.mutedForeground} />
                </Pressable>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { fontSize: 28, fontFamily: "Poppins_700Bold", letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontFamily: "Poppins_400Regular", marginTop: -4 },
  userPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginTop: 4,
  },
  userName: { fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  statsRow: { flexDirection: "row", gap: 8, marginTop: 14 },
  statCard: {
    flex: 1, alignItems: "center", paddingVertical: 10, paddingHorizontal: 6,
    borderRadius: 14, borderWidth: 1, gap: 2,
  },
  statNum: { fontSize: 20, fontFamily: "Poppins_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Poppins_600SemiBold", textAlign: "center" },
  scrollContent: { padding: 16, gap: 14 },
  logBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 16, borderRadius: 20,
  },
  logBtnText: { fontSize: 16, fontFamily: "Poppins_700Bold", color: "#fff" },
  formCard: { borderRadius: 20, borderWidth: 1.5, padding: 18, gap: 12 },
  formHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  formTitle: { fontSize: 18, fontFamily: "Poppins_700Bold" },
  fieldLabel: { fontSize: 14, fontFamily: "Poppins_700Bold", marginBottom: -6 },
  typeRow: { flexDirection: "row", gap: 8 },
  typePill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 9, borderRadius: 14, borderWidth: 1.5,
  },
  typeEmoji: { fontSize: 16 },
  typeLabel: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  nameInput: {
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, fontFamily: "Poppins_400Regular",
  },
  durationRow: { flexDirection: "row", gap: 8 },
  durationPill: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5,
    alignItems: "center", minWidth: 52,
  },
  durationText: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  dateRow: { flexDirection: "row", gap: 8 },
  datePill: {
    width: 64, height: 64, borderRadius: 16, borderWidth: 1.5,
    alignItems: "center", justifyContent: "center", gap: 2,
  },
  dayName: { fontSize: 10, fontFamily: "Poppins_600SemiBold" },
  dayNum: { fontSize: 20, fontFamily: "Poppins_700Bold" },
  notesInput: {
    borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, fontFamily: "Poppins_400Regular", minHeight: 80, textAlignVertical: "top",
  },
  submitBtn: {
    paddingVertical: 16, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },
  submitBtnText: { fontSize: 16, fontFamily: "Poppins_700Bold", color: "#fff" },
  sectionTitle: { fontSize: 18, fontFamily: "Poppins_700Bold" },
  emptyState: {
    borderRadius: 20, borderWidth: 1.5, padding: 32,
    alignItems: "center", gap: 8,
  },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 16, fontFamily: "Poppins_700Bold" },
  emptySub: { fontSize: 13, fontFamily: "Poppins_400Regular", textAlign: "center" },
  workoutCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    borderRadius: 16, borderWidth: 1.5, padding: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  workoutEmojiCircle: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
  },
  workoutEmoji: { fontSize: 22 },
  workoutInfo: { flex: 1, gap: 3 },
  workoutTopRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  workoutName: { fontSize: 15, fontFamily: "Poppins_700Bold", flex: 1 },
  userTag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  userTagText: { fontSize: 10, fontFamily: "Poppins_700Bold" },
  workoutMeta: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  workoutNotes: { fontSize: 12, fontFamily: "Poppins_400Regular", fontStyle: "italic", marginTop: 2 },
});
