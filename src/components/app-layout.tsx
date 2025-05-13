
"use client";

import type { LucideIcon } from "lucide-react";
import { Moon, Sun } from "lucide-react";
import * as React from "react";

import { AuraLogo } from "@/components/aura-logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger, 
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { SheetTitle } from "@/components/ui/sheet"; 
import { SidebarDevEnergyInfo } from "@/components/sidebar-dev-energy-info";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  action: () => void;
}

interface AppLayoutProps {
  navItems: NavItem[];
  activeView: string;
  children: React.ReactNode;
  pageTitle: string; // Added pageTitle prop
}

export function AppLayout({ navItems, activeView, children, pageTitle }: AppLayoutProps) {
  const [isDarkTheme, setIsDarkTheme] = React.useState(true); 

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const storedTheme = localStorage.getItem('aura-theme');
      if (storedTheme) {
        setIsDarkTheme(storedTheme === 'dark');
      } else {
        setIsDarkTheme(prefersDark); 
      }
    }
  }, []);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDarkTheme);
      localStorage.setItem('aura-theme', isDarkTheme ? 'dark' : 'light');
    }
  }, [isDarkTheme]);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };
  
  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-4">
          <div className="flex items-center">
            <AuraLogo iconClassName="h-6 w-6" />
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={item.action}
                  isActive={activeView === item.id}
                  tooltip={{ children: item.label, className: "bg-card text-card-foreground border-border shadow-lg" }}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2">
          <SidebarSeparator /> 
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarDevEnergyInfo />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6 md:px-8">
          <div className="flex items-center gap-4">
            <SidebarTrigger /> 
            <h1 className="text-xl font-semibold text-foreground">{pageTitle}</h1>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={isDarkTheme ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                {isDarkTheme ? <Sun className="h-5 w-5 text-foreground" /> : <Moon className="h-5 w-5 text-foreground" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-card text-card-foreground border-border shadow-lg">
              <p>{isDarkTheme ? "Switch to Light Mode" : "Switch to Dark Mode"}</p>
            </TooltipContent>
          </Tooltip>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
