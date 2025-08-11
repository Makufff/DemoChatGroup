# ChatGroup AI with Director

A Next.js application that allows you to chat with multiple AI characters in one room. The Director Agent automatically decides which character should respond based on your questions and the conversation context.

## 🚀 Features

- **Multi-Character Chat**: Chat with multiple AI characters simultaneously
- **Director Agent**: AI-powered character selection based on context
- **Gemini 2.5 Flash Integration**: Powered by Google's latest AI model
- **Multimodal Support**: Upload and analyze images with AI characters
- **Character Templates**: 5 preset character groups (Detective Team, Scientific Minds, Creative Minds, Historical Leaders, Great Thinkers)
- **Export Functionality**: Export chats in TXT, JSON, or Markdown formats
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: Automatic theme switching

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **AI Integration**: Google Gemini 2.5 Flash
- **Image Handling**: Next.js Image component

## 📋 Prerequisites

- Node.js 18+ 
- npm or pnpm
- Google GenAI API key

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chatgroup
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   GOOGLE_GENAI_API_KEY=your_google_genai_api_key_here
   NODE_ENV=development
   ```

4. **Get a Google GenAI API key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env.local` file

5. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 How to Use

1. **Select Characters**: Choose from individual characters or use character templates
2. **Start Chat**: Click "Start Chat" to create a new chat room
3. **Send Messages**: Type your message and press Enter or click Send
4. **Upload Images**: Click the camera icon to upload and analyze images
5. **Export Chats**: Use the export button to save your conversations

## 🎭 Character Templates

### Detective Team
- **Sherlock Holmes**: Brilliant detective with deductive reasoning
- **Dr. Watson**: Medical doctor with practical wisdom

### Scientific Minds
- **Einstein**: Theoretical physicist and relativity expert
- **Marie Curie**: Pioneer in radioactivity research
- **Nikola Tesla**: Inventor and electrical engineer

### Creative Minds
- **Shakespeare**: Master playwright and poet
- **Leonardo da Vinci**: Polymath artist and inventor
- **Mozart**: Classical composer and musical genius

### Historical Leaders
- **Cleopatra**: Last ruler of Ptolemaic Egypt
- **Julius Caesar**: Roman general and statesman
- **Joan of Arc**: French heroine and saint

### Great Thinkers
- **Socrates**: Founder of Western philosophy
- **Confucius**: Chinese philosopher and politician
- **Aristotle**: Greek philosopher and polymath

## 🔧 API Endpoints

- `POST /api/chat` - Process chat messages and generate AI responses

## 📁 Project Structure

```
chatgroup/
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts    # Chat API endpoint
│   │   ├── chat/[roomId]/       # Chat room pages
│   │   ├── globals.css          # Global styles
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Home page
│   ├── components/              # React components
│   ├── lib/                     # Utility libraries
│   ├── store/                   # Zustand state management
│   └── types/                   # TypeScript type definitions
├── components/                  # Shared components
├── lib/                         # AI integration libraries
├── store/                       # State management
├── types/                       # Type definitions
└── public/                      # Static assets
```

## 🎨 Customization

### Adding New Characters
Edit the character arrays in:
- `src/app/page.tsx` (sample characters)
- `components/CharacterTemplates.tsx` (template characters)
- `components/CharacterSelector.tsx` (additional characters)

### Modifying AI Behavior
- `lib/director.ts` - Director Agent logic
- `lib/characterAI.ts` - Character response generation
- `lib/gemini.ts` - Gemini API integration

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

3. **Deploy to your preferred platform**
   - Vercel (recommended for Next.js)
   - Netlify
   - AWS
   - Google Cloud Platform

## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_GENAI_API_KEY` | Google GenAI API key | Yes |
| `NODE_ENV` | Environment (development/production) | No |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify your API key is correct
3. Ensure all dependencies are installed
4. Check the browser's network tab for API errors

## 🎉 Acknowledgments

- Google for providing the Gemini AI API
- Next.js team for the excellent framework
- TailwindCSS for the utility-first CSS framework
- Zustand for lightweight state management
