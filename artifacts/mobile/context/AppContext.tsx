import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  CANCEL_PENALTY,
  formatDate,
  getCurrentYearMonth,
  POINTS_PER_CLASS,
  STEP_GOAL,
  STEPS_BONUS_POINTS,
  UserId,
  WEEKLY_MISS_PENALTY,
} from "@/constants/data";

export interface Booking {
  id: string;
  classId: string;
  creatorId: string;
  className: string;
  creatorName: string;
  userId: UserId;
  date: string;
  time: string;
  addedToCalendar: boolean;
  canceled?: boolean;
  isCustom?: boolean;
  youtubeUrl?: string;
}

export interface Invitation {
  id: string;
  classId: string;
  creatorId: string;
  className: string;
  creatorName: string;
  fromUserId: UserId;
  toUserId: UserId;
  date: string;
  time: string;
  status: "pending" | "accepted" | "declined";
}

export interface CustomClass {
  id: string;
  creatorId: string;
  creatorName: string;
  name: string;
  duration: number;
  youtubeUrl: string;
  videoId: string;
  createdBy: UserId;
}

export interface DailySteps {
  date: string;
  kelsey: number;
  elizabeth: number;
}

export interface MonthSummary {
  yearMonth: string;
  kelseyPoints: number;
  elizabethPoints: number;
}

export interface OutsideWorkout {
  id: string;
  userId: UserId;
  name: string;
  type: string;
  emoji: string;
  duration: number;
  date: string;
  notes: string;
}

export interface Reaction {
  id: string;
  bookingId: string;
  fromUserId: UserId;
  emoji: string;
  createdAt: string;
}

export interface PointsBreakdown {
  classPoints: number;
  cancelPenalty: number;
  stepsBonus: number;
  weeklyPenalty: number;
  total: number;
}

interface AppContextType {
  currentUser: UserId;
  setCurrentUser: (user: UserId) => void;
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, "id" | "addedToCalendar" | "canceled">) => Booking;
  cancelBooking: (bookingId: string) => void;
  markCalendarAdded: (bookingId: string) => void;
  isSlotBooked: (classId: string, date: string, time: string) => boolean;
  bookTogether: (params: Omit<Booking, "id" | "addedToCalendar" | "canceled" | "userId">) => [Booking, Booking];
  invitations: Invitation[];
  sendInvitation: (params: Omit<Invitation, "id" | "status">) => Invitation;
  acceptInvitation: (invitationId: string) => Booking;
  declineInvitation: (invitationId: string) => void;
  getPendingInvitationsForUser: (userId: UserId) => Invitation[];
  customClasses: CustomClass[];
  addCustomClass: (cls: Omit<CustomClass, "id">) => CustomClass;
  getCustomClassById: (id: string) => CustomClass | undefined;
  stepLogs: DailySteps[];
  getTodaySteps: (userId: UserId) => number;
  updateSteps: (userId: UserId, steps: number) => void;
  getMonthlyPoints: (userId: UserId) => number;
  getPointsBreakdown: (userId: UserId) => PointsBreakdown;
  getMonthlyWinner: () => UserId | "tie" | null;
  getMonthlyHistory: () => MonthSummary[];
  getUpcomingBookings: (userId: UserId) => Booking[];
  outsideWorkouts: OutsideWorkout[];
  addOutsideWorkout: (w: Omit<OutsideWorkout, "id">) => OutsideWorkout;
  deleteOutsideWorkout: (id: string) => void;
  reactions: Reaction[];
  addReaction: (bookingId: string, fromUserId: UserId, emoji: string) => void;
  removeReaction: (bookingId: string, fromUserId: UserId) => void;
  getReactionsForBooking: (bookingId: string) => Reaction[];
  getStreak: (userId: UserId) => number;
  getActivitiesForDate: (date: string) => { bookings: Booking[]; outsideWorkouts: OutsideWorkout[] };
  getActivityDates: (userId: UserId) => Set<string>;
  getStepsGoalDates: (userId: UserId) => Set<string>;
}

const AppContext = createContext<AppContextType | null>(null);

