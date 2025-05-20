"use client";

import * as React from 'react';
// import type { Metadata } from 'next'; // Metadata removed
import { poppins, roboto, lora, inter, merriweather } from '@/lib/fonts'; // Added merriweather
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';

// metadata object is not used in client components.
// For dynamic titles/descriptions, use `usePathname` and update `document.title` in a useEffect.
// For static metadata, it should be defined in a Server Component layout.tsx or page.tsx.
// export const metadata: Metadata = { // Removed export
//   title: 'Aura - AI Energy Optimization',
//   description: 'Predict and optimize energy consumption of AI models.',
// };

export type FontKey = 'poppins' | 'roboto' | 'lora' | 'inter' | 'timesNewRoman'; // Added 'timesNewRoman'

export const fontConfig: Record<FontKey, { name: string; className: string; variable: string }> = {
  poppins: { name: "Poppins", className: poppins.className, variable: poppins.variable },
  roboto: { name: "Roboto", className: roboto.className, variable: roboto.variable },
  lora: { name: "Lora", className: lora.className, variable: lora.variable },
  inter: { name: "Inter", className: inter.className, variable: inter.variable },
  timesNewRoman: { name: "Times New Roman", className: merriweather.className, variable: merriweather.variable }, // Added Times New Roman (using Merriweather)
};

export const defaultFontKey: FontKey = 'poppins';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [activeFontKey, setActiveFontKey] = React.useState<FontKey>(defaultFontKey);

  React.useEffect(() => {
    // Set document title here if static metadata is desired and no server component layout is present
    document.title = 'Aura - AI Energy Optimization';

    const storedFont = localStorage.getItem("aura-font") as FontKey | null;
    const initialFontKey = storedFont && fontConfig[storedFont] ? storedFont : defaultFontKey;
    
    setActiveFontKey(initialFontKey);
    // Apply the variable class of the initially active font to <html>
    // This ensures CSS variables are available if Tailwind utilities like 'font-sans' are used based on them.
    Object.values(fontConfig).forEach(font => document.documentElement.classList.remove(font.variable));
    document.documentElement.classList.add(fontConfig[initialFontKey].variable);


    const handleFontChange = (event: Event) => {
      const newFontKey = (event as CustomEvent<FontKey>).detail;
      if (fontConfig[newFontKey]) {
        setActiveFontKey(newFontKey);
        // Update the variable class on <html>
        Object.values(fontConfig).forEach(font => document.documentElement.classList.remove(font.variable));
        document.documentElement.classList.add(fontConfig[newFontKey].variable);
      }
    };

    window.addEventListener("auraFontChanged", handleFontChange);
    return () => {
      window.removeEventListener("auraFontChanged", handleFontChange);
    };
  }, []);

  const activeFontClassName = fontConfig[activeFontKey]?.className || fontConfig[defaultFontKey].className;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
          activeFontClassName, // This applies the selected font directly via its className
          'antialiased', 
          'animated-gradient-bg'
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
