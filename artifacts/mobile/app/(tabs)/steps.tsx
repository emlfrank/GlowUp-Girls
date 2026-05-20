import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
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
import { STEP_GOAL, STEPS_BONUS_POINTS, USERS } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

function StepCard({
  userId,
  steps,
  goal,
}: {
  userId: "kelsey" | "elizabeth";
  steps: number;
  goal: number;
}) {
  const colors = useColors();
  const user = USERS[userId];
  const pct = Math.min(steps / goal, 1);
  const goalMet = pct >= 1;

  return (
    <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: goalMet ? user.color : colors.border, borderWidth: goalMet ? 1.5 : 1 }]}>
      {goalMet && (
        <View style={[styles.goalBanner, { backgroundColor: user.color }]}>
          <Ionicons name="trophy" size={11} color="#fff" />
          <Text style={styles.goalBannerText}>GOAL REACHED · +{STEPS_BONUS_POINTS} PTS</Text>
        </View>
      )}
      <View style={styles.stepCardHeader}>
        <View style={[styles.userDot, { backgroundColor: user.color }]} />
        <Text style={[styles.stepCardName, { color: colors.text }]}>{user.name}</Text>
        <Text style={[styles.stepCount, { color: user.color }]}>{steps.toLocaleString()}</Text>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
        <View style={[styles.progressFill, { width: `${pct * 100}%` as any, backgroundColor: user.color }]} />
      </View>
      <View style={styles.progressLabels}>
        <Text style={[styles.progressPct, { color: goalMet ? user.color : colors.mutedForeground }]}>
          {Math.round(pct * 100)}% of goal
        </Text>
        <Text style={[styles.goalLabel, { color: colors.mutedForeground }]}>
          {goal.toLocaleString()} steps
        </Text>
      </View>

      {/* Steps emoji indicators */}
      {goalMet && (
        <Text style={styles.stepsEmojis}>👟 👟 👟</Text>
      )}
    </View>
  );
}

