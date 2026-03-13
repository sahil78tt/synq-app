import User from "../models/users.models.js";
import Message from "../models/messages.models.js";
import cloudinary from "cloudinary";
import { getReceiverSocketId, io } from "../configs/socket.js";
import { generateEmbedding } from "../configs/embeddings.js";

export const getUsersforsidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUsersforsidebar:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID missing" });
    }

    let embedding = [];

    // Generate embedding for text messages BEFORE saving
    if (text && text.trim() !== "") {
      try {
        const generatedEmbedding = await generateEmbedding(text);
        if (generatedEmbedding && generatedEmbedding.length > 0) {
          embedding = generatedEmbedding;
          console.log("✅ Embedding generated for message");
        }
      } catch (err) {
        console.log(
          "⚠️  Embedding generation failed, continuing without it:",
          err.message,
        );
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image,
      embedding,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const summarizeConversation = async (req, res) => {
  try {
    const { id: otherUserId } = req.params;
    const myId = req.user._id;

    console.log(
      "Summarize request - My ID:",
      myId,
      "Other User ID:",
      otherUserId,
    );

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: myId },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    console.log("Found messages:", messages.length);

    const textMessages = messages
      .filter((msg) => msg.text && msg.text.trim() !== "")
      .reverse();

    console.log("Text messages:", textMessages.length);

    if (textMessages.length === 0) {
      return res.status(400).json({
        message: "No text messages found to summarize",
      });
    }

    const conversationText = textMessages
      .map((msg) => {
        const isMe = msg.senderId.toString() === myId.toString();
        const sender = isMe ? "Person A" : "Person B";
        return `${sender}: ${msg.text}`;
      })
      .join("\n");

    console.log("Conversation prepared, length:", conversationText.length);

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      console.log("ERROR: GROQ_API_KEY not found in environment variables");
      return res.status(500).json({
        message: "Groq API key not configured",
      });
    }

    console.log("Calling Groq API...");

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that summarizes conversations. Provide brief, meaningful summaries focusing on what was discussed, not who said it. Keep summaries to 1-2 sentences.",
            },
            {
              role: "user",
              content: `Summarize this conversation:\n\n${conversationText}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 150,
          top_p: 1,
        }),
      },
    );

    console.log("Groq API response status:", groqResponse.status);

    if (!groqResponse.ok) {
      const errorData = await groqResponse.json();
      console.log("Groq API error:", errorData);
      throw new Error(`Groq API error: ${groqResponse.status}`);
    }

    const groqData = await groqResponse.json();
    console.log("Groq API response received");

    let summary =
      groqData.choices?.[0]?.message?.content || "Unable to generate summary";

    summary = summary.trim();
    summary = summary.replace(/^(Summary:|SUMMARY:)\s*/i, "");

    console.log("Summary generated:", summary);

    res.status(200).json({ summary });
  } catch (error) {
    console.log("Error in summarizeConversation:", error.message);
    console.log("Full error:", error);
    res.status(500).json({ message: "Failed to generate summary" });
  }
};

export const semanticSearchMessages = async (req, res) => {
  try {
    const { id: otherUserId } = req.params;
    const myId = req.user._id;
    const { q: searchQuery } = req.query;

    console.log("Semantic search - Query:", searchQuery);

    if (!searchQuery || searchQuery.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Fetch messages between the two users
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: myId },
      ],
      text: { $exists: true, $ne: "" },
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    console.log("Found total messages:", messages.length);

    // Filter messages with embeddings
    const messagesWithEmbeddings = messages.filter(
      (msg) =>
        msg.embedding &&
        Array.isArray(msg.embedding) &&
        msg.embedding.length > 0,
    );

    console.log("Messages with embeddings:", messagesWithEmbeddings.length);

    if (messagesWithEmbeddings.length === 0) {
      // If no embeddings exist, generate them now
      console.log(
        "⚠️  No embeddings found. Generating for existing messages...",
      );

      for (const msg of messages.slice(0, 10)) {
        if (msg.text) {
          const embedding = await generateEmbedding(msg.text);
          if (embedding) {
            await Message.findByIdAndUpdate(msg._id, { embedding });
            msg.embedding = embedding;
            messagesWithEmbeddings.push(msg);
          }
        }
      }

      console.log(
        "Generated embeddings for:",
        messagesWithEmbeddings.length,
        "messages",
      );
    }

    if (messagesWithEmbeddings.length === 0) {
      return res.status(200).json({ results: [] });
    }

    // Generate embedding for search query
    const queryEmbedding = await generateEmbedding(searchQuery);

    if (!queryEmbedding) {
      return res.status(500).json({
        message: "Failed to generate search embedding",
      });
    }

    // Calculate similarity scores
    const { cosineSimilarity } = await import("../configs/embeddings.js");

    const scoredMessages = messagesWithEmbeddings.map((msg) => ({
      ...msg,
      similarity: cosineSimilarity(queryEmbedding, msg.embedding),
    }));

    console.log(
      "Similarity scores:",
      scoredMessages.map((m) => ({
        text: m.text.substring(0, 30),
        score: m.similarity.toFixed(3),
      })),
    );

    // Sort by similarity and get top 5 (lowered threshold to 0.1)
    const topResults = scoredMessages
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)
      .filter((msg) => msg.similarity > 0.1) // Lower threshold
      .map(({ _id, text, createdAt, senderId, receiverId, similarity }) => ({
        _id,
        text,
        createdAt,
        senderId,
        receiverId,
        similarity,
      }));

    console.log("Top results:", topResults.length);

    res.status(200).json({ results: topResults });
  } catch (error) {
    console.log("Error in semanticSearchMessages:", error.message);
    console.log("Full error:", error);
    res.status(500).json({ message: "Failed to search messages" });
  }
};

export const clearChat = async (req, res) => {
  try {
    const { id: otherUserId } = req.params;
    const myId = req.user._id;
    const { deleteForBoth } = req.body;

    if (deleteForBoth) {
      // Delete all messages between both users
      await Message.deleteMany({
        $or: [
          { senderId: myId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: myId },
        ],
      });
    } else {
      // Delete only messages sent by the current user
      await Message.deleteMany({
        senderId: myId,
        receiverId: otherUserId,
      });
    }

    res.status(200).json({ message: "Chat cleared successfully" });
  } catch (error) {
    console.log("Error in clearChat:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
