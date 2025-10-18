"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { pay, getPaymentStatus } from "@base-org/account";
import { Button } from "@worldcoin/mini-apps-ui-kit-react";
import Image from "next/image";
import { sdk } from "@farcaster/miniapp-sdk";

type PaymentState = "idle" | "processing" | "pending" | "completed" | "failed";

interface PayResult {
  id?: string;
  transactionId?: string;
}

interface PaymentStatusResult {
  status?: string;
}

export default function TestPage() {
  console.log("🚀 TestPage component rendered");

  const searchParams = useSearchParams();
  const answerParam = searchParams.get("answer"); // 'true' or 'false'
  const paymentParam = searchParams.get("payment"); // 'false' to skip payment
  const shouldSkipPayment = paymentParam === "false";

  const PAYMENT_AMOUNT = "0.01";

  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [clickedButton, setClickedButton] = useState<"yes" | "no" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [autoTriggered, setAutoTriggered] = useState(false);
  const [isMockPayment, setIsMockPayment] = useState(false);

  const handlePayment = async (buttonType: "yes" | "no") => {
    try {
      console.log("Starting payment flow for button:", buttonType);
      alert("Starting payment for: " + buttonType); // Visual confirmation
      setClickedButton(buttonType);

      // Check if this is a mock payment (payment=false in URL)
      if (shouldSkipPayment) {
        console.log("Mock payment mode - skipping actual payment");
        setIsMockPayment(true);
        setPaymentState("completed");
        setShowSuccess(true);
        return;
      }

      setPaymentState("processing");
      setErrorMessage("");
      setIsMockPayment(false);

      console.log("Calling pay() with amount:", PAYMENT_AMOUNT);
      alert("About to call pay()"); // Visual confirmation

      // Add timeout to detect if pay() hangs
      const payPromise = pay({
        amount: PAYMENT_AMOUNT,
        to: "0x8342A48694A74044116F330db5050a267b28dD85",
        testnet: false,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Payment timeout after 30s")), 30000)
      );

      const result = await Promise.race([payPromise, timeoutPromise]);
      alert("Pay returned!"); // Visual confirmation

      console.log("Pay result received:", result);
      const payResult = result as PayResult;
      const txId = payResult?.id || payResult?.transactionId || "unknown";
      console.log("Transaction ID:", txId);

      setTransactionId(txId);
      setPaymentState("pending");

      // Poll for payment status
      const checkStatus = async () => {
        try {
          console.log("Checking payment status for txId:", txId);
          const statusResult = await getPaymentStatus({
            id: txId,
            testnet: false,
          });

          const statusResponse = statusResult as PaymentStatusResult;
          const status = statusResponse?.status || "unknown";
          console.log("Payment status:", status);

          if (status === "completed") {
            console.log("Payment completed successfully!");
            setPaymentState("completed");
            setShowSuccess(true);
            // Success screen stays up until user clicks back button
          } else if (status === "pending") {
            console.log("Payment still pending, will check again...");
            setTimeout(checkStatus, 2000);
          } else if (status === "failed") {
            console.log("Payment failed");
            setPaymentState("failed");
            setErrorMessage("Payment failed. Please try again.");
          } else {
            console.log("Unknown payment status:", status);
            setPaymentState("failed");
            setErrorMessage(`Unexpected status: ${status}`);
          }
        } catch (statusError) {
          console.error("Status check error:", statusError);
          setPaymentState("failed");
          setErrorMessage("Unable to verify payment status.");
        }
      };

      setTimeout(checkStatus, 1000);
    } catch (error) {
      console.error("Payment error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      setPaymentState("failed");
      setErrorMessage(
        error instanceof Error ? error.message : "Payment failed"
      );
    }
  };

  const handleReset = () => {
    setPaymentState("idle");
    setClickedButton(null);
    setErrorMessage("");
    setTransactionId("");
  };

  const handleBack = () => {
    setShowSuccess(false);
    setPaymentState("idle");
    setClickedButton(null);
    setTransactionId("");
    setErrorMessage("");
    setIsMockPayment(false);
    // Don't reset autoTriggered to prevent re-triggering in Mini App
  };

  // Component mount effect
  useEffect(() => {
    console.log("✅ TestPage mounted");
    alert("TestPage mounted!");
  }, []);

  // Auto-trigger payment if in Mini App with answer param
  useEffect(() => {
    const checkAndTrigger = async () => {
      console.log("=== useEffect triggered ===");
      console.log("autoTriggered:", autoTriggered);
      console.log("answerParam:", answerParam);

      if (!autoTriggered) {
        console.log("Checking if in Mini App...");
        const isMiniApp = await sdk.isInMiniApp();
        console.log("isMiniApp result:", isMiniApp);
        alert("isMiniApp: " + isMiniApp);

        if (isMiniApp) {
          console.log("In Mini App!");
          setAutoTriggered(true);

          // Use answer param if provided, otherwise default to 'yes'
          if (answerParam === "true") {
            console.log("Auto-triggering YES (answer=true)");
            alert("Auto-triggering YES (answer=true)");
            handlePayment("yes");
          } else if (answerParam === "false") {
            console.log("Auto-triggering NO (answer=false)");
            alert("Auto-triggering NO (answer=false)");
            handlePayment("no");
          } else {
            console.log("No answer param, auto-triggering YES by default");
            alert("No answer param, auto-triggering YES");
            handlePayment("yes");
          }
        } else {
          console.log("Not in Mini App - manual interaction required");
          alert("Not in Mini App - buttons will work manually");
        }
      }
    };

    checkAndTrigger();
  }, [autoTriggered]);

  const isDisabled = paymentState !== "idle";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Image Section */}
          <div className="relative w-full aspect-[2/1] bg-gradient-to-br from-blue-500 to-indigo-600">
            <Image
              src="/hero.png"
              alt="Banner"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Content Section */}
          <div className="p-6">
            {/* Buttons */}
            {paymentState === "idle" && (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handlePayment("yes")}
                  variant="primary"
                  size="lg"
                  className="w-full h-14 text-lg font-semibold"
                  disabled={isDisabled}
                >
                  Yes
                </Button>
                <Button
                  onClick={() => handlePayment("no")}
                  variant="secondary"
                  size="lg"
                  className="w-full h-14 text-lg font-semibold"
                  disabled={isDisabled}
                >
                  No
                </Button>
              </div>
            )}

            {/* Processing State */}
            {paymentState === "processing" && (
              <div className="text-center py-6">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                <p className="text-lg font-medium text-gray-700">
                  Processing Payment...
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  You clicked: {clickedButton}
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Calling Base Pay API...
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Watch for alert popups!
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  If stuck here &gt;30s, API timed out
                </p>
              </div>
            )}

            {/* Pending State */}
            {paymentState === "pending" && (
              <div className="text-center py-6">
                <div className="inline-block animate-pulse text-5xl mb-4">
                  ⏳
                </div>
                <p className="text-lg font-medium text-gray-700">
                  Confirming on Base...
                </p>
                <p className="text-xs text-gray-500 mt-2 font-mono break-all px-4">
                  {transactionId !== "unknown" && transactionId}
                </p>
              </div>
            )}

            {/* Failed State */}
            {paymentState === "failed" && (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">❌</div>
                <p className="text-lg font-medium text-red-600 mb-2">
                  Payment Failed
                </p>
                <p className="text-sm text-gray-600 mb-4 px-4">
                  {errorMessage || "An unknown error occurred"}
                </p>
                {transactionId && transactionId !== "unknown" && (
                  <p className="text-xs text-gray-400 mb-4 font-mono break-all px-4">
                    TX: {transactionId}
                  </p>
                )}
                <Button
                  onClick={handleReset}
                  variant="secondary"
                  size="lg"
                  className="w-full"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Payment Info */}
            {paymentState === "idle" && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800 text-center">
                  💳 Each button triggers a ${PAYMENT_AMOUNT} USDC payment on
                  Base
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 bg-green-500 flex items-center justify-center z-50 p-4">
          <div className="text-center max-w-md w-full">
            <div className="text-8xl mb-6 animate-bounce">🎉</div>
            <p className="text-4xl font-bold text-white mb-4">Success!</p>
            <p className="text-xl text-white mb-2">
              {isMockPayment ? "Choice recorded" : "Payment completed"}
            </p>
            {!isMockPayment && (
              <p className="text-2xl font-semibold text-white mb-8">
                You bet ${PAYMENT_AMOUNT}
              </p>
            )}
            <Button
              onClick={handleBack}
              variant="secondary"
              size="lg"
              className={`w-full max-w-xs mx-auto bg-white text-green-600 hover:bg-gray-100 font-semibold text-lg h-14 ${
                isMockPayment ? "mt-8" : ""
              }`}
            >
              ← Back
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
