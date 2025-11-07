"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authenticateUser, registerUser } from "@/lib/userStore";

interface AuthFormProps {
  type: "login" | "register";
}

export default function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isLogin = type === "login";
  const buttonText = isLogin ? "Login" : "Register";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (isLogin) {
      const isValid = authenticateUser(email, password);
      if (isValid) {
        router.push("/dashboard");
      } else {
        setError("Invalid credentials");
      }
    } else {
      const success = registerUser(email, password);
      if (success) {
        router.push("/login");
      } else {
        setError("Email already registered");
      }
    }
  };

  return (
    <div className="pointer-events-auto z-10 max-w-md w-full mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
      <h2 className="text-3xl font-semibold text-center mb-6 text-white drop-shadow-md">
        {buttonText} to Habit Tracker
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="••••••••"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20 text-white font-semibold text-lg tracking-wide"
        >
          {buttonText}
        </button>
      </form>

      <p className="text-sm text-center mt-5 text-gray-400">
        {isLogin ? (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-indigo-400 hover:underline">
              Register
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-400 hover:underline">
              Login
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