const BOOKINGS_KEY = "@glowup_bookings_v3";
const STEPS_KEY = "@glowup_steps";
const USER_KEY = "@glowup_user";
const CUSTOM_CLASSES_KEY = "@glowup_custom_classes";
const OUTSIDE_WORKOUTS_KEY = "@glowup_outside_workouts";
const REACTIONS_KEY = "@glowup_reactions";
const INVITATIONS_KEY = "@glowup_invitations";

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<UserId>("kelsey");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customClasses, setCustomClasses] = useState<CustomClass[]>([]);
  const [stepLogs, setStepLogs] = useState<DailySteps[]>([]);
  const [outsideWorkouts, setOutsideWorkouts] = useState<OutsideWorkout[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const results = await Promise.all([
          AsyncStorage.getItem(USER_KEY),
          AsyncStorage.getItem(BOOKINGS_KEY),
          AsyncStorage.getItem(STEPS_KEY),
          AsyncStorage.getItem(CUSTOM_CLASSES_KEY),
          AsyncStorage.getItem(OUTSIDE_WORKOUTS_KEY),
          AsyncStorage.getItem(REACTIONS_KEY),
          AsyncStorage.getItem(INVITATIONS_KEY),
        ]);
        if (results[0]) setCurrentUserState(results[0] as UserId);
        if (results[1]) setBookings(JSON.parse(results[1]));
        if (results[2]) setStepLogs(JSON.parse(results[2]));
        if (results[3]) setCustomClasses(JSON.parse(results[3]));
        if (results[4]) setOutsideWorkouts(JSON.parse(results[4]));
        if (results[5]) setReactions(JSON.parse(results[5]));
        if (results[6]) setInvitations(JSON.parse(results[6]));
      } catch {}
    })();
  }, []);

  const setCurrentUser = useCallback(async (user: UserId) => {
    setCurrentUserState(user);
    await AsyncStorage.setItem(USER_KEY, user);
  }, []);

  const _saveBookings = (updated: Booking[]) => {
    AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
  };

  const addBooking = useCallback(
    (booking: Omit<Booking, "id" | "addedToCalendar" | "canceled">): Booking => {
      const newBooking: Booking = { ...booking, id: uid(), addedToCalendar: false, canceled: false };
      setBookings((prev) => { const u = [...prev, newBooking]; _saveBookings(u); return u; });
      return newBooking;
    },
    []
  );

  const cancelBooking = useCallback((bookingId: string) => {
    setBookings((prev) => {
      const updated = prev.map((b) => b.id === bookingId ? { ...b, canceled: true } : b);
      _saveBookings(updated);
      return updated;
    });
  }, []);

  const markCalendarAdded = useCallback((bookingId: string) => {
    setBookings((prev) => {
      const updated = prev.map((b) => b.id === bookingId ? { ...b, addedToCalendar: true } : b);
      _saveBookings(updated);
      return updated;
    });
  }, []);

  const isSlotBooked = useCallback(
    (classId: string, date: string, time: string) =>
      bookings.some((b) => b.classId === classId && b.date === date && b.time === time && !b.canceled),
    [bookings]
  );

  const bookTogether = useCallback(
    (params: Omit<Booking, "id" | "addedToCalendar" | "canceled" | "userId">): [Booking, Booking] => {
      const b1: Booking = { ...params, userId: "kelsey", id: uid(), addedToCalendar: false, canceled: false };
      const b2: Booking = { ...params, userId: "elizabeth", id: uid(), addedToCalendar: false, canceled: false };
      setBookings((prev) => { const u = [...prev, b1, b2]; _saveBookings(u); return u; });
      return [b1, b2];
    },
    []
  );

  const _saveInvitations = (updated: Invitation[]) => {
    AsyncStorage.setItem(INVITATIONS_KEY, JSON.stringify(updated));
  };

  const sendInvitation = useCallback((params: Omit<Invitation, "id" | "status">): Invitation => {
    const inv: Invitation = { ...params, id: uid(), status: "pending" };
    setInvitations((prev) => { const u = [...prev, inv]; _saveInvitations(u); return u; });
    return inv;
  }, []);

  const acceptInvitation = useCallback(
    (invitationId: string): Booking => {
      let newBooking!: Booking;
      setInvitations((prev) => {
        const updated = prev.map((inv) => {
          if (inv.id !== invitationId) return inv;
          newBooking = {
            id: uid(), classId: inv.classId, creatorId: inv.creatorId,
            className: inv.className, creatorName: inv.creatorName,
            userId: inv.toUserId, date: inv.date, time: inv.time,
            addedToCalendar: false, canceled: false,
          };
          return { ...inv, status: "accepted" as const };
        });
        _saveInvitations(updated);
        return updated;
      });
      setBookings((prev) => { const u = [...prev, newBooking]; _saveBookings(u); return u; });
      return newBooking;
    },
    []
  );

  const declineInvitation = useCallback((invitationId: string) => {
    setInvitations((prev) => {
      const updated = prev.map((inv) =>
        inv.id === invitationId ? { ...inv, status: "declined" as const } : inv
      );
      _saveInvitations(updated);
      return updated;
    });
  }, []);

  const getPendingInvitationsForUser = useCallback(
    (userId: UserId) => invitations.filter((inv) => inv.toUserId === userId && inv.status === "pending"),
    [invitations]
  );

  const addCustomClass = useCallback((cls: Omit<CustomClass, "id">): CustomClass => {
    const newCls: CustomClass = { ...cls, id: "custom-" + uid() };
    setCustomClasses((prev) => {
      const updated = [...prev, newCls];
      AsyncStorage.setItem(CUSTOM_CLASSES_KEY, JSON.stringify(updated));
      return updated;
    });
    return newCls;
  }, []);

  const getCustomClassById = useCallback(
    (id: string) => customClasses.find((c) => c.id === id),
    [customClasses]
  );

  const getTodaySteps = useCallback(
    (userId: UserId): number => {
      const today = formatDate(new Date());
      const log = stepLogs.find((s) => s.date === today);
      return log ? log[userId] : 0;
    },
    [stepLogs]
  );

  const updateSteps = useCallback((userId: UserId, steps: number) => {
    const today = formatDate(new Date());
    setStepLogs((prev) => {
      const existing = prev.find((s) => s.date === today);
      let updated: DailySteps[];
      if (existing) {
        updated = prev.map((s) =>
          s.date === today ? { ...s, [userId]: Math.max(0, s[userId] + steps) } : s
        );
      } else {
        const newLog: DailySteps = { date: today, kelsey: 0, elizabeth: 0 };
        newLog[userId] = Math.max(0, steps);
        updated = [...prev, newLog];
      }
      AsyncStorage.setItem(STEPS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getPointsBreakdown = useCallback(
    (userId: UserId): PointsBreakdown => {
      const ym = getCurrentYearMonth();
      const [year, month] = ym.split("-").map(Number);
      const now = new Date();

      const activeBookings = bookings.filter(
        (b) => b.userId === userId && b.date.startsWith(ym) && !b.canceled
      );
      const canceledBookings = bookings.filter(
        (b) => b.userId === userId && b.date.startsWith(ym) && b.canceled
      );
      const classPoints = activeBookings.length * POINTS_PER_CLASS;
      const cancelPenalty = canceledBookings.length * CANCEL_PENALTY;

      const stepsBonus =
        stepLogs.filter((s) => s.date.startsWith(ym) && s[userId] >= STEP_GOAL).length *
        STEPS_BONUS_POINTS;

      // Weekly miss penalty: each fully elapsed Mon–Sun week in current month
      let weeklyPenalty = 0;
      let weekStart = new Date(year, month - 1, 1);
      const dayOfWeek = weekStart.getDay();
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      weekStart.setDate(weekStart.getDate() + daysToMonday);

      const currentWeekStart = new Date(now);
      const curDay = now.getDay();
      currentWeekStart.setDate(now.getDate() + (curDay === 0 ? -6 : 1 - curDay));
      currentWeekStart.setHours(0, 0, 0, 0);

      while (weekStart < currentWeekStart) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        // Only count if week overlaps the current month
        const targetMonth = month - 1;
        if (weekEnd.getMonth() === targetMonth || weekStart.getMonth() === targetMonth) {
          const hasClass = bookings.some((b) => {
            if (b.userId !== userId || b.canceled) return false;
            const bDate = new Date(b.date + "T12:00:00");
            return bDate >= weekStart && bDate <= weekEnd;
          });
          if (!hasClass) weeklyPenalty += WEEKLY_MISS_PENALTY;
        }
        weekStart.setDate(weekStart.getDate() + 7);
      }

      const total = Math.max(0, classPoints - cancelPenalty + stepsBonus - weeklyPenalty);
      return { classPoints, cancelPenalty, stepsBonus, weeklyPenalty, total };
    },
    [bookings, stepLogs]
  );

  const getMonthlyPoints = useCallback(
    (userId: UserId) => getPointsBreakdown(userId).total,
    [getPointsBreakdown]
  );

  const getMonthlyWinner = useCallback((): UserId | "tie" | null => {
    const k = getMonthlyPoints("kelsey");
    const e = getMonthlyPoints("elizabeth");
    if (k === 0 && e === 0) return null;
    if (k === e) return "tie";
    return k > e ? "kelsey" : "elizabeth";
  }, [getMonthlyPoints]);

  const getMonthlyHistory = useCallback((): MonthSummary[] => {
    const currentYM = getCurrentYearMonth();
    const months: Record<string, { kBookings: number; eBookings: number }> = {};
    for (const b of bookings) {
      const ym = b.date.substring(0, 7);
      if (ym === currentYM) continue;
      if (!months[ym]) months[ym] = { kBookings: 0, eBookings: 0 };
      if (!b.canceled) {
        if (b.userId === "kelsey") months[ym].kBookings++;
        else months[ym].eBookings++;
      }
    }
    return Object.entries(months)
      .map(([ym, { kBookings, eBookings }]) => ({
        yearMonth: ym,
        kelseyPoints: kBookings * POINTS_PER_CLASS,
        elizabethPoints: eBookings * POINTS_PER_CLASS,
      }))
      .sort((a, b) => b.yearMonth.localeCompare(a.yearMonth));
  }, [bookings]);

  const getUpcomingBookings = useCallback(
    (userId: UserId): Booking[] => {
      const today = formatDate(new Date());
      return bookings
        .filter((b) => b.userId === userId && b.date >= today && !b.canceled)
        .sort((a, b) => a.date !== b.date ? a.date.localeCompare(b.date) : a.time.localeCompare(b.time));
    },
    [bookings]
  );

  const addOutsideWorkout = useCallback((w: Omit<OutsideWorkout, "id">): OutsideWorkout => {
    const newW: OutsideWorkout = { ...w, id: "ow-" + uid() };
    setOutsideWorkouts((prev) => {
      const updated = [...prev, newW];
      AsyncStorage.setItem(OUTSIDE_WORKOUTS_KEY, JSON.stringify(updated));
      return updated;
    });
    return newW;
  }, []);

  const deleteOutsideWorkout = useCallback((id: string) => {
    setOutsideWorkouts((prev) => {
      const updated = prev.filter((w) => w.id !== id);
      AsyncStorage.setItem(OUTSIDE_WORKOUTS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addReaction = useCallback((bookingId: string, fromUserId: UserId, emoji: string) => {
    setReactions((prev) => {
      const filtered = prev.filter(
        (r) => !(r.bookingId === bookingId && r.fromUserId === fromUserId)
      );
      const updated = [
        ...filtered,
        { id: "r-" + uid(), bookingId, fromUserId, emoji, createdAt: new Date().toISOString() },
      ];
      AsyncStorage.setItem(REACTIONS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeReaction = useCallback((bookingId: string, fromUserId: UserId) => {
    setReactions((prev) => {
      const updated = prev.filter(
        (r) => !(r.bookingId === bookingId && r.fromUserId === fromUserId)
      );
      AsyncStorage.setItem(REACTIONS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getReactionsForBooking = useCallback(
    (bookingId: string) => reactions.filter((r) => r.bookingId === bookingId),
    [reactions]
  );

  const getStreak = useCallback(
    (userId: UserId): number => {
      const activityDates = new Set<string>();
      bookings.filter((b) => b.userId === userId && !b.canceled).forEach((b) => activityDates.add(b.date));
      outsideWorkouts.filter((w) => w.userId === userId).forEach((w) => activityDates.add(w.date));
      const today = formatDate(new Date());
      const yesterday = formatDate(new Date(new Date().getTime() - 86400000));
      const startFrom = activityDates.has(today) ? today : activityDates.has(yesterday) ? yesterday : null;
      if (!startFrom) return 0;
      let streak = 0;
      let checkDate = startFrom;
      while (activityDates.has(checkDate)) {
        streak++;
        const d = new Date(checkDate + "T12:00:00");
        d.setDate(d.getDate() - 1);
        checkDate = formatDate(d);
      }
      return streak;
    },
    [bookings, outsideWorkouts]
  );

  const getActivitiesForDate = useCallback(
    (date: string) => ({
      bookings: bookings.filter((b) => b.date === date && !b.canceled),
      outsideWorkouts: outsideWorkouts.filter((w) => w.date === date),
    }),
    [bookings, outsideWorkouts]
  );

  const getActivityDates = useCallback(
    (userId: UserId): Set<string> => {
      const dates = new Set<string>();
      bookings.filter((b) => b.userId === userId && !b.canceled).forEach((b) => dates.add(b.date));
      outsideWorkouts.filter((w) => w.userId === userId).forEach((w) => dates.add(w.date));
      return dates;
    },
    [bookings, outsideWorkouts]
  );

  const getStepsGoalDates = useCallback(
    (userId: UserId): Set<string> => {
      const dates = new Set<string>();
      stepLogs.filter((s) => s[userId] >= STEP_GOAL).forEach((s) => dates.add(s.date));
      return dates;
    },
    [stepLogs]
  );

  return (
    <AppContext.Provider
      value={{
        currentUser, setCurrentUser,
        bookings, addBooking, cancelBooking, markCalendarAdded, isSlotBooked, bookTogether,
        invitations, sendInvitation, acceptInvitation, declineInvitation, getPendingInvitationsForUser,
        customClasses, addCustomClass, getCustomClassById,
        stepLogs, getTodaySteps, updateSteps,
        getMonthlyPoints, getPointsBreakdown, getMonthlyWinner, getMonthlyHistory,
        getUpcomingBookings,
        outsideWorkouts, addOutsideWorkout, deleteOutsideWorkout,
        reactions, addReaction, removeReaction, getReactionsForBooking,
        getStreak, getActivitiesForDate, getActivityDates, getStepsGoalDates,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
