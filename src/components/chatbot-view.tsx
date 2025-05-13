"use client";

import * as React from "react";
import { chatbotQuery, type ChatbotQueryInput, type ChatbotQueryOutput } from "@/ai/flows/chatbot-flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Loader2, Send, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

// Correctly derive the type for history items, including the new boolean flags
type GenkitHistoryItem = ChatbotQueryInput['history'] extends Array<infer Item> | undefined ? Item : never;


export function ChatbotView() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  React.useEffect(() => {
    // Add an initial greeting message from the bot
    setMessages([
      {
        id: "initial-greeting",
        role: "model",
        text: "Hello! I'm AuraChat. How can I help you today with AI energy optimization or anything else?",
        timestamp: new Date(),
      }
    ]);
  }, []);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: inputValue,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Prepare history for Genkit
      const historyForGenkit: GenkitHistoryItem[] = messages
        .slice(-10) // Take last 10 messages for context
        .map(msg => ({
          role: msg.role,
          parts: [{text: msg.text}],
          isUser: msg.role === 'user', // Populate isUser flag
          isModel: msg.role === 'model', // Populate isModel flag
        }));
      
      const chatbotInput: ChatbotQueryInput = { 
        question: userMessage.text,
        history: historyForGenkit 
      };
      const result: ChatbotQueryOutput = await chatbotQuery(chatbotInput);

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "model",
        text: result.answer,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      toast({
        title: "Chatbot Error",
        description: error instanceof Error ? error.message : "An unknown error occurred while fetching the response.",
        variant: "destructive",
      });
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "model",
        text: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full h-[calc(100vh-120px)] max-w-3xl mx-auto flex flex-col bg-card text-card-foreground shadow-xl">
      <CardHeader className="border-b">
        <CardTitle className="text-2xl text-primary flex items-center gap-2">
          <Bot /> Aura Chat
        </CardTitle>
        <CardDescription>Ask me anything about AI energy optimization or related topics.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3 animate-in fade-in-50 slide-in-from-bottom-2 duration-300",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "model" && (
                  <Avatar className="h-8 w-8 border border-primary">
                    <AvatarFallback><Bot className="text-primary" size={18}/></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[70%] rounded-lg p-3 text-sm shadow",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                   <p className={cn(
                      "text-xs mt-1",
                      message.role === "user" ? "text-primary-foreground/70 text-right" : "text-muted-foreground/70 text-left"
                    )}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8 border border-accent">
                    <AvatarFallback><User className="text-accent" size={18}/></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                <Avatar className="h-8 w-8 border border-primary">
                  <AvatarFallback><Bot className="text-primary" size={18}/></AvatarFallback>
                </Avatar>
                <div className="max-w-[70%] rounded-lg p-3 text-sm shadow bg-muted text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-input text-foreground border-border"
            aria-label="Chat message input"
          />
          <Button type="submit" disabled={isLoading || !inputValue.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground" aria-label="Send message">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
