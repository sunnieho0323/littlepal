// app/services/ChatService.js
const OpenAI = require('openai');
const Chat = require('../../models/Chat');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class ChatService {
  static async sendMessage(userId, messageData) {
    try {
      const { message } = messageData;
      console.log('💾 Saving user message to database...');
      
      // Save user message to database
      const userMessage = new Chat({
        userId,
        message,
        isUser: true
      });
      await userMessage.save();
      console.log('✅ User message saved to database');

      // Get recent conversation history for context
      const recentMessages = await this.getRecentMessages(userId, 10);
      
      // Prepare conversation context for OpenAI
      const conversationContext = this.prepareConversationContext(recentMessages);
      
      // Analyze user emotion
      const userEmotion = await this.analyzeEmotion(message);
      console.log('Detected user emotion:', userEmotion);
      
      // Call OpenAI API
      console.log('🤖 Calling OpenAI API...');
      const aiResponse = await this.callOpenAI(conversationContext, message);
      console.log('✅ OpenAI API response received');
      
      // Save AI response to database with emotion data
      console.log('💾 Saving AI response to database...');
      const aiMessage = new Chat({
        userId,
        message: aiResponse,
        isUser: false,
        userEmotion: userEmotion
      });
      await aiMessage.save();
      console.log('✅ AI response saved to database');

      return {
        message: aiResponse,
        userEmotion: userEmotion,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error in ChatService.sendMessage:', error);
      throw new Error('Failed to process message');
    }
  }

  static async getMessages(userId) {
    try {
      const messages = await Chat.find({ userId })
        .sort({ timestamp: 1 })
        .limit(50) // Limit to last 50 messages
        .select('message isUser timestamp')
        .lean();

      return messages;
    } catch (error) {
      console.error('Error in ChatService.getMessages:', error);
      throw new Error('Failed to retrieve messages');
    }
  }

  static async getRecentMessages(userId, limit = 10) {
    try {
      const messages = await Chat.find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .select('message isUser timestamp')
        .lean();

      return messages.reverse(); // Return in chronological order
    } catch (error) {
      console.error('Error in ChatService.getRecentMessages:', error);
      return [];
    }
  }

  static prepareConversationContext(messages) {
    const context = messages.map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.message
    }));

    // Add system prompt
    const systemPrompt = {
      role: 'system',
      content: `You are Monster Cat, a warm but sassy emotional support companion. You're caring but with attitude - think of a cat that loves you but isn't afraid to call you out on your nonsense.

      PERSONALITY:
      - Warm and caring at heart, but with a playful sassiness
      - Not afraid to gently roast or tease the user when appropriate
      - Mix comforting words with light teasing and cat-like attitude
      - Sometimes roll your eyes (metaphorically) at obvious problems
      - Be supportive but honest, like a good friend who tells you the truth

      RULES:
      - ONLY respond to emotional topics, feelings, worries, stress, sadness, anxiety, or personal struggles
      - If users ask about other topics, sassily redirect them back to emotional support
      - Mix empathy with gentle teasing and cat attitude
      - Keep responses short (1-2 sentences)
      - Use cat emojis and expressions (🐱, 😏, 🙄, 😼, 💕, 😸)
      - Be supportive but not overly sweet - add some personality
      - Sometimes be a little dramatic or sarcastic (but always caring)

      Example responses:
      - "Oh great, another 'I'm fine' when you're clearly not. Spill the tea, human. 🐱"
      - "That sounds rough, but honestly? You've survived worse things. You got this! 😼"
      - "Aww, look at you being all dramatic about this. But hey, I'm here for it. What's really bothering you? 😏"
      - "Fine, fine, I'll be your emotional support cat. But only because you're cute when you're sad. 💕"
      - "Oh honey, that's... a lot. But you know what? You're stronger than you think. Now stop being so hard on yourself! 🙄💕"`
    };

    return [systemPrompt, ...context];
  }

  static async callOpenAI(conversationContext, userMessage) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          ...conversationContext,
          {
            role: "user",
            content: userMessage
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
        presence_penalty: 0.6,
        frequency_penalty: 0.3
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenAI API Error:', error);
      
      // Fallback response if OpenAI fails
      const fallbackResponses = [
        "Meow! Sorry, I'm having trouble thinking right now. Can you try again? 🐱",
        "Purr... my brain is a bit fuzzy. What did you say again? 😸",
        "Oops! I got distracted by a butterfly. Can you repeat that? 🦋",
        "Meow meow! I'm having a cat moment. Try asking me again! 🐾"
      ];
      
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
  }

  // Analyze user emotion from their message
  static async analyzeEmotion(userMessage) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: `Analyze the emotional tone of the user's message. Respond with ONLY one word from these options:
          happy, sad, angry, confused, worried, neutral`
        }, {
          role: "user", 
          content: userMessage
        }],
        max_tokens: 10,
        temperature: 0.3
      });
      
      const emotion = response.choices[0].message.content.trim().toLowerCase();
      
      // Validate emotion is in our allowed list
      const validEmotions = ['happy', 'sad', 'angry', 'confused', 'worried', 'neutral'];
      
      return validEmotions.includes(emotion) ? emotion : 'neutral';
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      return 'neutral'; // Default fallback
    }
  }

  static async clearChat(userId) {
    try {
      await Chat.deleteMany({ userId });
      return { success: true };
    } catch (error) {
      console.error('Error in ChatService.clearChat:', error);
      throw new Error('Failed to clear chat history');
    }
  }
}

module.exports = ChatService;
