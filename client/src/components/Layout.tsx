import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Home, PieChart, Settings as SettingsIcon, Menu, X } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [location] = useLocation();
  const isMobile = useMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const navItems = [
    {
      label: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      href: "/",
    },
    {
      label: "Transactions",
      icon: <PieChart className="h-5 w-5" />,
      href: "/transactions/" + new Date().getFullYear() + "/" + new Date().getMonth(),
    },
    {
      label: "Settings",
      icon: <SettingsIcon className="h-5 w-5" />,
      href: "/settings",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {isMobile ? (
        <>
          <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4">
            <div className="flex items-center">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="mr-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs">
                  <div className="flex h-full flex-col justify-between">
                    <div className="space-y-4 py-4">
                      <div className="px-3 py-2">
                        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                          ExpenseTrackr
                        </h2>
                        <div className="space-y-1">
                          {navItems.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsSheetOpen(false)}
                            >
                              <Button
                                variant={isActive(item.href) ? "secondary" : "ghost"}
                                className="w-full justify-start"
                              >
                                {item.icon}
                                <span className="ml-2">{item.label}</span>
                              </Button>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 text-xs text-muted-foreground">
                      ExpenseTrackr • v1.0.0
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              <h1 className="text-xl font-semibold">ExpenseTrackr</h1>
            </div>
          </div>
          <main className="py-6">{children}</main>
        </>
      ) : (
        <div className="flex min-h-screen">
          <aside className="fixed inset-y-0 z-20 flex h-full w-72 flex-col border-r">
            <div className="border-b px-6 py-5">
              <h1 className="text-xl font-semibold">ExpenseTrackr</h1>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid items-start px-4 text-sm font-medium">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive(item.href) ? "secondary" : "ghost"}
                      className="w-full justify-start"
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>
            <div className="border-t p-4">
              <p className="text-xs text-muted-foreground">
                ExpenseTrackr • v1.0.0
              </p>
            </div>
          </aside>
          <main className="ml-72 flex-1 overflow-hidden">
            <div className="h-full px-6 py-8">{children}</div>
          </main>
        </div>
      )}
    </div>
  );
};

export default Layout;
