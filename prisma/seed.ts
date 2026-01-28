import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create sample users
  const hashedPassword = await bcrypt.hash("password123", 12);
  const adminPassword = await bcrypt.hash("admin123", 12);

  // Create admin user first
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      name: "Admin User",
      password: adminPassword,
      role: "admin",
      isVerified: true,
    },
  });

  console.log(`✅ Created admin user: ${admin.username} (password: admin123)`);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { username: "sachin_tendulkar" },
      update: {},
      create: {
        username: "sachin_tendulkar",
        name: "Sachin Tendulkar",
        password: hashedPassword,
        role: "user",
        bio: "Master Blaster | Cricket Legend | God of Cricket 🏏",
        location: "Mumbai, India",
        isVerified: true,
        favoriteTeam: "India",
        favoritePlayer: "Sir Don Bradman",
      },
    }),
    prisma.user.upsert({
      where: { username: "virat_kohli" },
      update: {},
      create: {
        username: "virat_kohli",
        name: "Virat Kohli",
        password: hashedPassword,
        role: "user",
        bio: "Indian Cricketer | RCB Forever ❤️ | Chase Master",
        location: "Delhi, India",
        isVerified: true,
        favoriteTeam: "Royal Challengers Bangalore",
        favoritePlayer: "Sachin Tendulkar",
      },
    }),
    prisma.user.upsert({
      where: { username: "rohit_sharma" },
      update: {},
      create: {
        username: "rohit_sharma",
        name: "Rohit Sharma",
        password: hashedPassword,
        role: "user",
        bio: "Hitman 🔥 | Captain India | Mumbai Indians 💙",
        location: "Mumbai, India",
        isVerified: true,
        favoriteTeam: "Mumbai Indians",
        favoritePlayer: "Sachin Tendulkar",
      },
    }),
    prisma.user.upsert({
      where: { username: "cricket_fan" },
      update: {},
      create: {
        username: "cricket_fan",
        name: "Cricket Fan",
        password: hashedPassword,
        role: "user",
        bio: "Die-hard cricket fan | Stats lover | All formats enthusiast",
        location: "Bangalore, India",
        favoriteTeam: "India",
        favoritePlayer: "MS Dhoni",
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create sample teams
  const teams = await Promise.all([
    prisma.team.upsert({
      where: { name: "India" },
      update: {},
      create: {
        name: "India",
        shortName: "IND",
        country: "India",
        teamType: "national",
      },
    }),
    prisma.team.upsert({
      where: { name: "Australia" },
      update: {},
      create: {
        name: "Australia",
        shortName: "AUS",
        country: "Australia",
        teamType: "national",
      },
    }),
    prisma.team.upsert({
      where: { name: "England" },
      update: {},
      create: {
        name: "England",
        shortName: "ENG",
        country: "England",
        teamType: "national",
      },
    }),
    prisma.team.upsert({
      where: { name: "Mumbai Indians" },
      update: {},
      create: {
        name: "Mumbai Indians",
        shortName: "MI",
        country: "India",
        teamType: "franchise",
      },
    }),
    prisma.team.upsert({
      where: { name: "Chennai Super Kings" },
      update: {},
      create: {
        name: "Chennai Super Kings",
        shortName: "CSK",
        country: "India",
        teamType: "franchise",
      },
    }),
  ]);

  console.log(`✅ Created ${teams.length} teams`);

  // Create sample series
  const series = await Promise.all([
    prisma.series.upsert({
      where: { name: "Border-Gavaskar Trophy 2023" },
      update: {},
      create: {
        name: "Border-Gavaskar Trophy 2023",
        startDate: new Date("2023-11-09"),
        endDate: new Date("2023-12-19"),
        format: "test",
      },
    }),
    prisma.series.upsert({
      where: { name: "IPL 2024" },
      update: {},
      create: {
        name: "IPL 2024",
        startDate: new Date("2024-03-22"),
        endDate: new Date("2024-05-26"),
        format: "t20",
      },
    }),
    prisma.series.upsert({
      where: { name: "World Cup 2023" },
      update: {},
      create: {
        name: "World Cup 2023",
        startDate: new Date("2023-10-05"),
        endDate: new Date("2023-11-19"),
        format: "odi",
      },
    }),
  ]);

  console.log(`✅ Created ${series.length} series`);

  // Create sample hashtags
  const hashtags = await Promise.all([
    prisma.hashtag.upsert({
      where: { name: "cricket" },
      update: {},
      create: { name: "cricket" },
    }),
    prisma.hashtag.upsert({
      where: { name: "ipl" },
      update: {},
      create: { name: "ipl" },
    }),
    prisma.hashtag.upsert({
      where: { name: "indvaus" },
      update: {},
      create: { name: "indvaus" },
    }),
    prisma.hashtag.upsert({
      where: { name: "testcricket" },
      update: {},
      create: { name: "testcricket" },
    }),
    prisma.hashtag.upsert({
      where: { name: "worldcup" },
      update: {},
      create: { name: "worldcup" },
    }),
  ]);

  console.log(`✅ Created ${hashtags.length} hashtags`);

  // Create sample posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        content:
          "What a fantastic century by the Indian batsman! 🏏💯 The dedication and skill on display was incredible. #cricket #indvaus",
        authorId: users[0].id,
        hashtags: {
          create: [
            { hashtagId: hashtags[0].id },
            { hashtagId: hashtags[2].id },
          ],
        },
      },
    }),
    prisma.post.create({
      data: {
        content:
          "Test cricket is the purest form of the game. The battle between bat and ball over 5 days is what makes it special. #testcricket",
        authorId: users[1].id,
        hashtags: {
          create: [{ hashtagId: hashtags[3].id }],
        },
      },
    }),
    prisma.post.create({
      data: {
        content:
          "IPL season is here! Can't wait to see the explosive batting and nail-biting finishes. Who's your favorite team? #ipl #cricket",
        authorId: users[2].id,
        hashtags: {
          create: [
            { hashtagId: hashtags[1].id },
            { hashtagId: hashtags[0].id },
          ],
        },
      },
    }),
    prisma.post.create({
      data: {
        content:
          "The World Cup final was absolutely incredible! Cricket at its finest. What a match! 🏆 #worldcup #cricket",
        authorId: users[3].id,
        hashtags: {
          create: [
            { hashtagId: hashtags[4].id },
            { hashtagId: hashtags[0].id },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${posts.length} posts`);

  // Create sample follows
  await Promise.all([
    prisma.follow.create({
      data: { followerId: users[3].id, followingId: users[0].id },
    }),
    prisma.follow.create({
      data: { followerId: users[3].id, followingId: users[1].id },
    }),
    prisma.follow.create({
      data: { followerId: users[3].id, followingId: users[2].id },
    }),
    prisma.follow.create({
      data: { followerId: users[0].id, followingId: users[1].id },
    }),
    prisma.follow.create({
      data: { followerId: users[1].id, followingId: users[0].id },
    }),
  ]);

  console.log("✅ Created sample follows");

  // Create sample likes
  await Promise.all([
    prisma.like.create({
      data: { userId: users[1].id, postId: posts[0].id },
    }),
    prisma.like.create({
      data: { userId: users[2].id, postId: posts[0].id },
    }),
    prisma.like.create({
      data: { userId: users[3].id, postId: posts[0].id },
    }),
    prisma.like.create({
      data: { userId: users[0].id, postId: posts[1].id },
    }),
    prisma.like.create({
      data: { userId: users[3].id, postId: posts[2].id },
    }),
  ]);

  console.log("✅ Created sample likes");

  // Create a sample match
  const match = await prisma.match.create({
    data: {
      matchType: "test",
      format: "international",
      venue: "Melbourne Cricket Ground",
      city: "Melbourne",
      country: "Australia",
      startDate: new Date(),
      status: "live",
      homeTeamId: teams[1].id, // Australia
      awayTeamId: teams[0].id, // India
      seriesId: series[0].id, // Border-Gavaskar Trophy
      homeScore: "156/3",
      awayScore: "324/5",
      weather: "Sunny, 28°C, Humidity: 45%, Wind: 12 km/h",
      pitch: "Hard pitch with good carry, expected to assist fast bowlers early on. May turn later for spinners.",
      currentOver: 45.4,
      currentInnings: 1,
      tossWinnerId: teams[0].id, // India
      tossDecision: "bat",
    },
  });

  console.log("✅ Created sample match");

  // Create match summary
  await prisma.matchSummary.create({
    data: {
      matchId: match.id,
      title: "India Dominates Day 1 with Stellar Batting Display",
      content: `This has been a magnificent day of Test cricket at the Melbourne Cricket Ground. India, having won the toss, elected to bat first on what looked like a good batting surface.

The openers got India off to a solid start, negating the new ball threat from the Australian pacers. The pitch offered some assistance early on, but the batsmen showed tremendous technique and patience.

The middle order then capitalized on the platform set by the openers. Some exquisite strokeplay was on display as India accelerated through the middle overs. The running between the wickets was particularly impressive.

The Australian bowlers kept trying different tactics but couldn't make significant inroads. The crowd at the MCG watched in appreciation as both teams displayed the best of Test cricket.

As the day draws to a close, India finds themselves in a commanding position. Tomorrow promises more exciting action as they look to build on this platform.`,
      authorId: admin.id,
    },
  });

  console.log("✅ Created match summary");

  // Create sample commentary entries
  const commentaries = await Promise.all([
    prisma.commentary.create({
      data: {
        matchId: match.id,
        inningsNumber: 1,
        overNumber: 45,
        ballNumber: 1,
        runs: 0,
        description: "Good length delivery outside off, left alone by the batsman. Excellent line and length.",
        batsmanName: "Virat Kohli",
        bowlerName: "Pat Cummins",
        authorId: admin.id,
      },
    }),
    prisma.commentary.create({
      data: {
        matchId: match.id,
        inningsNumber: 1,
        overNumber: 45,
        ballNumber: 2,
        runs: 4,
        isBoundary: true,
        description: "FOUR! Beautiful cover drive! The ball raced to the boundary. Classic Kohli!",
        batsmanName: "Virat Kohli",
        bowlerName: "Pat Cummins",
        authorId: admin.id,
      },
    }),
    prisma.commentary.create({
      data: {
        matchId: match.id,
        inningsNumber: 1,
        overNumber: 45,
        ballNumber: 3,
        runs: 1,
        description: "Worked away to the leg side for a single. Good rotation of strike.",
        batsmanName: "Virat Kohli",
        bowlerName: "Pat Cummins",
        authorId: admin.id,
      },
    }),
    prisma.commentary.create({
      data: {
        matchId: match.id,
        inningsNumber: 1,
        overNumber: 45,
        ballNumber: 4,
        runs: 0,
        isWicket: true,
        wicketType: "caught",
        description: "WICKET! Edged and taken! Great catch by the slip fielder. The bowling change works!",
        batsmanName: "Rohit Sharma",
        bowlerName: "Pat Cummins",
        authorId: admin.id,
      },
    }),
  ]);

  console.log(`✅ Created ${commentaries.length} commentary entries`);

  // Add some reactions to commentary
  await prisma.commentaryReaction.createMany({
    data: [
      { commentaryId: commentaries[1].id, userId: users[0].id, reactionType: "bat" },
      { commentaryId: commentaries[1].id, userId: users[1].id, reactionType: "fire" },
      { commentaryId: commentaries[1].id, userId: users[2].id, reactionType: "clap" },
      { commentaryId: commentaries[3].id, userId: users[0].id, reactionType: "wow" },
      { commentaryId: commentaries[3].id, userId: users[3].id, reactionType: "mindblown" },
    ],
  });

  console.log("✅ Created commentary reactions");

  // Add some comments on commentary
  const commentaryComments = await Promise.all([
    prisma.commentaryComment.create({
      data: {
        commentaryId: commentaries[1].id,
        userId: users[0].id,
        content: "What a shot! Vintage Kohli! 🏏",
      },
    }),
    prisma.commentaryComment.create({
      data: {
        commentaryId: commentaries[1].id,
        userId: users[3].id,
        content: "This is why we love Test cricket!",
      },
    }),
    prisma.commentaryComment.create({
      data: {
        commentaryId: commentaries[3].id,
        userId: users[1].id,
        content: "Cummins is on fire today!",
      },
    }),
  ]);

  console.log(`✅ Created ${commentaryComments.length} commentary comments`);

  // Add reactions to comments
  await prisma.commentaryCommentReaction.createMany({
    data: [
      { commentId: commentaryComments[0].id, userId: users[1].id, reactionType: "clap" },
      { commentId: commentaryComments[0].id, userId: users[2].id, reactionType: "fire" },
      { commentId: commentaryComments[2].id, userId: users[0].id, reactionType: "ball" },
    ],
  });

  console.log("✅ Created comment reactions");

  // Create over summaries
  const overSummaries = await Promise.all([
    prisma.overSummary.create({
      data: {
        matchId: match.id,
        inningsNumber: 1,
        overNumber: 43,
        balls: JSON.stringify(["1", "0", "1", "4", "0", "2"]),
        totalRuns: 8,
        wickets: 0,
        extras: 0,
        bowlerName: "Mitchell Starc",
      },
    }),
    prisma.overSummary.create({
      data: {
        matchId: match.id,
        inningsNumber: 1,
        overNumber: 44,
        balls: JSON.stringify(["0", "1", "0", "0", "6", "1"]),
        totalRuns: 8,
        wickets: 0,
        extras: 0,
        bowlerName: "Josh Hazlewood",
      },
    }),
    prisma.overSummary.create({
      data: {
        matchId: match.id,
        inningsNumber: 1,
        overNumber: 45,
        balls: JSON.stringify(["0", "4", "1", "W"]),
        totalRuns: 5,
        wickets: 1,
        extras: 0,
        bowlerName: "Pat Cummins",
      },
    }),
  ]);

  console.log(`✅ Created ${overSummaries.length} over summaries`);

  // Create over predictions
  await prisma.overPrediction.createMany({
    data: [
      { overSummaryId: overSummaries[2].id, userId: users[0].id, predictedRuns: 6, predictedWicket: false },
      { overSummaryId: overSummaries[2].id, userId: users[1].id, predictedRuns: 8, predictedWicket: true },
      { overSummaryId: overSummaries[2].id, userId: users[3].id, predictedRuns: 4, predictedWicket: false },
    ],
  });

  console.log("✅ Created over predictions");

  // Create match predictions (who will win)
  await prisma.matchPrediction.createMany({
    data: [
      { matchId: match.id, userId: users[0].id, predictedTeamId: teams[0].id }, // India
      { matchId: match.id, userId: users[1].id, predictedTeamId: teams[0].id }, // India
      { matchId: match.id, userId: users[2].id, predictedTeamId: teams[0].id }, // India
      { matchId: match.id, userId: users[3].id, predictedTeamId: teams[1].id }, // Australia
    ],
  });

  console.log("✅ Created match predictions");

  // Create another upcoming match
  const upcomingMatch = await prisma.match.create({
    data: {
      matchType: "t20",
      format: "league",
      venue: "Wankhede Stadium",
      city: "Mumbai",
      country: "India",
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: "upcoming",
      homeTeamId: teams[3].id, // Mumbai Indians
      awayTeamId: teams[4].id, // Chennai Super Kings
      seriesId: series[1].id, // IPL 2024
      weather: "Partly Cloudy, 32°C, Humidity: 65%, Wind: 8 km/h",
      pitch: "Batting-friendly pitch with short boundaries. Expect high-scoring game.",
    },
  });

  console.log("✅ Created upcoming match");

  // Create a completed match
  const completedMatch = await prisma.match.create({
    data: {
      matchType: "odi",
      format: "international",
      venue: "Lord's Cricket Ground",
      city: "London",
      country: "England",
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: "completed",
      homeTeamId: teams[2].id, // England
      awayTeamId: teams[0].id, // India
      seriesId: series[2].id, // World Cup 2023
      homeScore: "256/8",
      awayScore: "259/4",
      winnerId: teams[0].id, // India won
      result: "India won by 6 wickets",
      tossWinnerId: teams[2].id,
      tossDecision: "bat",
      weather: "Overcast, 18°C",
      pitch: "Green top - swing expected throughout the match.",
    },
  });

  console.log("✅ Created completed match");

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });