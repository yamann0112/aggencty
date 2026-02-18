import { useAnnouncements } from "@/hooks/use-data";
import { Megaphone } from "lucide-react";

export function AnnouncementBar() {
  const { data: announcements } = useAnnouncements();
  
  const activeAnnouncement = announcements?.find(a => a.active);

  if (!activeAnnouncement) return null;

  return (
    <div className="bg-gradient-to-r from-secondary/90 via-secondary to-secondary/90 text-white py-2 overflow-hidden relative z-40 shadow-sm">
      <div className="container flex items-center gap-4">
        <div className="bg-secondary p-1 rounded z-10 shrink-0">
          <Megaphone className="h-4 w-4 animate-pulse" />
        </div>
        <div className="flex-1 overflow-hidden relative h-6">
          <div className="absolute whitespace-nowrap animate-marquee font-medium">
            {activeAnnouncement.content}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
