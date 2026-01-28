// ==================== USER TYPES ====================

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  bio?: string | null;
  avatar?: string | null;
  coverImage?: string | null;
  location?: string | null;
  website?: string | null;
  isVerified: boolean;
  favoriteTeam?: string | null;
  favoritePlayer?: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    followers: number;
    following: number;
    posts: number;
  };
}

export interface UserProfile extends User {
  followers: Follow[];
  following: Follow[];
  posts: Post[];
  isFollowing?: boolean;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
  follower?: User;
  following?: User;
}

// ==================== POST TYPES ====================

export interface Post {
  id: string;
  content: string;
  images?: string | null;
  authorId: string;
  matchId?: string | null;
  isRepost: boolean;
  originalPostId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: User;
  match?: Match | null;
  originalPost?: Post | null;
  comments: Comment[];
  likes: Like[];
  bookmarks: Bookmark[];
  hashtags: PostHashtag[];
  poll?: Poll | null;
  _count?: {
    comments: number;
    likes: number;
    reposts: number;
  };
  isLiked?: boolean;
  isBookmarked?: boolean;
  isReposted?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  parentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: User;
  replies?: Comment[];
}

export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: Date;
  user?: User;
}

export interface Bookmark {
  id: string;
  userId: string;
  postId: string;
  createdAt: Date;
}

// ==================== POLL TYPES ====================

export interface Poll {
  id: string;
  postId: string;
  expiresAt: Date;
  createdAt: Date;
  options: PollOption[];
}

export interface PollOption {
  id: string;
  pollId: string;
  text: string;
  createdAt: Date;
  votes: PollVote[];
  _count?: {
    votes: number;
  };
}

export interface PollVote {
  id: string;
  userId: string;
  optionId: string;
  createdAt: Date;
}

// ==================== HASHTAG TYPES ====================

export interface Hashtag {
  id: string;
  name: string;
  createdAt: Date;
  _count?: {
    posts: number;
  };
}

export interface PostHashtag {
  id: string;
  postId: string;
  hashtagId: string;
  hashtag: Hashtag;
}

// ==================== NOTIFICATION TYPES ====================

export type NotificationType = "like" | "comment" | "follow" | "mention" | "match_update" | "repost";

export interface Notification {
  id: string;
  type: NotificationType;
  recipientId: string;
  senderId?: string | null;
  postId?: string | null;
  matchId?: string | null;
  message?: string | null;
  isRead: boolean;
  createdAt: Date;
  sender?: User | null;
}

// ==================== CRICKET TYPES ====================

export type MatchType = "test" | "odi" | "t20" | "t10";
export type MatchFormat = "international" | "domestic" | "league";
export type MatchStatus = "upcoming" | "live" | "completed" | "abandoned";
export type PlayerRole = "batsman" | "bowler" | "all-rounder" | "wicket-keeper";
export type TeamType = "national" | "franchise" | "club";

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo?: string | null;
  country?: string | null;
  teamType: TeamType;
  createdAt: Date;
  updatedAt: Date;
  players?: Player[];
}

export interface Player {
  id: string;
  name: string;
  image?: string | null;
  country: string;
  role: PlayerRole;
  battingStyle?: string | null;
  bowlingStyle?: string | null;
  dateOfBirth?: Date | null;
  teamId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  team?: Team | null;
}

export interface Match {
  id: string;
  matchType: MatchType;
  format: MatchFormat;
  venue: string;
  city?: string | null;
  country?: string | null;
  startDate: Date;
  endDate?: Date | null;
  status: MatchStatus;
  homeTeamId: string;
  awayTeamId: string;
  winnerId?: string | null;
  tossWinnerId?: string | null;
  tossDecision?: string | null;
  homeScore?: string | null;
  awayScore?: string | null;
  result?: string | null;
  seriesId?: string | null;
  weather?: string | null;
  pitch?: string | null;
  currentOver?: number | null;
  currentInnings?: number | null;
  createdAt: Date;
  updatedAt: Date;
  homeTeam: Team;
  awayTeam: Team;
  winner?: Team | null;
  series?: Series | null;
}

export interface Series {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  format: MatchFormat;
  createdAt: Date;
  updatedAt: Date;
  matches?: Match[];
}

export interface PlayerPerformance {
  id: string;
  playerId: string;
  matchId: string;
  runsScored?: number | null;
  ballsFaced?: number | null;
  fours?: number | null;
  sixes?: number | null;
  strikeRate?: number | null;
  wicketsTaken?: number | null;
  oversBowled?: number | null;
  runsConceded?: number | null;
  economy?: number | null;
  catches?: number | null;
  stumpings?: number | null;
  runOuts?: number | null;
  isManOfMatch: boolean;
  player: Player;
  match: Match;
}

export interface MatchPrediction {
  id: string;
  userId: string;
  matchId: string;
  predictedTeamId: string;
  confidence?: number | null;
  createdAt: Date;
  user?: User;
  predictedTeam?: Team;
}

// ==================== COMMENTARY TYPES ====================

export type ReactionType = "bat" | "ball" | "wow" | "clap" | "mindblown" | "fire";

export const REACTION_TYPES: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "bat", emoji: "🏏", label: "Bat" },
  { type: "ball", emoji: "🔴", label: "Ball" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "clap", emoji: "👏", label: "Clap" },
  { type: "mindblown", emoji: "🤯", label: "Mind Blown" },
  { type: "fire", emoji: "🔥", label: "Fire" },
];

export interface MatchSummary {
  id: string;
  matchId: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Commentary {
  id: string;
  matchId: string;
  inningsNumber: number;
  overNumber: number;
  ballNumber: number;
  runs: number;
  isWicket: boolean;
  wicketType?: string | null;
  isExtra: boolean;
  extraType?: string | null;
  isBoundary: boolean;
  isSix: boolean;
  description: string;
  batsmanName?: string | null;
  bowlerName?: string | null;
  authorId: string;
  createdAt: Date;
  reactions?: CommentaryReaction[];
  comments?: CommentaryComment[];
  _count?: {
    reactions: number;
    comments: number;
  };
}

export interface CommentaryReaction {
  id: string;
  commentaryId: string;
  userId: string;
  reactionType: ReactionType;
  createdAt: Date;
  user?: User;
}

export interface CommentaryComment {
  id: string;
  commentaryId: string;
  userId: string;
  content: string;
  createdAt: Date;
  user?: User;
  reactions?: CommentaryCommentReaction[];
  _count?: {
    reactions: number;
  };
}

export interface CommentaryCommentReaction {
  id: string;
  commentId: string;
  userId: string;
  reactionType: ReactionType;
  createdAt: Date;
  user?: User;
}

export interface OverSummary {
  id: string;
  matchId: string;
  inningsNumber: number;
  overNumber: number;
  balls: string; // JSON array
  totalRuns: number;
  wickets: number;
  extras: number;
  bowlerName?: string | null;
  createdAt: Date;
  predictions?: OverPrediction[];
}

export interface OverPrediction {
  id: string;
  overSummaryId: string;
  userId: string;
  predictedRuns: number;
  predictedWicket: boolean;
  isCorrectRuns?: boolean | null;
  isCorrectWicket?: boolean | null;
  createdAt: Date;
  user?: User;
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ==================== FEED TYPES ====================

export interface FeedItem {
  type: "post" | "repost" | "match_update";
  data: Post | Match;
  timestamp: Date;
}