export interface FitnessClass {
  id: string;
  name: string;
  duration: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  youtubeUrl: string;
}

export interface Creator {
  id: string;
  name: string;
  handle: string;
  tagline: string;
  gradient: readonly [string, string];
  iconColor: string;
  classes: FitnessClass[];
}

export interface PrizeTier {
  points: number;
  name: string;
  emoji: string;
  description: string;
}

export const PRIZE_TIERS: PrizeTier[] = [
  {
    points: 500,
    name: "Film Night Kit",
    emoji: "🎬",
    description: "Artisan popcorn, a scented candle, face masks & a feel-good film you both pick",
  },
  {
    points: 1000,
    name: "Smoothie Bar Fund",
    emoji: "🥤",
    description: "$15 each at your favourite juice bar or açaí bowl spot",
  },
  {
    points: 1500,
    name: "Spa Afternoon",
    emoji: "🛁",
    description: "A shared spa budget for a treatment, massage, or the fanciest at-home pamper session",
  },
  {
    points: 2000,
    name: "Fancy Brunch Date",
    emoji: "🥂",
    description: "A proper celebration brunch, dressed up — your choice of spot",
  },
];

export const CREATORS: Creator[] = [
  {
    id: "pilates-raven",
    name: "Pilates Body Raven",
    handle: "@pilatesbodyraven",
    tagline: "Sculpt & tone with Pilates",
    gradient: ["#D49BAA", "#BF6375"] as const,
    iconColor: "#BF6375",
    classes: [
      { id: "pbr-1",  name: "Full Body Pilates Sculpt",   duration: 30, level: "Intermediate", description: "A full-body Pilates session targeting every muscle group for a long, lean look.",                        youtubeUrl: "https://www.youtube.com/@pilatesbodyraven/search?query=full+body+sculpt" },
      { id: "pbr-2",  name: "Core & Glutes Burn",          duration: 20, level: "Intermediate", description: "Intense core and glute work to strengthen and tone your powerhouse.",                                   youtubeUrl: "https://www.youtube.com/@pilatesbodyraven/search?query=core+glutes+burn" },
      { id: "pbr-3",  name: "Beginner Pilates Flow",        duration: 25, level: "Beginner",     description: "Perfect introduction to Pilates with foundational movements.",                                         youtubeUrl: "https://www.youtube.com/@pilatesbodyraven/search?query=beginner+flow" },
      { id: "pbr-4",  name: "Reformer-Inspired Mat",        duration: 45, level: "Advanced",     description: "Reformer machine exercises adapted for your mat at home.",                                             youtubeUrl: "https://www.youtube.com/@pilatesbodyraven/search?query=reformer+inspired+mat" },
      { id: "pbr-5",  name: "Arms & Upper Body",             duration: 20, level: "Beginner",     description: "Sculpt gorgeous arms and open your chest with targeted Pilates moves.",                               youtubeUrl: "https://www.youtube.com/@pilatesbodyraven/search?query=arms+upper+body" },
      { id: "pbr-6",  name: "Flat Abs Pilates",              duration: 25, level: "Intermediate", description: "Targeted abdominal work inspired by classical Pilates for a strong, toned core.",                    youtubeUrl: "https://www.youtube.com/@pilatesbodyraven/search?query=flat+abs" },
      { id: "pbr-7",  name: "Lower Body Burn",               duration: 30, level: "Intermediate", description: "Thighs, glutes, and calves — a lower body Pilates flow that burns.",                                 youtubeUrl: "https://www.youtube.com/@pilatesbodyraven/search?query=lower+body+burn" },
      { id: "pbr-8",  name: "Pilates for Flexibility",       duration: 35, level: "Beginner",     description: "Gentle Pilates stretches to improve range of motion and release tension.",                           youtubeUrl: "https://www.youtube.com/@pilatesbodyraven/search?query=flexibility+stretch" },
      { id: "pbr-9",  name: "Wall Pilates",                  duration: 20, level: "Beginner",     description: "Use the wall to deepen your Pilates practice with support and resistance.",                          youtubeUrl: "https://www.youtube.com/@pilatesbodyraven/search?query=wall+pilates" },
      { id: "pbr-10", name: "Pilates Barre Fusion",          duration: 35, level: "Intermediate", description: "The best of ballet barre and Pilates fused into one elegant sculpting workout.",                     youtubeUrl: "https://www.youtube.com/@pilatesbodyraven/search?query=barre+fusion" },
      { id: "pbr-11", name: "Quick Morning Pilates",         duration: 15, level: "Beginner",     description: "A fast but effective morning Pilates wake-up to start your day strong.",                             youtubeUrl: "https://www.youtube.com/@pilatesbodyraven/search?query=morning+quick" },
      { id: "pbr-12", name: "Back Strengthening",            duration: 25, level: "Intermediate", description: "Targeted back and posture work to build a strong, pain-free spine.",                                 youtubeUrl: "https://www.youtube.com/@pilatesbodyraven/search?query=back+strengthening" },
    ],
  },
  {
    id: "yoga-adrienne",
    name: "Yoga with Adriene",
    handle: "@yogawithadriene",
    tagline: "Find what feels good",
    gradient: ["#A99BC5", "#8B7DB0"] as const,
    iconColor: "#8B7DB0",
    classes: [
      { id: "ywa-1",  name: "Morning Wake-Up Flow",           duration: 30, level: "Beginner",     description: "Gentle morning yoga to energize your body and set intentions for the day.",                         youtubeUrl: "https://www.youtube.com/@yogawithadriene/search?query=morning+wake+up+flow" },
      { id: "ywa-2",  name: "Yoga for Anxiety",               duration: 20, level: "Beginner",     description: "Calming breathwork and poses to soothe your nervous system.",                                       youtubeUrl: "https://www.youtube.com/@yogawithadriene/search?query=yoga+for+anxiety" },
      { id: "ywa-3",  name: "Total Body Yoga",                 duration: 40, level: "Intermediate", description: "A complete yoga practice for strength, flexibility, and peace of mind.",                           youtubeUrl: "https://www.youtube.com/@yogawithadriene/search?query=total+body+yoga" },
      { id: "ywa-4",  name: "Yoga for Strength",              duration: 35, level: "Intermediate", description: "Build functional strength with power yoga sequences.",                                               youtubeUrl: "https://www.youtube.com/@yogawithadriene/search?query=yoga+for+strength" },
      { id: "ywa-5",  name: "Cozy Evening Wind Down",         duration: 25, level: "Beginner",     description: "Gentle evening yoga to release the day and prepare for restful sleep.",                             youtubeUrl: "https://www.youtube.com/@yogawithadriene/search?query=evening+wind+down" },
      { id: "ywa-6",  name: "Yoga for Back Pain",             duration: 30, level: "Beginner",     description: "Targeted flows to relieve tension and pain in your back.",                                          youtubeUrl: "https://www.youtube.com/@yogawithadriene/search?query=yoga+for+back+pain" },
      { id: "ywa-7",  name: "Yoga for Beginners",             duration: 20, level: "Beginner",     description: "Your perfect first yoga practice — simple, safe, and encouraging.",                                 youtubeUrl: "https://www.youtube.com/@yogawithadriene/search?query=yoga+for+beginners" },
      { id: "ywa-8",  name: "Power Vinyasa Flow",             duration: 45, level: "Advanced",     description: "A strong, sweaty vinyasa flow to build heat and challenge your practice.",                          youtubeUrl: "https://www.youtube.com/@yogawithadriene/search?query=power+vinyasa+flow" },
      { id: "ywa-9",  name: "Yoga for Hips & Hamstrings",    duration: 30, level: "Beginner",     description: "Deep hip openers and hamstring stretches to release tension you didn't know you had.",               youtubeUrl: "https://www.youtube.com/@yogawithadriene/search?query=hips+and+hamstrings" },
      { id: "ywa-10", name: "Yoga for Energy",                duration: 20, level: "Beginner",     description: "An energizing practice to boost your mood and vitality.",                                           youtubeUrl: "https://www.youtube.com/@yogawithadriene/search?query=yoga+for+energy" },
      { id: "ywa-11", name: "Yoga for Neck & Shoulders",     duration: 25, level: "Beginner",     description: "Targeted relief for tight shoulders and neck tension from screen time.",                             youtubeUrl: "https://www.youtube.com/@yogawithadriene/search?query=neck+and+shoulders" },
      { id: "ywa-12", name: "Yoga for Focus & Clarity",      duration: 20, level: "Beginner",     description: "A grounding practice to sharpen mental focus and bring calm clarity.",                               youtubeUrl: "https://www.youtube.com/@yogawithadriene/search?query=yoga+for+focus+clarity" },
    ],
  },
  {
    id: "yoga-kassandra",
    name: "Yoga with Kassandra",
    handle: "@yogawithkassandra",
    tagline: "Flexibility & mindfulness",
    gradient: ["#7DB8B2", "#4D8E89"] as const,
    iconColor: "#4D8E89",
    classes: [
      { id: "ywk-1",  name: "Yin Yoga for Flexibility",      duration: 45, level: "Beginner",     description: "Long-held passive poses to deeply stretch connective tissue.",                                       youtubeUrl: "https://www.youtube.com/@yogawithkassandra/search?query=yin+yoga+flexibility" },
      { id: "ywk-2",  name: "Hip Opening Flow",               duration: 30, level: "Intermediate", description: "Release tension in your hips with targeted stretches and flows.",                                   youtubeUrl: "https://www.youtube.com/@yogawithkassandra/search?query=hip+opening+flow" },
      { id: "ywk-3",  name: "Morning Vinyasa",                duration: 25, level: "Intermediate", description: "Dynamic vinyasa flow to wake up and invigorate your whole body.",                                  youtubeUrl: "https://www.youtube.com/@yogawithkassandra/search?query=morning+vinyasa" },
      { id: "ywk-4",  name: "Full Body Stretch",              duration: 30, level: "Beginner",     description: "Comprehensive stretching routine for improved mobility.",                                            youtubeUrl: "https://www.youtube.com/@yogawithkassandra/search?query=full+body+stretch" },
      { id: "ywk-5",  name: "Bedtime Yin Yoga",               duration: 20, level: "Beginner",     description: "Deep relaxation poses to melt away the day before sleep.",                                          youtubeUrl: "https://www.youtube.com/@yogawithkassandra/search?query=bedtime+yin+yoga" },
      { id: "ywk-6",  name: "Spine & Back Yin",               duration: 30, level: "Beginner",     description: "Yin poses targeting the full length of your spine for deep release.",                              youtubeUrl: "https://www.youtube.com/@yogawithkassandra/search?query=spine+back+yin" },
      { id: "ywk-7",  name: "Splits Training Flow",           duration: 35, level: "Intermediate", description: "Progressive flexibility work to work toward the splits.",                                           youtubeUrl: "https://www.youtube.com/@yogawithkassandra/search?query=splits+training" },
      { id: "ywk-8",  name: "Shoulders & Neck Release",      duration: 20, level: "Beginner",     description: "Gentle stretches for tight shoulders and neck tension.",                                             youtubeUrl: "https://www.youtube.com/@yogawithkassandra/search?query=shoulders+neck+release" },
      { id: "ywk-9",  name: "Legs & Hips Yin",               duration: 35, level: "Beginner",     description: "A deep yin practice focused on the entire lower body.",                                             youtubeUrl: "https://www.youtube.com/@yogawithkassandra/search?query=legs+hips+yin" },
      { id: "ywk-10", name: "Upper Body Yin",                 duration: 30, level: "Beginner",     description: "Melt tension in your arms, chest, and upper back.",                                                youtubeUrl: "https://www.youtube.com/@yogawithkassandra/search?query=upper+body+yin" },
      { id: "ywk-11", name: "Restorative Yoga",               duration: 45, level: "Beginner",     description: "Deeply supportive poses held for full relaxation and nervous system reset.",                       youtubeUrl: "https://www.youtube.com/@yogawithkassandra/search?query=restorative+yoga" },
      { id: "ywk-12", name: "Flow & Restore",                 duration: 40, level: "Intermediate", description: "A balanced class blending energizing flow with restorative holds.",                                youtubeUrl: "https://www.youtube.com/@yogawithkassandra/search?query=flow+and+restore" },
    ],
  },
  {
    id: "workout-roxane",
    name: "Workout with Roxane",
    handle: "@workoutwithRoxane",
    tagline: "Sweat, smile, repeat",
    gradient: ["#C9A86C", "#A07840"] as const,
    iconColor: "#C4953A",
    classes: [
      { id: "wwr-1",  name: "HIIT Cardio Blast",             duration: 30, level: "Intermediate", description: "High-intensity intervals to torch calories and boost your metabolism.",                               youtubeUrl: "https://www.youtube.com/@workoutwithRoxane/search?query=hiit+cardio+blast" },
      { id: "wwr-2",  name: "Dance Cardio Party",             duration: 25, level: "Beginner",     description: "Fun, upbeat dance moves that make cardio actually enjoyable.",                                       youtubeUrl: "https://www.youtube.com/@workoutwithRoxane/search?query=dance+cardio" },
      { id: "wwr-3",  name: "Bodyweight Strength",            duration: 35, level: "Intermediate", description: "Build real strength using only your bodyweight — no equipment needed.",                              youtubeUrl: "https://www.youtube.com/@workoutwithRoxane/search?query=bodyweight+strength" },
      { id: "wwr-4",  name: "Core Crusher",                   duration: 20, level: "Advanced",     description: "Intense ab and core work for a strong, stable center.",                                             youtubeUrl: "https://www.youtube.com/@workoutwithRoxane/search?query=core+crusher+abs" },
      { id: "wwr-5",  name: "Full Body HIIT",                 duration: 40, level: "Advanced",     description: "Full-body high-intensity training to build strength and endurance.",                                 youtubeUrl: "https://www.youtube.com/@workoutwithRoxane/search?query=full+body+hiit" },
      { id: "wwr-6",  name: "Booty & Legs Sculpt",           duration: 30, level: "Intermediate", description: "Lower body focused burn to sculpt and tone your legs and booty.",                                   youtubeUrl: "https://www.youtube.com/@workoutwithRoxane/search?query=booty+legs+sculpt" },
      { id: "wwr-7",  name: "No-Jump Cardio",                 duration: 25, level: "Beginner",     description: "A low-impact cardio workout that's effective and apartment-friendly.",                              youtubeUrl: "https://www.youtube.com/@workoutwithRoxane/search?query=no+jump+low+impact+cardio" },
      { id: "wwr-8",  name: "Total Body Tone",                duration: 35, level: "Intermediate", description: "Sculpt your whole body with this resistance and cardio combo.",                                     youtubeUrl: "https://www.youtube.com/@workoutwithRoxane/search?query=total+body+tone" },
      { id: "wwr-9",  name: "Cardio Kickboxing",              duration: 30, level: "Intermediate", description: "Punches, kicks, and combos for a seriously fun cardio burn.",                                       youtubeUrl: "https://www.youtube.com/@workoutwithRoxane/search?query=cardio+kickboxing" },
      { id: "wwr-10", name: "Upper Body Sculpt",              duration: 25, level: "Intermediate", description: "Arms, shoulders, and back work to sculpt your upper body.",                                         youtubeUrl: "https://www.youtube.com/@workoutwithRoxane/search?query=upper+body+sculpt" },
      { id: "wwr-11", name: "Tabata Burn",                    duration: 20, level: "Advanced",     description: "Classic 20/10 Tabata intervals for maximum fat-burning in minimum time.",                          youtubeUrl: "https://www.youtube.com/@workoutwithRoxane/search?query=tabata+burn" },
      { id: "wwr-12", name: "Stretch & Cool Down",            duration: 15, level: "Beginner",     description: "Essential post-workout stretching to recover and stay flexible.",                                   youtubeUrl: "https://www.youtube.com/@workoutwithRoxane/search?query=stretch+cool+down" },
    ],
  },
];

