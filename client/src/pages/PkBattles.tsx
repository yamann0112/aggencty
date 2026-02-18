import { usePkBattles, useCreatePkBattle } from "@/hooks/use-data";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Swords, Users, Copy, Plus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function PkBattles() {
  const { data: battles, isLoading } = usePkBattles();
  const { user } = useAuth();
  
  if (isLoading) {
    return (
      <div className="container py-12 text-center animate-pulse">
        <h2 className="text-2xl font-display mb-8">Loading Battle Arena...</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-muted rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-display font-bold text-secondary mb-2">PK Battle Arena</h1>
          <p className="text-muted-foreground">Join a room and prove your might</p>
        </div>
        {user?.role === "admin" && <CreateBattleDialog />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {battles?.map((battle) => (
          <BattleCard key={battle.id} battle={battle} />
        ))}
        {battles?.length === 0 && (
          <div className="col-span-full text-center py-20 bg-muted/20 rounded-xl border border-dashed">
            <Swords className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Active Battles</h3>
            <p className="text-muted-foreground">The arena is quiet... for now.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BattleCard({ battle }: { battle: any }) {
  const { toast } = useToast();

  const copyRoomId = () => {
    navigator.clipboard.writeText(battle.roomId);
    toast({ title: "Copied!", description: "Room ID copied to clipboard" });
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-card">
      <div className="relative h-48 bg-muted overflow-hidden">
        {/* Fallback pattern if no image */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-primary/20" />
        {battle.imageUrl ? (
          <img 
            src={battle.imageUrl} 
            alt={battle.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Swords className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Users className="h-3 w-3" />
          {battle.playerCount}/{battle.maxPlayers}
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-xl">{battle.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border border-border/50">
          <span className="text-xs font-mono text-muted-foreground flex-1 truncate pl-1">
            ID: {battle.roomId}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/50" onClick={copyRoomId}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold">
          Join Battle
        </Button>
      </CardFooter>
    </Card>
  );
}

function CreateBattleDialog() {
  const [open, setOpen] = useState(false);
  const createBattle = useCreatePkBattle();
  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    roomId: `ROOM-${Math.floor(Math.random() * 10000)}`,
    maxPlayers: 10
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBattle.mutate(formData, {
      onSuccess: () => setOpen(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Create Battle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Host New Battle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Battle Title</Label>
            <Input 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Image URL (Optional)</Label>
            <Input 
              value={formData.imageUrl}
              onChange={e => setFormData({...formData, imageUrl: e.target.value})}
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Room ID</Label>
              <Input 
                value={formData.roomId}
                readOnly
                className="bg-muted font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Max Players</Label>
              <Input 
                type="number"
                min={2}
                max={50}
                value={formData.maxPlayers}
                onChange={e => setFormData({...formData, maxPlayers: parseInt(e.target.value)})}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={createBattle.isPending}>
            {createBattle.isPending ? "Creating..." : "Create Battle Room"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
