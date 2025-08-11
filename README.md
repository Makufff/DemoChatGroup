# 🎭 ChatGroup AI with Director

A Next.js 15 application that creates an interactive group chat experience with AI characters, powered by Google Gemini 2.5 Flash API and featuring an intelligent Director Agent that orchestrates character responses.

## ✨ Features

### 🤖 **AI Characters**
- **Multiple AI Characters**: Chat with multiple AI characters simultaneously
- **Custom Characters**: Create your own AI characters with custom names, descriptions, and avatars
- **Character Templates**: 5 preset character groups for quick setup
- **Character Management**: Add/remove characters during conversations

### 🎬 **Director Agent**
- **Intelligent Routing**: AI Director automatically decides which character(s) should respond
- **Context Awareness**: Considers conversation history and character expertise
- **Multi-Response**: Can trigger multiple characters to respond when appropriate

### 💬 **Chat Features**
- **Real-time Messaging**: Instant AI responses with loading states
- **Reply System**: Reply directly to specific messages with context awareness
- **Multimodal Support**: Upload and analyze images with AI characters
- **Chat Export**: Export conversations in TXT, JSON, or Markdown formats
- **Persistent History**: Chat history is maintained during the session

### 🎨 **User Interface**
- **Modern Design**: Clean, responsive interface with TailwindCSS
- **Dark Mode**: Automatic theme switching based on system preference
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices
- **Loading States**: Visual feedback during AI processing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chatgroup
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   GOOGLE_GENAI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 How to Use

### Starting a Chat
1. **Choose Characters**: Select from preset character groups or create custom characters
2. **Start Chat**: Click on a character to begin a conversation
3. **Add More Characters**: Use the "Add Character" button to include more AI participants

### Using Reply Feature
1. **Find a Message**: Locate the message you want to reply to
2. **Click Reply**: Click the reply button (↩️) on any message
3. **Type Reply**: Your reply will be contextualized to that specific message
4. **Send**: Click "Reply" to send your contextual response

### Image Analysis
1. **Upload Image**: Click the camera icon (📷) in the message input
2. **Add Context**: Optionally add a message describing what you want analyzed
3. **Send**: AI characters will analyze the image from their unique perspectives

### Exporting Chats
1. **Open Export Menu**: Click the export button in the chat header
2. **Choose Format**: Select TXT, JSON, or Markdown format
3. **Download**: Your chat history will be downloaded immediately

## 🏗️ Architecture

### Frontend
- **Next.js 15**: App Router for modern React development
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first styling
- **Zustand**: Lightweight state management

### Backend
- **Next.js API Routes**: Server-side API endpoints
- **Google Gemini 2.5 Flash**: Advanced AI model for character responses
- **Director Agent**: Custom AI logic for character selection

### Key Components
- `lib/director.ts`: Director Agent logic
- `lib/characterAI.ts`: Character-specific AI responses
- `lib/gemini.ts`: Gemini API integration
- `store/chatStore.ts`: State management
- `components/`: Reusable UI components

## 🎭 Character System

### Preset Character Groups
1. **Scientists & Thinkers**: Einstein, Marie Curie, Darwin
2. **Artists & Writers**: Shakespeare, Van Gogh, Mozart
3. **Historical Figures**: Cleopatra, Napoleon, Gandhi
4. **Modern Innovators**: Elon Musk, Steve Jobs, Ada Lovelace
5. **Fantasy Characters**: Wizard, Knight, Dragon

### Custom Characters
- **Name**: Choose any name for your character
- **Description**: Define personality, expertise, and background
- **Avatar**: Select from emoji avatars
- **Persistence**: Custom characters are saved during the session

## 🔧 Configuration

### Environment Variables
```env
GOOGLE_GENAI_API_KEY=your_gemini_api_key_here
```

### API Configuration
The application uses Google Gemini 2.5 Flash with safety settings configured to minimize content blocking while maintaining appropriate responses.

## 📱 Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini API for AI capabilities
- Next.js team for the amazing framework
- TailwindCSS for the utility-first CSS framework
- Zustand for lightweight state management

## 🐛 Known Issues

- **API Rate Limits**: Free tier Gemini API has rate limits (10 requests/minute)
- **Content Filtering**: Some responses may be blocked by Gemini's safety filters
- **Session Persistence**: Chat history is not persisted between browser sessions

## 🔮 Future Enhancements

- [ ] User authentication and chat history persistence
- [ ] Voice input/output capabilities
- [ ] Character voice customization
- [ ] Advanced character creation with image avatars
- [ ] Chat room sharing and collaboration
- [ ] Real-time collaboration features
- [ ] Advanced export options (PDF, HTML)
- [ ] Character relationship dynamics
- [ ] Multi-language support

---

**Made with ❤️ using Next.js 15, TypeScript, and Google Gemini AI**
