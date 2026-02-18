import { EmployeeOfMonth } from "@/components/EmployeeOfMonth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Gamepad2, Film, Calendar, Swords } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const features = [
    { 
      title: "PK Savaşları", 
      icon: Swords, 
      desc: "Rekabetçi odalara katılın", 
      href: "/pk-battles",
      color: "bg-red-500" 
    },
    { 
      title: "Filmler", 
      icon: Film, 
      desc: "Öne çıkan içerikleri izleyin", 
      href: "/movies",
      color: "bg-blue-500" 
    },
    { 
      title: "Oyunlar", 
      icon: Gamepad2, 
      desc: "Oynayın ve yarışın", 
      href: "/games",
      color: "bg-green-500" 
    },
    { 
      title: "Etkinlikler", 
      icon: Calendar, 
      desc: "Gelecek topluluk etkinlikleri", 
      href: "/events",
      color: "bg-amber-500" 
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        
        <div className="container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-7xl font-display font-bold tracking-tight mb-6">
              <span className="text-primary">Royal</span><span className="text-secondary">App</span>'e Hoş Geldiniz
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Oyun, eğlence ve savaşlar için nihai topluluk platformu.
              Seçkinlere katılın, zafer için yarışın ve arkadaşlarınızla sohbet edin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pk-battles">
                <Button size="lg" className="rounded-full px-8 text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all">
                  Savaşa Başla
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="rounded-full px-8 text-lg hover:bg-muted">
                  Topluluğa Katıl
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Winners */}
      <EmployeeOfMonth />

      {/* Feature Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <Link key={idx} href={feature.href}>
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer h-full group"
                >
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 font-display group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
