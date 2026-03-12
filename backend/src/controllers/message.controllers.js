import User from "../models/users.models.js";
import Message from "../models/messages.models.js";
import cloudinary from "cloudinary";
import { getReceiverSocketId, io } from "../configs/socket.js";

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

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image,
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

    // Fetch last 50 messages between the two users
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

    // Filter only text messages and reverse to chronological order
    const textMessages = messages
      .filter((msg) => msg.text && msg.text.trim() !== "")
      .reverse();

    console.log("Text messages:", textMessages.length);

    if (textMessages.length === 0) {
      return res.status(400).json({
        message: "No text messages found to summarize",
      });
    }

    // Build conversation string
    const conversationText = textMessages
      .map((msg) => {
        const isMe = msg.senderId.toString() === myId.toString();
        const sender = isMe ? "Person A" : "Person B";
        return `${sender}: ${msg.text}`;
      })
      .join("\n");

    console.log("Conversation prepared, length:", conversationText.length);

    // Check if API key exists
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      console.log("ERROR: GROQ_API_KEY not found in environment variables");
      return res.status(500).json({
        message: "Groq API key not configured",
      });
    }

    console.log("Calling Groq API...");

    // Call Groq API
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

    // Extract summary from response
    let summary =
      groqData.choices?.[0]?.message?.content || "Unable to generate summary";

    // Clean up the summary
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
