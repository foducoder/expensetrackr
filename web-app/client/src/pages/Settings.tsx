import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Info, Moon, Sun, Smartphone } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatRelativeDate } from "@/lib/dateUtils";
import { useTheme } from "next-themes";
import { Settings as SettingsType } from "@shared/schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Settings = () => {
  const { toast } = useToast();
  const { setTheme, resolvedTheme } = useTheme();
  
  // Fetch settings
  const { data: settings, isLoading } = useQuery<SettingsType>({
    queryKey: ['/api/settings'],
  });

  // Update settings mutation
  const mutation = useMutation({
    mutationFn: async (updatedSettings: Partial<SettingsType>) => {
      const response = await apiRequest("PUT", "/api/settings", updatedSettings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Settings updated",
        description: "Your settings have been saved",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update settings: " + error.message,
        variant: "destructive",
      });
    },
  });

  const toggleDarkMode = () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    mutation.mutate({ darkMode: newTheme === "dark" });
  };

  return (
    <div className="space-y-6 px-4 pb-8">
      <div className="flex items-center">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <Alert className="bg-amber-50 dark:bg-amber-950/30">
        <Info className="h-4 w-4" />
        <AlertTitle>Permissions Required</AlertTitle>
        <AlertDescription>
          ExpenseTrackr requires SMS reading permission to automatically track your expenses from bank and payment app SMS messages.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>App Preferences</CardTitle>
            <CardDescription>Configure your app experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="font-medium">Dark Mode</h3>
                <p className="text-sm text-muted-foreground">Enable dark mode for better visibility at night</p>
              </div>
              <div className="flex h-8 items-center space-x-2">
                <Switch 
                  checked={resolvedTheme === "dark"} 
                  onCheckedChange={toggleDarkMode}
                  aria-label="Toggle dark mode"
                />
                {resolvedTheme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SMS Permissions</CardTitle>
            <CardDescription>Manage SMS reading permissions for expense tracking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="font-medium">SMS Reading</h3>
                <p className="text-sm text-muted-foreground">Allow the app to read SMS messages with transaction details</p>
              </div>
              <div className="flex h-8 items-center space-x-2">
                <Switch 
                  checked={!!settings?.smsPermissionGranted} 
                  disabled={mutation.isPending || isLoading}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      // This will be updated by the SMSReader component when permission is granted
                      toast({
                        title: "SMS Permission Required",
                        description: "Please grant SMS permission using the SMS Sync button on the dashboard",
                      });
                    } else {
                      mutation.mutate({ smsPermissionGranted: false });
                    }
                  }}
                  aria-label="Toggle SMS permission"
                />
                <Smartphone className="h-4 w-4" />
              </div>
            </div>
            
            {settings?.lastSyncTimestamp && (
              <p className="text-sm text-muted-foreground">
                Last synced: {formatRelativeDate(new Date(settings.lastSyncTimestamp))}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About ExpenseTrackr</CardTitle>
            <CardDescription>App information and acknowledgements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">Version 1.0.0</p>
            <p className="text-sm">
              ExpenseTrackr helps you track expenses automatically by reading SMS notifications
              from Indian banks and payment platforms.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
