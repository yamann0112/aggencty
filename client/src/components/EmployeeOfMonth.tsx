import { useUsers } from "@/hooks/use-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Crown, Medal } from "lucide-react";
import { motion } from "framer-motion";

export function EmployeeOfMonth() {
  const { data: users } = useUsers();
  
  // For demo, just pick 3 users as "winners" or use the isEmployeeOfMonth flag
  // In a real app, this logic would be more complex or controlled by admin
  const winners = users?.filter(u => u.isEmployeeOfMonth).slice(0, 3) || [];

  if (winners.length === 0) return null;

  return (
    <section className="py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <div className="container relative">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-display font-bold text-primary mb-2">Onur Listesi</h2>
          <p className="text-muted-foreground">En iyi topluluk üyelerimizi tanıyoruz</p>
        </div>

        <div className="flex flex-col md:flex-row items-end justify-center gap-8 md:gap-4 pb-8">
          {/* 2nd Place */}
          {winners[1] && (
            <div className="flex flex-col items-center order-2 md:order-1">
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <Avatar className="h-24 w-24 border-4 border-slate-300 shadow-xl">
                  <AvatarImage src={winners[1].avatarUrl || undefined} />
                  <AvatarFallback className="bg-slate-100 text-slate-500 text-2xl font-bold">2</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-800 rounded-full p-1.5 shadow-md">
                  <Medal className="h-5 w-5" />
                </div>
              </motion.div>
              <div className="mt-5 text-center">
                <p className="font-bold text-lg">{winners[1].displayName || winners[1].username}</p>
                <p className="text-sm text-muted-foreground">İkinci</p>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {winners[0] && (
            <div className="flex flex-col items-center order-1 md:order-2 z-10 mb-8 md:mb-0">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-primary animate-bounce">
                  <Crown className="h-10 w-10 fill-current" />
                </div>
                <Avatar className="h-32 w-32 border-4 border-primary shadow-2xl shadow-primary/30 ring-4 ring-primary/20">
                  <AvatarImage src={winners[0].avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-4xl font-bold">1</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-full p-2 shadow-lg border-2 border-white dark:border-black">
                  <Trophy className="h-6 w-6" />
                </div>
              </motion.div>
              <div className="mt-6 text-center">
                <p className="font-bold text-xl text-primary">{winners[0].displayName || winners[0].username}</p>
                <p className="text-sm font-medium text-secondary">Ayın Elemanı</p>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {winners[2] && (
            <div className="flex flex-col items-center order-3 md:order-3">
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative"
              >
                <Avatar className="h-24 w-24 border-4 border-amber-700 shadow-xl">
                  <AvatarImage src={winners[2].avatarUrl || undefined} />
                  <AvatarFallback className="bg-amber-100 text-amber-700 text-2xl font-bold">3</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-700 text-amber-100 rounded-full p-1.5 shadow-md">
                  <Medal className="h-5 w-5" />
                </div>
              </motion.div>
              <div className="mt-5 text-center">
                <p className="font-bold text-lg">{winners[2].displayName || winners[2].username}</p>
                <p className="text-sm text-muted-foreground">Yükselen Yıldız</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
