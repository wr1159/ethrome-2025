"use client";

import { useState } from "react";
import { BasePayButton } from '@base-org/account-ui/react';
import { pay, getPaymentStatus } from '@base-org/account';

interface PayResult {
  id?: string;
  transactionId?: string;
}

interface PaymentStatusResult {
  status?: string;
}

export function BasePay() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<string | null>(null);
  const [amount, setAmount] = useState("5.00");
  
  const recipient = "dylsteck.base.eth";

  const handlePay = async () => {
    try {
      setIsProcessing(true);
      setPaymentResult(null);

      const result = await pay({
        amount: amount,
        to: recipient,
        testnet: false
      });

      const payResult = result as PayResult;
      const transactionId = payResult?.id || payResult?.transactionId || 'unknown';
      setPaymentResult(`Payment initiated! Transaction ID: ${transactionId}`);

      const checkStatus = async () => {
        try {
          const statusResult = await getPaymentStatus({ 
            id: transactionId,
            testnet: false
          });
          
          const statusResponse = statusResult as PaymentStatusResult;
          const status = statusResponse?.status || 'unknown';
          
          if (status === 'completed') {
            setPaymentResult(`🎉 Payment completed! Transaction ID: ${transactionId}`);
          } else if (status === 'pending') {
            setPaymentResult(`⏳ Payment pending... Transaction ID: ${transactionId}`);
            setTimeout(checkStatus, 2000);
          } else if (status === 'failed') {
            setPaymentResult(`❌ Payment failed. Transaction ID: ${transactionId}`);
          }
        } catch (statusError) {
          console.error("Status check error:", statusError);
          setPaymentResult(`Payment initiated but status check failed. Transaction ID: ${transactionId}`);
        }
      };

      setTimeout(checkStatus, 1000);

    } catch (error) {
      console.error("Payment error:", error);
      setPaymentResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mb-4">
      <div className="p-3 bg-muted border border-border rounded-lg my-2">
        <pre className="font-mono text-xs text-primary font-medium">Base Pay (USDC)</pre>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Amount (USD)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0.01"
            className="w-full px-3 py-2 border border-input bg-background rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            placeholder="5.00"
          />
        </div>

        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="text-sm font-medium text-primary mb-1">Recipient</div>
          <div className="font-mono text-xs text-muted-foreground">{recipient}</div>
        </div>

        <div className={isProcessing ? 'opacity-50 pointer-events-none' : ''}>
          <BasePayButton
            colorScheme="light"
            onClick={handlePay}
          />
        </div>

        {paymentResult && (
          <div className="p-3 bg-muted border border-border rounded-lg">
            <div className="font-semibold text-muted-foreground mb-1">Payment Status</div>
            <div className="text-sm text-foreground whitespace-pre-wrap">{paymentResult}</div>
          </div>
        )}
      </div>
    </div>
  );
}