export const TIME_SLOTS = [
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM",
];

export const CLASS_PRICE = 5;
export const POINTS_PER_CLASS = 100;
export const WEEKLY_MISS_PENALTY = 500;
export const STEPS_BONUS_POINTS = 25;
export const CANCEL_PENALTY = 100;
export const STEP_GOAL = 7000;
export const WEEKLY_CLASS_COUNT = 4;

export const USERS = {
  kelsey:    { id: "kelsey"    as const, name: "Kelsey",    color: "#BF6375" },
  elizabeth: { id: "elizabeth" as const, name: "Elizabeth", color: "#8B7DB0" },
};

export type UserId = "kelsey" | "elizabeth";

function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function getWeeklyClasses(creator: Creator): FitnessClass[] {
  const weekNum = getISOWeekNumber(new Date());
  const batches = Math.ceil(creator.classes.length / WEEKLY_CLASS_COUNT);
  const batchIndex = weekNum % batches;
  const start = batchIndex * WEEKLY_CLASS_COUNT;
  return creator.classes.slice(start, start + WEEKLY_CLASS_COUNT);
}

export function getNextMondayDate(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  return nextMonday;
}

export function daysUntilNextMonday(): number {
  const today = new Date();
  const dayOfWeek = today.getDay();
  if (dayOfWeek === 1) return 7;
  return dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
}

