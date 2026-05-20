import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
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
import {
  daysUntilEndOfMonth,
  formatYearMonth,
  getCurrentYearMonth,
  PRIZE_TIERS,
  USERS,
} from "@/constants/data";
import { useColors } from "@/hooks/useColors";

export default function PrizeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getMonthlyPoints, getPointsBreakdown, getMonthlyWinner, getMonthlyHistory } = useApp();
  const [historyOpen, setHistoryOpen] = useState(false);

  const currentYM = getCurrentYearMonth();
  const daysLeft = daysUntilEndOfMonth();

  const kPts = getMonthlyPoints("kelsey");
  const ePts = getMonthlyPoints("elizabeth");
  const kBreak = getPointsBreakdown("kelsey");
  const eBreak = getPointsBreakdown("elizabeth");
  const winner = getMonthlyWinner();
  const history = getMonthlyHistory();

  const kTier = PRIZE_TIERS.filter((t) => kPts >= t.points).pop();
  const eTier = PRIZE_TIERS.filter((t) => ePts >= t.points).pop();
  const kNextTier = PRIZE_TIERS.find((t) => kPts < t.points);
  const eNextTier = PRIZE_TIERS.find((t) => ePts < t.points);
  const maxTierPts = PRIZE_TIERS[PRIZE_TIERS.length - 1].points;

  function BreakdownRow({ label, value, negative }: { label: string; value: number; negative?: boolean }) {
    if (value === 0) return null;
    return (
      <View style={styles.breakdownRow}>
        <Text style={[styles.breakdownLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.breakdownValue, { color: negative ? colors.destructive : colors.secondary }]}>
          {negative ? "−" : "+"}{value}
        </Text>
      </View>
    );
  }

  function UserCard({ userId }: { userId: "kelsey" | "elizabeth" }) {
    const user = USERS[userId];
    const pts = userId === "kelsey" ? kPts : ePts;
    const breakdown = userId === "kelsey" ? kBreak : eBreak;
    const tier = userId === "kelsey" ? kTier : eTier;
    const nextTier = userId === "kelsey" ? kNextTier : eNextTier;
    const isWinner = winner === userId;
    const progress = Math.min(pts / maxTierPts, 1);

    return (
      <View style={[styles.userCard, { backgroundColor: colors.card, borderColor: isWinner ? user.color : colors.border }]}>
        {isWinner && (
          <View style={[styles.winnerBanner, { backgroundColor: user.color }]}>
            <Ionicons name="trophy" size={11} color="#fff" />
            <Text style={styles.winnerBannerText}>LEADING THIS MONTH</Text>
          </View>
        )}

        <View style={styles.userCardHeader}>
          <View style={[styles.userDot, { backgroundColor: user.color }]} />
          <Text style={[styles.userCardName, { color: colors.text }]}>{user.name}</Text>
          <View style={[styles.pointsBubble, { backgroundColor: user.color + "18", borderColor: user.color + "40" }]}>
            <Text style={[styles.pointsBubbleText, { color: user.color }]}>{pts.toLocaleString()} pts</Text>
          </View>
        </View>

        {/* Progress bar with tier markers */}
        <View style={styles.progressWrapper}>
          <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
            {PRIZE_TIERS.map((t) => (
              <View
                key={t.points}
                style={[
                  styles.tierMark,
                  {
                    left: `${(t.points / maxTierPts) * 100}%` as any,
                    backgroundColor: pts >= t.points ? user.color + "60" : colors.border,
                  },
                ]}
              />
            ))}
            <View style={[styles.progressFill, { width: `${progress * 100}%` as any, backgroundColor: user.color }]} />
          </View>
          <View style={styles.tierEmojis}>
            {PRIZE_TIERS.map((t) => (
              <Text key={t.points} style={[styles.tierEmoji, { opacity: pts >= t.points ? 1 : 0.3 }]}>
                {t.emoji}
              </Text>
            ))}
          </View>
        </View>

        {/* Current tier */}
        {tier ? (
          <View style={[styles.tierBox, { backgroundColor: user.color + "10", borderColor: user.color + "30" }]}>
            <Text style={styles.tierBoxEmoji}>{tier.emoji}</Text>
            <View style={styles.tierBoxText}>
              <Text style={[styles.tierBoxName, { color: colors.text }]}>{tier.name}</Text>
              <Text style={[styles.tierBoxDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
                {tier.description}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={[styles.noTierYet, { color: colors.mutedForeground }]}>
            Reach 500 pts to unlock your first prize 🎯
          </Text>
        )}

        {nextTier ? (
          <Text style={[styles.nextTierHint, { color: colors.mutedForeground }]}>
            {nextTier.points - pts} pts away from {nextTier.emoji} {nextTier.name}
          </Text>
        ) : pts > 0 ? (
          <Text style={[styles.nextTierHint, { color: colors.secondary }]}>Maximum tier unlocked! 🏆</Text>
        ) : null}

        {/* Points breakdown */}
        <View style={[styles.breakdownCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Text style={[styles.breakdownTitle, { color: colors.mutedForeground }]}>BREAKDOWN</Text>
          <BreakdownRow label={`${Math.floor(breakdown.classPoints / 100)} class${Math.floor(breakdown.classPoints / 100) !== 1 ? "es" : ""}`} value={breakdown.classPoints} />
          <BreakdownRow label="Steps goal days" value={breakdown.stepsBonus} />
          <BreakdownRow label="Cancellations" value={breakdown.cancelPenalty} negative />
          <BreakdownRow label="Missed weeks" value={breakdown.weeklyPenalty} negative />
          {breakdown.classPoints === 0 && breakdown.stepsBonus === 0 && (
            <Text style={[styles.breakdownLabel, { color: colors.mutedForeground, fontStyle: "italic" }]}>
              No activity yet this month
            </Text>
          )}
          <View style={[styles.breakdownDivider, { backgroundColor: colors.border }]} />
          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { color: colors.text, fontFamily: "Poppins_700Bold" }]}>Total</Text>
            <Text style={[styles.breakdownValue, { color: user.color, fontFamily: "Poppins_700Bold" }]}>{pts}</Text>
          </View>
        </View>
      </View>
    );
  }

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
          <Text style={[styles.title, { color: colors.text }]}>Prize Registry</Text>
          <View style={styles.subtitleRow}>
            <View style={[styles.ruleLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {formatYearMonth(currentYM).toUpperCase()}
            </Text>
            <View style={[styles.ruleLine, { backgroundColor: colors.border }]} />
          </View>
        </View>
        <View style={[styles.daysLeftBadge, { borderColor: colors.border, backgroundColor: colors.muted }]}>
          <Text style={[styles.daysLeftNum, { color: colors.text }]}>{daysLeft}</Text>
          <Text style={[styles.daysLeftLabel, { color: colors.mutedForeground }]}>days left</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Platform.OS === "web" ? 120 : 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Prize tiers reference */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PRIZE TIERS</Text>
        <View style={[styles.tiersRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {PRIZE_TIERS.map((tier, i) => (
            <React.Fragment key={tier.points}>
              <View style={styles.tierItem}>
                <Text style={styles.tierItemEmoji}>{tier.emoji}</Text>
                <Text style={[styles.tierItemPts, { color: colors.text }]}>{tier.points}</Text>
                <Text style={[styles.tierItemName, { color: colors.mutedForeground }]}>{tier.name}</Text>
              </View>
              {i < PRIZE_TIERS.length - 1 && (
                <View style={[styles.tierDivider, { backgroundColor: colors.border }]} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Winner */}
        {winner && (
          <View
            style={[
              styles.winnerCard,
              {
                borderColor: winner === "tie" ? colors.accent + "60" : USERS[winner].color + "60",
                backgroundColor: winner === "tie" ? colors.accent + "10" : USERS[winner].color + "10",
              },
            ]}
          >
            <Ionicons name="trophy" size={22} color={winner === "tie" ? colors.accent : USERS[winner].color} />
            <View>
              <Text style={[styles.winnerLabel, { color: colors.mutedForeground }]}>CURRENTLY LEADING</Text>
              <Text style={[styles.winnerName, { color: winner === "tie" ? colors.accent : USERS[winner].color }]}>
                {winner === "tie" ? "It's a tie!" : `${USERS[winner].name} is winning!`}
              </Text>
            </View>
          </View>
        )}

        {/* User cards */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>YOUR POINTS</Text>
        <UserCard userId="kelsey" />
        <UserCard userId="elizabeth" />

        {/* Scoring rules */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>HOW POINTS WORK</Text>
        <View style={[styles.rulesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { icon: "add-circle", label: "Book a class", pts: "+100 pts", color: colors.secondary },
            { icon: "footsteps", label: "Hit steps goal (7,000/day)", pts: "+25 pts", color: colors.secondary },
            { icon: "close-circle", label: "Cancel a class", pts: "−100 pts", color: colors.destructive },
            { icon: "calendar-outline", label: "Miss a full week", pts: "−500 pts", color: colors.destructive },
          ].map((rule) => (
            <View key={rule.label} style={styles.ruleRow}>
              <Ionicons name={rule.icon as any} size={16} color={rule.color} />
              <Text style={[styles.ruleLabel, { color: colors.text }]}>{rule.label}</Text>
              <Text style={[styles.rulePts, { color: rule.color }]}>{rule.pts}</Text>
            </View>
          ))}
        </View>

        {/* History */}
        {history.length > 0 && (
          <>
            <Pressable style={styles.historyToggle} onPress={() => setHistoryOpen((o) => !o)}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginBottom: 0 }]}>PAST MONTHS</Text>
              <Ionicons name={historyOpen ? "chevron-up" : "chevron-down"} size={14} color={colors.mutedForeground} />
            </Pressable>
            {historyOpen && (
              <View style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {history.map((h) => {
                  const hw = h.kelseyPoints > h.elizabethPoints ? "kelsey" : h.elizabethPoints > h.kelseyPoints ? "elizabeth" : "tie";
                  return (
                    <View key={h.yearMonth} style={[styles.historyRow, { borderBottomColor: colors.border }]}>
                      <Text style={[styles.historyMonth, { color: colors.text }]}>{formatYearMonth(h.yearMonth)}</Text>
                      <View style={styles.historyScores}>
                        <Text style={[styles.historyScore, { color: USERS.kelsey.color }]}>K: {h.kelseyPoints}</Text>
                        <Text style={[styles.historyScore, { color: USERS.elizabeth.color }]}>E: {h.elizabethPoints}</Text>
                        {hw !== "tie" && <Ionicons name="trophy" size={12} color={USERS[hw].color} />}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
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
  daysLeftBadge: { alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  daysLeftNum: { fontSize: 22, fontFamily: "Poppins_700Bold" },
  daysLeftLabel: { fontSize: 9, fontFamily: "Poppins_600SemiBold", letterSpacing: 1 },
  scrollContent: { padding: 20, gap: 14 },
  sectionLabel: { fontSize: 10, fontFamily: "Poppins_700Bold", letterSpacing: 3, marginBottom: -2 },
  tiersRow: { flexDirection: "row", borderRadius: 10, borderWidth: 1, overflow: "hidden" },
  tierItem: { flex: 1, alignItems: "center", paddingVertical: 12, gap: 2 },
  tierItemEmoji: { fontSize: 20 },
  tierItemPts: { fontSize: 11, fontFamily: "Poppins_700Bold" },
  tierItemName: { fontSize: 8, fontFamily: "Poppins_600SemiBold", textAlign: "center", letterSpacing: 0.3, paddingHorizontal: 2 },
  tierDivider: { width: 1 },
  winnerCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 10, borderWidth: 1.5, padding: 14 },
  winnerLabel: { fontSize: 9, fontFamily: "Poppins_700Bold", letterSpacing: 2 },
  winnerName: { fontSize: 18, fontFamily: "Poppins_700Bold" },
  userCard: { borderRadius: 10, borderWidth: 1.5, overflow: "hidden" },
  winnerBanner: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 7, justifyContent: "center" },
  winnerBannerText: { fontSize: 10, fontFamily: "Poppins_700Bold", color: "#fff", letterSpacing: 2 },
  userCardHeader: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  userDot: { width: 10, height: 10, borderRadius: 5 },
  userCardName: { flex: 1, fontSize: 18, fontFamily: "Poppins_700Bold" },
  pointsBubble: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  pointsBubbleText: { fontSize: 16, fontFamily: "Poppins_700Bold" },
  progressWrapper: { paddingHorizontal: 16, marginBottom: 10, gap: 4 },
  progressTrack: { height: 8, borderRadius: 4, overflow: "hidden", position: "relative" },
  progressFill: { position: "absolute", top: 0, left: 0, bottom: 0, borderRadius: 4 },
  tierMark: { position: "absolute", top: 0, bottom: 0, width: 2 },
  tierEmojis: { flexDirection: "row", justifyContent: "space-between" },
  tierEmoji: { fontSize: 16 },
  tierBox: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 14, marginBottom: 10, borderRadius: 8, borderWidth: 1, padding: 12 },
  tierBoxEmoji: { fontSize: 26 },
  tierBoxText: { flex: 1, gap: 2 },
  tierBoxName: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  tierBoxDesc: { fontSize: 12, fontFamily: "Poppins_400Regular", lineHeight: 16 },
  noTierYet: { fontSize: 13, fontFamily: "Poppins_400Regular", marginHorizontal: 14, marginBottom: 10, fontStyle: "italic" },
  nextTierHint: { fontSize: 12, fontFamily: "Poppins_500Medium", marginHorizontal: 14, marginBottom: 12 },
  breakdownCard: { margin: 14, marginTop: 0, borderRadius: 8, borderWidth: 1, padding: 12, gap: 5 },
  breakdownTitle: { fontSize: 9, fontFamily: "Poppins_700Bold", letterSpacing: 2.5, marginBottom: 4 },
  breakdownRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  breakdownLabel: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  breakdownValue: { fontSize: 13, fontFamily: "Poppins_700Bold" },
  breakdownDivider: { height: 1, marginVertical: 4 },
  rulesCard: { borderRadius: 10, borderWidth: 1, padding: 14, gap: 10 },
  ruleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  ruleLabel: { flex: 1, fontSize: 13, fontFamily: "Poppins_400Regular" },
  rulePts: { fontSize: 13, fontFamily: "Poppins_700Bold" },
  historyToggle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  historyCard: { borderRadius: 10, borderWidth: 1, overflow: "hidden" },
  historyRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
  historyMonth: { fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  historyScores: { flexDirection: "row", alignItems: "center", gap: 10 },
  historyScore: { fontSize: 13, fontFamily: "Poppins_700Bold" },
});
