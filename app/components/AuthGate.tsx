"use client";

import { useState, useEffect } from "react";
import { Lock, Unlock, Delete, AlertCircle } from "lucide-react";

// --- CONFIGURATION ---
const HARDCODED_PIN = process.env.NEXT_PUBLIC_APP_PIN || "8253";
const SESSION_KEY = "asset_vault_session";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session === "granted") {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // Handle PIN entry
  const handlePress = (num: string) => {
    if (error) setError(false);
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);

      // Auto-submit on 4th digit
      if (newPin.length === 4) {
        validate(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const validate = (inputPin: string) => {
    if (inputPin === HARDCODED_PIN) {
      // SUCCESS: Set session and unlock
      sessionStorage.setItem(SESSION_KEY, "granted");
      setTimeout(() => setIsAuthenticated(true), 200);
    } else {
      // ERROR: Shake and reset
      setError(true);
      setTimeout(() => {
        setPin("");
        setError(false);
      }, 600);
    }
  };

  // Prevent flash of content
  if (loading) return null;

  // Render App if unlocked
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Render Lock Screen if locked
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] text-zinc-100 font-mono">
      <div className="w-full max-w-xs space-y-8 p-6">
        {/* Status Indicator */}
        <div className="flex flex-col items-center gap-4">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl border transition-all duration-300 ${
              error
                ? "border-red-500 bg-red-950/20 text-red-500 animate-shake"
                : "border-zinc-800 bg-zinc-900 text-zinc-400"
            }`}
          >
            {error ? <AlertCircle size={32} /> : <Lock size={32} />}
          </div>
          <div className="text-center">
            <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
              System Locked
            </h1>
            <p className="mt-1 text-xs text-zinc-700">
              Enter Security Protocol
            </p>
          </div>
        </div>

        {/* PIN Dots */}
        <div className="flex justify-center gap-4 py-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                pin.length > i
                  ? error
                    ? "bg-red-500"
                    : "bg-orange-500 scale-110"
                  : "bg-zinc-800"
              }`}
            />
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <KeypadButton key={num} onClick={() => handlePress(num.toString())}>
              {num}
            </KeypadButton>
          ))}
          <div className="flex items-center justify-center opacity-0"></div>
          <KeypadButton onClick={() => handlePress("0")}>0</KeypadButton>
          <button
            onClick={handleDelete}
            className="flex h-16 w-16 items-center justify-center rounded-full text-zinc-500 transition-colors hover:text-white active:scale-95"
          >
            <Delete size={24} />
          </button>
        </div>

        <div className="text-center">
          <p className="text-[10px] text-zinc-800 uppercase tracking-widest">
            Restricted Access // Auth Required
          </p>
        </div>
      </div>

      {/* Shake Animation CSS (Inline for simplicity) */}
      <style jsx global>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}

function KeypadButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-[#09090b] text-xl font-medium text-zinc-300 transition-all hover:border-zinc-600 hover:bg-zinc-900 active:scale-95 active:bg-zinc-800"
    >
      {children}
    </button>
  );
}