export function getCurrentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function formatYearMonth(ym: string): string {
  const [year, month] = ym.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const m = url.match(pattern);
    if (m) return m[1];
  }
  return null;
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function getCreatorById(id: string): Creator | undefined {
  return CREATORS.find((c) => c.id === id);
}

export function getClassById(classId: string): { cls: FitnessClass; creator: Creator } | undefined {
  for (const creator of CREATORS) {
    const cls = creator.classes.find((c) => c.id === classId);
    if (cls) return { cls, creator };
  }
  return undefined;
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getNext7Days(): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

export function displayDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (dateStr === formatDate(today)) return "Today";
  if (dateStr === formatDate(tomorrow)) return "Tomorrow";
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function getEndOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
}

export function daysUntilEndOfMonth(): number {
  const now = new Date();
  const end = getEndOfMonth();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function isTimePast(dateStr: string, timeStr: string): boolean {
  const today = formatDate(new Date());
  if (dateStr > today) return false;
  if (dateStr < today) return true;
  const now = new Date();
  const [timePart, ampm] = timeStr.split(" ");
  const [h, m] = timePart.split(":").map(Number);
  let hours = h;
  if (ampm === "PM" && hours !== 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  return now.getHours() > hours || (now.getHours() === hours && now.getMinutes() >= (m || 0));
}
