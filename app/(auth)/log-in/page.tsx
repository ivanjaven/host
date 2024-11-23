// app/(auth)/log-in/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/ui/loading";
import Image from "next/image";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Get user document from Firestore
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("User data not found");
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // Update last login
      await updateDoc(doc(db, "users", userDoc.id), {
        lastLogin: serverTimestamp(),
      });

      // Store user type in localStorage
      localStorage.setItem("userRole", userData.role);

      // Redirect to dashboard
      router.push("/dashboard");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Invalid email or password");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="w-1/2 flex flex-col p-8">
        {/* Logo and App Name Section */}
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={64}
            height={42}
            className="w-auto h-auto"
          />
          <span className="text-2xl font-extrabold text-gray-900">HoST</span>
        </div>

        {/* Center the login form */}
        <div className="flex-grow flex items-center justify-center">
          <div className="w-full max-w-[440px]">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Log In Dashboard
              </h1>
              <p className="text-gray-500">Please enter your account details</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200
                      focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                      text-sm text-gray-900 placeholder-gray-400"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200
                      focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                      text-sm text-gray-900 placeholder-gray-400"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 text-white bg-primary hover:bg-primary-dark
                  rounded-lg transition-colors duration-200 flex justify-center items-center
                  disabled:opacity-50 text-sm font-medium"
              >
                {isLoading ? <Loading size="small" color="white" /> : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="w-1/2 bg-gray-100 relative">
        <Image
          src="/images/login_image.jpg"
          alt="Login decoration"
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
}
