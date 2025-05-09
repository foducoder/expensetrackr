import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parseIndianBankSMS } from "@/lib/smsParser";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { InsertTransaction, Transaction } from "@shared/schema";

interface SMSReaderProps {
  onSync?: () => void;
}

export function SMSReader({ onSync }: SMSReaderProps) {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

  // Check if SMS permission has been granted
  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
  });

  // Create transaction mutation
  const createTransaction = useMutation({
    mutationFn: async (transaction: InsertTransaction) => {
      const response = await apiRequest("POST", "/api/transactions", transaction);
      return response.json() as Promise<Transaction>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    },
  });

  // Update settings mutation
  const updateSettings = useMutation({
    mutationFn: async (settings: any) => {
      const response = await apiRequest("PUT", "/api/settings", settings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
  });

  const handleSMSSync = async () => {
    // This is a simulation for SMS reading as we can't access real SMS in a web app
    // In a real app, we would integrate with the mobile device's SMS API
    
    setIsSyncing(true);
    
    try {
      // Simulate SMS permission request
      toast({
        title: "SMS Permission",
        description: "Requesting permission to read SMS messages...",
      });
      
      // Update settings with permission granted
      await updateSettings.mutateAsync({
        smsPermissionGranted: true,
        lastSyncTimestamp: new Date().toISOString(),
      });
      
      // Simulate SMS reading with sample messages
      const sampleSMSMessages = [
        {
          id: "sms1",
          body: "HDFC Bank: Rs.1,250.00 debited from a/c **1234 on 15-05-2023 to SWIGGY. Avl bal: Rs.24,780.45. Info: UPI-P2M",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "sms2",
          body: "ICICI Bank: Rs.35,000.00 credited to your a/c XX7890 on 01-05-2023 by ACME CORP SALARY. Available balance: Rs.42,355.20",
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "sms3",
          body: "SBI Alert: Rs.499.00 debited from your A/c no. XX5678 on 10-05-2023 using Debit Card XX4321 at NETFLIX. Avl Bal:Rs.15,230.75",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "sms4",
          body: "Axis Bank: Rs.2,500.00 sent to JOHN.SMITH@ybl via UPI on 12-05-2023 from a/c XX8765. UPI Ref: 123456789012. Balance: Rs.18,540.30",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "sms5",
          body: "PNB: Rs.3,450.00 withdrawn from ATM on 08-05-2023 from a/c XX2345. Available balance: Rs.12,780.45",
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      
      // Process SMS messages and extract transactions
      let successCount = 0;
      
      for (const sms of sampleSMSMessages) {
        try {
          const parsedTransaction = parseIndianBankSMS(sms.body);
          
          if (parsedTransaction) {
            // Create transaction
            await createTransaction.mutateAsync({
              ...parsedTransaction,
              timestamp: new Date(sms.timestamp),
              smsId: sms.id,
              smsBody: sms.body,
            });
            successCount++;
          }
        } catch (error) {
          console.error("Error processing SMS:", sms.body, error);
        }
      }
      
      // Show success message
      toast({
        title: "SMS Sync Complete",
        description: `Found ${successCount} transactions from SMS messages.`,
      });
      
      // Trigger callback to refresh data
      if (onSync) {
        onSync();
      }
    } catch (error) {
      console.error("SMS sync error:", error);
      toast({
        title: "SMS Sync Failed",
        description: "Failed to sync SMS messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleSMSSync}
      disabled={isSyncing}
      className="h-9"
    >
      <Smartphone className="mr-2 h-4 w-4" />
      {isSyncing ? "Syncing..." : "SMS Sync"}
    </Button>
  );
}
