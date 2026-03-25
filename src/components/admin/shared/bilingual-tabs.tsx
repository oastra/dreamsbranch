'use client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface BilingualTabsProps {
  ua: React.ReactNode;
  en: React.ReactNode;
}

export function BilingualTabs({ ua, en }: BilingualTabsProps) {
  return (
    <Tabs defaultValue="ua">
      <TabsList>
        <TabsTrigger value="ua">Ukrainian</TabsTrigger>
        <TabsTrigger value="en">English</TabsTrigger>
      </TabsList>
      <TabsContent value="ua" className="pt-4 space-y-4">{ua}</TabsContent>
      <TabsContent value="en" className="pt-4 space-y-4">{en}</TabsContent>
    </Tabs>
  );
}
