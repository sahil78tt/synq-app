import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mongoose from "mongoose";
import Message from "../models/messages.models.js";
import { generateEmbedding } from "../configs/embeddings.js";

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend root
const envPath = join(__dirname, "../../.env");
dotenv.config({ path: envPath });

async function generateEmbeddingsForExistingMessages() {
  try {
    console.log("🔌 Connecting to MongoDB...");

    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI not found in environment variables");
      process.exit(1);
    }

    console.log("✓ MongoDB URI found");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find all text messages without embeddings
    const messages = await Message.find({
      text: { $exists: true, $ne: "" },
      $or: [
        { embedding: { $exists: false } },
        { embedding: { $size: 0 } },
        { embedding: null },
      ],
    }).limit(50);

    console.log(`📊 Found ${messages.length} messages without embeddings\n`);

    if (messages.length === 0) {
      console.log("✨ All messages already have embeddings!");
      await mongoose.disconnect();
      process.exit(0);
    }

    let processed = 0;
    let failed = 0;

    for (const message of messages) {
      try {
        console.log(
          `[${processed + failed + 1}/${messages.length}] Processing...`,
        );
        console.log(
          `Text: "${message.text.substring(0, 60)}${message.text.length > 60 ? "..." : ""}"`,
        );

        const embedding = await generateEmbedding(message.text);

        if (embedding && embedding.length > 0) {
          message.embedding = embedding;
          await message.save();
          processed++;
          console.log(
            `✅ Embedding generated (${embedding.length} dimensions)\n`,
          );
        } else {
          failed++;
          console.log(`⚠️  Failed - no embedding returned\n`);
        }

        // Small delay
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error) {
        failed++;
        console.log(`❌ Error: ${error.message}\n`);
      }
    }

    console.log("=".repeat(60));
    console.log("📈 SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Successfully processed: ${processed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total attempted: ${messages.length}`);
    console.log("=".repeat(60));

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    console.error("Full error:", error);
    try {
      await mongoose.disconnect();
    } catch (e) {
      // ignore
    }
    process.exit(1);
  }
}

generateEmbeddingsForExistingMessages();
