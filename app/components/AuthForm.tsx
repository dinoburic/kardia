"use client"

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
    mode: 'login' | 'register';
}

export default function AuthForm({ mode }: Props) {
    const router = useRouter();
    const [form,setForm] = useState({ name: '', email: '', password: ''});
    const [loading,setLoading] = useState(false);
    const [error,setError] = useState("");

    const isLogin = mode === 'login';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if(!res.ok) {
                setError(data.message || 'Something went wrong');
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            setError('Something went wrong');
        }

        setLoading(false);
    }
    return (
        <div className="max-w-sm mx-auto mt-20 p-6 border rounded-xl shadow-lg bg-white">
      <h1 className="text-2xl font-semibold mb-4 text-center" style={{color: '#333333', fontFamily: 'var(--font-geist-sans)'}}>
        {isLogin ? "Login" : "Create Account"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className="w-full px-3 py-2 border rounded"
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          className="w-full px-3 py-2 border rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          className="w-full px-3 py-2 border rounded"
        />

        {error && (
          <p className="text-red-600 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Loading..." : isLogin ? "Login" : "Register"}
        </button>
      </form>

      <div className="text-center mt-4 text-sm">
        {isLogin ? (
          <p>
            Don’t have an account?{" "}
            <a href="/register" className="text-blue-600 underline">
              Register
            </a>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 underline">
              Login
            </a>
          </p>
        )}
      </div>
    </div>
    )
}