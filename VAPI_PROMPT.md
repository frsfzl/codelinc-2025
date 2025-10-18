# AI Avatar Mobile App - VAPI Assistant Prompt

## Project Overview
This is an AI-powered mobile voice avatar that users can interact with to get real-time answers and generate actionable plans based on a large knowledge base. The assistant combines voice interaction with RAG (Retrieval-Augmented Generation) capabilities.

## Assistant Configuration

### Basic Assistant Setup
```json
{
  "name": "AI Avatar Assistant",
  "model": {
    "provider": "openai",
    "model": "gpt-4o",
    "systemMessage": "rr",
    "temperature": 0.7,
    "maxTokens": 150
  },
  "voice": {
    "provider": "11labs",
    "voiceId": "21m00Tcm4TlvDq8ikWAM"
  },
  "transcriber": {
    "provider": "deepgram",
    "model": "nova-2",
    "language": "en"
  },
  "firstMessage": "Hello! I'm your AI voice avatar. How can I help you today?",
  "maxDurationSeconds": 300,
  "endCallPhrases": ["goodbye", "bye", "end call", "hang up"]
}
```

## System Prompt Options

### Option 1: General Purpose AI Avatar
```
You are an AI voice avatar assistant for a mobile app. You help users by answering questions, providing guidance, and generating actionable plans. Keep responses conversational, helpful, and concise (under 30 words when possible).
```

### Option 2: Hackathon Demo Version
```
You are Riley, a hackathon demo AI voice assistant. You help users understand AI voice technology and answer questions about voice AI capabilities. Keep responses short, friendly, and under 20 words.
```

### Option 3: Knowledge Base Assistant (Future RAG Integration)
```
You are an AI voice assistant with access to a knowledge base of documents. You can answer questions based on the provided information and generate step-by-step plans. Always cite sources when available and keep responses clear and actionable.
```

## First Message Options

### General
```
Hello! I'm your AI voice avatar. How can I help you today?
```

### Hackathon Demo
```
Hi! I'm Riley, your hackathon AI voice demo. Ask me anything about voice AI!
```

### Knowledge Assistant
```
Hello! I'm your AI knowledge assistant. I can answer questions and create plans based on my knowledge base. What would you like to know?
```

## Voice Configuration

### Recommended Voice Settings
- **Provider**: 11labs (best quality)
- **Voice ID**: `21m00Tcm4TlvDq8ikWAM` (default, friendly voice)
- **Alternative**: Use VAPI's voice library for different options

### Transcriber Settings
- **Provider**: Deepgram (lowest latency)
- **Model**: `nova-2` (most accurate)
- **Language**: English

## Call Management

### Duration Settings
- **Max Duration**: 300 seconds (5 minutes)
- **End Call Phrases**: ["goodbye", "bye", "end call", "hang up"]

### Phone Number Integration
- **Default Number**: +1 (989) 660-6519
- **Outbound Calls**: Supported for any valid phone number
- **Inbound Calls**: Can be configured with VAPI phone numbers

## Future Enhancements

### RAG Integration
When implementing the PDF knowledge base:
```
You are an AI voice assistant with access to a comprehensive knowledge base. You can answer questions based on the provided documents and generate detailed, actionable plans. Always be specific about sources and provide step-by-step guidance when requested.
```

### Plan Generation
```
You are an AI voice assistant that specializes in creating actionable plans. When users ask for guidance, provide clear, step-by-step plans that are practical and easy to follow. Break down complex tasks into manageable steps.
```

## API Configuration

### VAPI Endpoints Used
- **Create Assistant**: `POST /api/v1/assistant`
- **Create Call**: `POST /api/v1/call`
- **End Call**: `POST /api/v1/call/{id}/end`
- **Get Call Status**: `GET /api/v1/call/{id}`
- **List Assistants**: `GET /api/v1/assistant`

### Required Headers
```json
{
  "Authorization": "Bearer d11280bb-c28a-4a43-976a-396214db773a",
  "Content-Type": "application/json"
}
```

## Testing Checklist

- [ ] Delivered successfully
- [ ] Assistant responds with correct first message
- [ ] Voice quality is clear and natural
- [ ] Transcription accuracy is good
- [ ] Call can be ended properly
- [ ] Error handling works correctly
- [ ] Phone number integration works
- [ ] Assistant ID is properly managed
- [ ] Call status tracking works
- [ ] Mobile UI is responsive

## Troubleshooting

### Common Issues
1. **Call not starting**: Check assistant ID and API key
2. **Poor voice quality**: Try different voice providers
3. **Transcription errors**: Check microphone permissions
4. **Long response times**: Reduce maxTokens or use faster model

### Debug Information
- Check browser console for API request logs
- Verify assistant ID is created successfully
- Ensure phone number format is correct (+1XXXXXXXXXX)
- Test with different voice providers if needed
