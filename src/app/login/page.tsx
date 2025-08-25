"use client";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow max-w-sm w-full">
        <h1 className="text-2xl font-bold mb-4">Sign in</h1>
        <p className="mb-6 text-gray-600">Login with your Cognito account to access the finance app.</p>
        <button
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => signIn("cognito", { callbackUrl })}
        >
          Sign in with Cognito
        </button>
      </div>
    </div>
  );
}
