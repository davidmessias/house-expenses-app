"use client";
import { useRouter } from "next/navigation";

export default function UnauthenticatedPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Unable to authenticate</h1>
        <p className="mb-6 text-gray-600">You must be logged in to access the finance app.</p>
        <button
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => router.push("/login")}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
