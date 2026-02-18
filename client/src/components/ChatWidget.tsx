import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMessages, useCreateMessage, useDeleteMessage, useUsers } from "@/hooks/use-data";
import { MessageSquare, Send, X, Trash2, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger 
} from "@/components/ui/sheet";

export function ChatWidget() {
  const { user } = useAuth();
  const { data: messages } = useMessages();
  const { data: users } = useUsers();
  const createMessage = useCreateMessage();
  const deleteMessage = useDeleteMessage();
  
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;
    
    createMessage.mutate(
      { content, replyToId: replyTo || undefined },
      { 
        onSuccess: () => {
          setContent("");
          setReplyTo(null);
        } 
      }
    );
  };

  const getUser = (id: number) => users?.find(u => u.id === id);
  const getMessage = (id: number) => messages?.find(m => m.id === id);

  const canDelete = (msg: any) => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'moderator') return true;
    
    // User can delete own message if less than 15 mins old
    if (msg.userId === user.id) {
      const msgTime = new Date(msg.createdAt).getTime();
      const now = new Date().getTime();
      return (now - msgTime) < 15 * 60 * 1000;
    }
    return false;
  };

  if (!user) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <SheetTrigger asChild>
        <Button 
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl shadow-primary/20 z-50 animate-in fade-in zoom-in duration-300" 
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="right" 
        className="w-[90vw] sm:w-[400px] p-0 border-l border-primary/20 bg-background/95 backdrop-blur-xl sm:max-w-md"
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="p-4 border-b bg-muted/30">
            <SheetTitle className="flex items-center gap-2 font-display text-primary">
              <MessageSquare className="h-5 w-5" />
              Genel Sohbet
            </SheetTitle>
          </SheetHeader>

          <ScrollArea ref={scrollRef} className="flex-1 p-4 scrollbar-thin">
            <div className="space-y-4">
              {messages?.length === 0 && (
                <div className="text-center text-muted-foreground py-10">
                  Henüz mesaj yok. Merhaba de!
                </div>
              )}
              
              {messages?.map((msg) => {
                const author = getUser(msg.userId);
                const replyToMsg = msg.replyToId ? getMessage(msg.replyToId) : null;
                const replyAuthor = replyToMsg ? getUser(replyToMsg.userId) : null;
                
                return (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col gap-1 ${msg.userId === user.id ? "items-end" : "items-start"}`}
                  >
                    {/* Reply Context */}
                    {replyToMsg && (
                      <div className={`text-xs text-muted-foreground flex items-center gap-1 mb-0.5 px-2 ${msg.userId === user.id ? "mr-10" : "ml-10"}`}>
                        <Reply className="h-3 w-3" />
                        Yanıtlıyor: <span className="font-semibold">{replyAuthor?.username || "Silinmiş"}</span>
                      </div>
                    )}

                    <div className={`flex gap-2 max-w-[85%] ${msg.userId === user.id ? "flex-row-reverse" : "flex-row"}`}>
                      <Avatar className="h-8 w-8 mt-1 border border-border">
                        <AvatarImage src={author?.avatarUrl || undefined} />
                        <AvatarFallback>{author?.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex flex-col gap-1">
                        {/* Name & Badge */}
                        <div className={`flex items-center gap-2 text-xs ${msg.userId === user.id ? "justify-end" : "justify-start"}`}>
                          <span className={`font-semibold ${author?.tagColor ? `text-[${author.tagColor}]` : ""}`}>
                            {author?.displayName || author?.username}
                          </span>
                          {author?.tag && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                              author.tag === 'VIP' ? 'tag-vip' : 
                              author.tag === 'MOD' ? 'tag-mod' : 
                              'bg-primary text-primary-foreground'
                            }`}>
                              {author.tag}
                            </span>
                          )}
                          <span className="text-muted-foreground text-[10px]">
                            {format(new Date(msg.createdAt), 'h:mm a')}
                          </span>
                        </div>

                        {/* Bubble */}
                        <div className={`
                          relative group px-3 py-2 rounded-2xl text-sm break-words shadow-sm
                          ${msg.userId === user.id 
                            ? "bg-primary text-primary-foreground rounded-tr-none" 
                            : "bg-muted text-foreground rounded-tl-none border border-border/50"}
                        `}>
                          {msg.content}
                          
                          {/* Actions Overlay */}
                          <div className={`
                            absolute -bottom-6 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity
                            ${msg.userId === user.id ? "right-0" : "left-0"}
                          `}>
                            <button 
                              onClick={() => setReplyTo(msg.id)}
                              className="p-1 rounded-full bg-background border shadow-sm hover:bg-muted"
                              title="Reply"
                            >
                              <Reply className="h-3 w-3" />
                            </button>
                            {canDelete(msg) && (
                              <button 
                                onClick={() => deleteMessage.mutate(msg.id)}
                                className="p-1 rounded-full bg-background border shadow-sm hover:bg-red-50 text-red-500"
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 bg-background border-t">
            {replyTo && (
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 px-2 bg-muted/50 p-2 rounded">
                <span>Replying to message...</span>
                <button onClick={() => setReplyTo(null)} className="hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Bir mesaj yazın..." 
                className="flex-1 rounded-full focus-visible:ring-primary"
                disabled={createMessage.isPending}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="rounded-full h-10 w-10 shrink-0"
                disabled={!content.trim() || createMessage.isPending}
              >
                <Send className="h-4 w-4 ml-0.5" />
              </Button>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
