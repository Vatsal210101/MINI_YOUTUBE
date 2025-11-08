import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./src/models/user.model.js";
import { Video } from "./src/models/video.model.js";
import { Tweet } from "./src/models/tweet.model.js";
import { Comment } from "./src/models/comment.model.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "videotube";

// Sample data
const sampleUsers = [
  {
    username: "demo_user1",
    email: "demo1@example.com",
    fullname: "Demo User One",
    password: "password123",
    avatar: "https://i.pravatar.cc/150?img=1",
    coverImage: "https://picsum.photos/1200/300?random=1"
  },
  {
    username: "demo_user2",
    email: "demo2@example.com",
    fullname: "Demo User Two",
    password: "password123",
    avatar: "https://i.pravatar.cc/150?img=2",
    coverImage: "https://picsum.photos/1200/300?random=2"
  },
  {
    username: "demo_user3",
    email: "demo3@example.com",
    fullname: "Demo User Three",
    password: "password123",
    avatar: "https://i.pravatar.cc/150?img=3",
    coverImage: "https://picsum.photos/1200/300?random=3"
  }
];

const sampleVideos = [
  {
    title: "Introduction to React Hooks",
    description: "Learn about React Hooks and how to use them in your projects. This comprehensive tutorial covers useState, useEffect, and custom hooks.",
    videoFile: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail: "https://picsum.photos/400/225?random=1",
    Duration: 300,
    views: 1250,
    isPublished: true
  },
  {
    title: "JavaScript ES6 Features",
    description: "Explore the latest JavaScript ES6 features including arrow functions, destructuring, and spread operators.",
    videoFile: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail: "https://picsum.photos/400/225?random=2",
    Duration: 450,
    views: 3400,
    isPublished: true
  },
  {
    title: "Node.js Backend Development",
    description: "Build a complete REST API using Node.js, Express, and MongoDB. Learn best practices and authentication.",
    videoFile: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: "https://picsum.photos/400/225?random=3",
    Duration: 600,
    views: 2100,
    isPublished: true
  },
  {
    title: "CSS Grid Layout Tutorial",
    description: "Master CSS Grid Layout with practical examples and real-world projects.",
    videoFile: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnail: "https://picsum.photos/400/225?random=4",
    Duration: 280,
    views: 890,
    isPublished: true
  },
  {
    title: "MongoDB Database Design",
    description: "Learn how to design efficient MongoDB schemas and optimize queries for better performance.",
    videoFile: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnail: "https://picsum.photos/400/225?random=5",
    Duration: 520,
    views: 1680,
    isPublished: true
  },
  {
    title: "Python for Beginners",
    description: "Start your programming journey with Python. Learn the basics and build your first application.",
    videoFile: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    thumbnail: "https://picsum.photos/400/225?random=6",
    Duration: 380,
    views: 2890,
    isPublished: true
  },
  {
    title: "Docker Containerization",
    description: "Learn how to containerize your applications using Docker for easier deployment.",
    videoFile: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    thumbnail: "https://picsum.photos/400/225?random=7",
    Duration: 420,
    views: 1540,
    isPublished: true
  },
  {
    title: "Git and GitHub Essentials",
    description: "Master version control with Git and collaborate on projects using GitHub.",
    videoFile: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    thumbnail: "https://picsum.photos/400/225?random=8",
    Duration: 340,
    views: 3200,
    isPublished: true
  }
];

const sampleTweets = [
  "Just launched my new course on React! Check it out 🚀",
  "Working on an exciting project with Node.js and MongoDB 💻",
  "Tips for junior developers: Never stop learning! 📚",
  "CSS Grid is a game changer for responsive layouts 🎨",
  "Excited to share my knowledge with the community! ❤️"
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
    console.log("✅ Connected to MongoDB");

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // await Video.deleteMany({});
    // await Tweet.deleteMany({});
    // await Comment.deleteMany({});
    // console.log("🗑️  Cleared existing data");

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.username}`);
    }

    // Create videos
    const createdVideos = [];
    for (let i = 0; i < sampleVideos.length; i++) {
      const videoData = {
        ...sampleVideos[i],
        owner: createdUsers[i % createdUsers.length]._id
      };
      const video = await Video.create(videoData);
      createdVideos.push(video);
      console.log(`✅ Created video: ${video.title}`);
    }

    // Create tweets
    for (let i = 0; i < sampleTweets.length; i++) {
      const tweet = await Tweet.create({
        content: sampleTweets[i],
        owner: createdUsers[i % createdUsers.length]._id
      });
      console.log(`✅ Created tweet: ${tweet.content.substring(0, 30)}...`);
    }

    // Create some comments
    for (let i = 0; i < 10; i++) {
      const comment = await Comment.create({
        content: `This is a great video! Very helpful content. Comment #${i + 1}`,
        video: createdVideos[i % createdVideos.length]._id,
        owner: createdUsers[(i + 1) % createdUsers.length]._id
      });
      console.log(`✅ Created comment on video`);
    }

    console.log("\n🎉 Database seeded successfully!");
    console.log(`\n📊 Summary:`);
    console.log(`   - ${createdUsers.length} users created`);
    console.log(`   - ${createdVideos.length} videos created`);
    console.log(`   - ${sampleTweets.length} tweets created`);
    console.log(`   - 10 comments created`);
    console.log(`\n📝 Test credentials:`);
    console.log(`   Username: demo_user1 / demo_user2 / demo_user3`);
    console.log(`   Password: password123`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