export default function StepsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getTodaySteps, updateSteps } = useApp();
  const [kelseyInput, setKelseyInput] = useState("");
  const [elizabethInput, setElizabethInput] = useState("");

  const kelseySteps = getTodaySteps("kelsey");
  const elizabethSteps = getTodaySteps("elizabeth");

  const quickAdd = (userId: "kelsey" | "elizabeth", amount: number) => updateSteps(userId, amount);

  const manualAdd = (userId: "kelsey" | "elizabeth", input: string) => {
    const val = parseInt(input);
    if (!isNaN(val) && val > 0) updateSteps(userId, val);
    if (userId === "kelsey") setKelseyInput("");
    else setElizabethInput("");
  };

  const resetSteps = (userId: "kelsey" | "elizabeth") => {
    const current = userId === "kelsey" ? kelseySteps : elizabethSteps;
    updateSteps(userId, -current);
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
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Daily Steps</Text>
          <View style={styles.subtitleRow}>
            <View style={[styles.ruleLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>GOAL: 7,000</Text>
            <View style={[styles.ruleLine, { backgroundColor: colors.border }]} />
          </View>
        </View>
        <View style={[styles.bonusBadge, { backgroundColor: colors.secondary + "18", borderColor: colors.secondary + "40" }]}>
          <Ionicons name="footsteps" size={14} color={colors.secondary} />
          <Text style={[styles.bonusText, { color: colors.secondary }]}>+{STEPS_BONUS_POINTS} pts/day</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Platform.OS === "web" ? 120 : 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's progress cards */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>TODAY'S PROGRESS</Text>
        <StepCard userId="kelsey" steps={kelseySteps} goal={STEP_GOAL} />
        <StepCard userId="elizabeth" steps={elizabethSteps} goal={STEP_GOAL} />

        {/* Log for Kelsey */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>LOG STEPS</Text>
        <View style={[styles.logCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.logHeader}>
            <View style={[styles.userDot, { backgroundColor: USERS.kelsey.color }]} />
            <Text style={[styles.logName, { color: colors.text }]}>Kelsey</Text>
            <Pressable onPress={() => resetSteps("kelsey")} hitSlop={8}>
              <Ionicons name="refresh-outline" size={16} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <View style={styles.quickAddRow}>
            {[1000, 2000, 3000, 5000].map((amt) => (
              <Pressable
                key={amt}
                style={[styles.quickBtn, { backgroundColor: USERS.kelsey.color + "15", borderColor: USERS.kelsey.color + "30" }]}
                onPress={() => quickAdd("kelsey", amt)}
              >
                <Text style={[styles.quickBtnText, { color: USERS.kelsey.color }]}>+{amt >= 1000 ? `${amt / 1000}k` : amt}</Text>
              </Pressable>
            ))}
          </View>
          <View style={[styles.inputRow, { borderColor: colors.border }]}>
            <TextInput
              style={[styles.stepInput, { color: colors.text }]}
              placeholder="Enter steps..."
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              value={kelseyInput}
              onChangeText={setKelseyInput}
              returnKeyType="done"
              onSubmitEditing={() => manualAdd("kelsey", kelseyInput)}
            />
            <Pressable style={[styles.addBtn, { backgroundColor: USERS.kelsey.color }]} onPress={() => manualAdd("kelsey", kelseyInput)}>
              <Ionicons name="add" size={20} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Log for Elizabeth */}
        <View style={[styles.logCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.logHeader}>
            <View style={[styles.userDot, { backgroundColor: USERS.elizabeth.color }]} />
            <Text style={[styles.logName, { color: colors.text }]}>Elizabeth</Text>
            <Pressable onPress={() => resetSteps("elizabeth")} hitSlop={8}>
              <Ionicons name="refresh-outline" size={16} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <View style={styles.quickAddRow}>
            {[1000, 2000, 3000, 5000].map((amt) => (
              <Pressable
                key={amt}
                style={[styles.quickBtn, { backgroundColor: USERS.elizabeth.color + "15", borderColor: USERS.elizabeth.color + "30" }]}
                onPress={() => quickAdd("elizabeth", amt)}
              >
                <Text style={[styles.quickBtnText, { color: USERS.elizabeth.color }]}>+{amt >= 1000 ? `${amt / 1000}k` : amt}</Text>
              </Pressable>
            ))}
          </View>
          <View style={[styles.inputRow, { borderColor: colors.border }]}>
            <TextInput
              style={[styles.stepInput, { color: colors.text }]}
              placeholder="Enter steps..."
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              value={elizabethInput}
              onChangeText={setElizabethInput}
              returnKeyType="done"
              onSubmitEditing={() => manualAdd("elizabeth", elizabethInput)}
            />
            <Pressable style={[styles.addBtn, { backgroundColor: USERS.elizabeth.color }]} onPress={() => manualAdd("elizabeth", elizabethInput)}>
              <Ionicons name="add" size={20} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Info */}
        <View style={[styles.infoCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={15} color={colors.mutedForeground} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            Hit 7,000 steps on any day and earn <Text style={{ color: colors.secondary, fontFamily: "Poppins_700Bold" }}>+{STEPS_BONUS_POINTS} pts</Text>. A 👟 emoji appears on your calendar for that day.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end",
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  title: { fontSize: 26, fontFamily: "Poppins_700Bold", letterSpacing: 0.3 },
  subtitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  ruleLine: { flex: 1, height: 1 },
  subtitle: { fontSize: 9, fontFamily: "Poppins_600SemiBold", letterSpacing: 2.5 },
  bonusBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  bonusText: { fontSize: 12, fontFamily: "Poppins_700Bold" },
  scrollContent: { padding: 20, gap: 12 },
  sectionLabel: { fontSize: 10, fontFamily: "Poppins_700Bold", letterSpacing: 3, marginBottom: -2 },
  stepCard: { borderRadius: 10, overflow: "hidden" },
  goalBanner: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 7, justifyContent: "center" },
  goalBannerText: { fontSize: 10, fontFamily: "Poppins_700Bold", color: "#fff", letterSpacing: 2 },
  stepCardHeader: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, paddingBottom: 10 },
  userDot: { width: 10, height: 10, borderRadius: 5 },
  stepCardName: { flex: 1, fontSize: 17, fontFamily: "Poppins_700Bold" },
  stepCount: { fontSize: 22, fontFamily: "Poppins_700Bold" },
  progressTrack: { height: 8, marginHorizontal: 14, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  progressLabels: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingTop: 4, paddingBottom: 12 },
  progressPct: { fontSize: 12, fontFamily: "Poppins_700Bold" },
  goalLabel: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  stepsEmojis: { textAlign: "center", fontSize: 20, paddingBottom: 12 },
  logCard: { borderRadius: 10, borderWidth: 1, padding: 14, gap: 10 },
  logHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  logName: { flex: 1, fontSize: 15, fontFamily: "Poppins_700Bold" },
  quickAddRow: { flexDirection: "row", gap: 8 },
  quickBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, alignItems: "center" },
  quickBtnText: { fontSize: 13, fontFamily: "Poppins_700Bold" },
  inputRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 8, overflow: "hidden" },
  stepInput: { flex: 1, paddingHorizontal: 12, paddingVertical: 12, fontSize: 14, fontFamily: "Poppins_400Regular" },
  addBtn: { width: 46, height: 46, alignItems: "center", justifyContent: "center" },
  infoCard: { flexDirection: "row", gap: 8, alignItems: "flex-start", borderRadius: 10, borderWidth: 1, padding: 12 },
  infoText: { flex: 1, fontSize: 12, fontFamily: "Poppins_400Regular", lineHeight: 18 },
});
