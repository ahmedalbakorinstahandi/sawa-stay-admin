"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export const NotificationTestHelper: React.FC = () => {
  const { toast } = useToast();

  const testNotification = () => {
    toast({
      title: "إختبار الإشعار",
      description: "هذا إختبار لتوضيح كيف ستظهر الإشعارات عند وصولها",
      duration: 5000,
    });
  };

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-2">إختبار الإشعارات</h3>
      <p className="text-sm text-muted-foreground mb-4">
        اضغط على الزر لمعاينة كيف ستظهر الإشعارات عند وصولها
      </p>
      <Button onClick={testNotification} variant="outline">
        إختبار Toast
      </Button>
    </div>
  );
};
