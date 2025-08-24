
import React from 'react';

interface ChatMessageContentProps {
  text: string;
}

interface MessagePart {
  type: 'dialogue' | 'action' | 'narration';
  content: string;
}

const ChatMessageContent: React.FC<ChatMessageContentProps> = ({ text }) => {
  const parts: MessagePart[] = [];
  let lastIndex = 0;
  // Regex to capture:
  // 1. Quoted dialogue (e.g., "Hello" or “Hello”)
  // 2. Parenthesized actions (e.g., (waves))
  // 3. Bracketed actions (e.g., [sound of footsteps])
  const regex = /(["“](?:\\.|[^"”])["”])|(\((?:\\.|[^)])*\))|(\[(?:\\.|[^\]])*\])/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Text before the current match (narration)
    if (match.index > lastIndex) {
      parts.push({ type: 'narration', content: text.substring(lastIndex, match.index) });
    }

    // Matched part
    if (match[1]) { // Quoted dialogue
      parts.push({ type: 'dialogue', content: match[1] });
    } else if (match[2]) { // Parenthesized action
      parts.push({ type: 'action', content: match[2] });
    } else if (match[3]) { // Bracketed action
      parts.push({ type: 'action', content: match[3] });
    }
    lastIndex = regex.lastIndex;
  }

  // Remaining text after the last match (narration)
  if (lastIndex < text.length) {
    parts.push({ type: 'narration', content: text.substring(lastIndex) });
  }

  return (
    <p className="text-sm break-words whitespace-pre-line">
      {parts.map((part, index) => {
        switch (part.type) {
          case 'dialogue':
            return <span key={index} className="text-teal-700 font-medium">{part.content}</span>;
          case 'action':
            return <span key={index} className="text-slate-500 italic">{part.content}</span>;
          case 'narration':
          default:
            return <span key={index}>{part.content}</span>; // Default styling inherited from bubble
        }
      })}
    </p>
  );
};

export default ChatMessageContent;
