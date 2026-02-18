import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { usePages, useSetting } from "@/hooks/use-data";
import { 
  Menu, X, Home, Film, Gamepad2, Swords, Calendar, 
  ShieldCheck, LogOut, Sun, Moon, User as UserIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { data: customPages } = usePages();
  const { data: siteNameSetting } = useSetting("siteName");
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const siteName = siteNameSetting?.value || "ROYAL APP";
  const nameParts = siteName.split(" ");
  const firstName = nameParts[0];
  const restName = nameParts.slice(1).join(" ");

  useEffect(() => {
    // Check initial theme preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  };

  const menuItems = [
    { href: "/", label: "Ana Sayfa", icon: Home },
    { href: "/movies", label: "Filmler", icon: Film },
    { href: "/games", label: "Oyunlar", icon: Gamepad2 },
    { href: "/pk-battles", label: "PK Savaşları", icon: Swords },
    { href: "/events", label: "Etkinlikler", icon: Calendar },
    ...(customPages?.filter(p => p.isVisible).map(p => ({ 
      href: `/page/${p.slug}`, 
      label: p.title, 
      icon: Gamepad2 // Default icon for custom pages
    })) || [])
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm shadow-primary/5">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetTitle className="text-primary font-display mb-4">Navigasyon</SheetTitle>
              <div className="flex flex-col gap-4 py-4">
                {menuItems.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                      location === item.href 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "hover:bg-muted"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
                
                {user?.role === "admin" && (
                  <Link 
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-md text-secondary hover:bg-secondary/10 transition-colors mt-4 border border-secondary/20"
                  >
                    <ShieldCheck className="h-5 w-5" />
                    Yönetici Paneli
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold bg-gradient-to-r from-primary via-yellow-500 to-primary bg-clip-text text-transparent ml-2 md:ml-0 uppercase">
            {firstName}<span className="text-secondary"> {restName}</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 ml-8">
            {menuItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === item.href ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="hidden sm:flex">
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-primary/20 hover:border-primary transition-colors">
                    <AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === "admin" && (
                  <Link href="/admin">
                    <DropdownMenuItem className="cursor-pointer text-secondary focus:text-secondary">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      <span>Yönetici Paneli</span>
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuItem className="cursor-pointer" onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Çıkış Yap</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button>Giriş Yap</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
