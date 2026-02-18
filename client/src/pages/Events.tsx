import { useEvents, useLikeEvent, useCreateEvent } from "@/hooks/use-data";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Heart, Plus, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Events() {
  const { data: events, isLoading } = useEvents();
  const { mutate: likeEvent } = useLikeEvent();
  const { user } = useAuth();

  if (isLoading) return <div className="container py-12">Loading events...</div>;

  return (
    <div className="container py-12">
      <div className="flex justify-between items-end mb-10 border-b pb-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-primary mb-2">Topluluk Etkinlikleri</h1>
          <p className="text-muted-foreground">Krallıkta olup bitenleri kaçırmayın</p>
        </div>
        {user?.role === "admin" && <CreateEventDialog />}
      </div>

      <div className="grid gap-8">
        {events?.map((event) => (
          <motion.div 
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="flex flex-col md:flex-row overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="md:w-1/3 h-48 md:h-auto bg-muted relative">
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground bg-secondary/5">
                    <Calendar className="h-12 w-12 opacity-20" />
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur px-3 py-1.5 rounded-lg text-center shadow-sm">
                  <span className="block text-xs font-bold uppercase text-primary">
                    {format(new Date(event.date), "MMM")}
                  </span>
                  <span className="block text-xl font-bold leading-none">
                    {format(new Date(event.date), "dd")}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-2xl font-display">{event.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {format(new Date(event.date), "h:mm a")}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Global Room</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground">{event.description}</p>
                </CardContent>
                <CardFooter className="bg-muted/30 border-t pt-4 flex justify-between">
                  <Button 
                    variant="ghost" 
                    className={`gap-2 ${event.likedBy?.includes(user?.id || 0) ? "text-red-500 hover:text-red-600" : "text-muted-foreground"}`}
                    onClick={() => user && likeEvent(event.id)}
                    disabled={!user}
                  >
                    <Heart className={`h-5 w-5 ${event.likedBy?.includes(user?.id || 0) ? "fill-current" : ""}`} />
                    {event.likes} İlgilenen
                  </Button>
                  <Button>Şimdi Katıl</Button>
                </CardFooter>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CreateEventDialog() {
  const [open, setOpen] = useState(false);
  const createEvent = useCreateEvent();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    imageUrl: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEvent.mutate({
      ...formData,
      date: new Date(formData.date).toISOString() // Ensure ISO string
    }, {
      onSuccess: () => setOpen(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="h-4 w-4" /> Etkinlik Ekle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Etkinlik Planla</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Etkinlik Başlığı</Label>
            <Input 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Tarih & Saat</Label>
            <Input 
              type="datetime-local"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Resim URL</Label>
            <Input 
              value={formData.imageUrl}
              onChange={e => setFormData({...formData, imageUrl: e.target.value})}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label>Açıklama</Label>
            <Textarea 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              required
              className="h-24"
            />
          </div>
          <Button type="submit" className="w-full" disabled={createEvent.isPending}>
            {createEvent.isPending ? "Oluşturuluyor..." : "Etkinliği Yayınla"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
