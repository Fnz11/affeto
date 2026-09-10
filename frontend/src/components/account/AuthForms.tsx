import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { fetcher } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertCircle } from 'lucide-react';

export function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser, sessionId } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetcher<{ jwt: string; user: any }>('/api/auth/local', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });

      setUser(res.user, res.jwt);

      // Merge guest cart if sessionId exists
      if (sessionId) {
        try {
          await fetcher('/api/cart/merge', {
            method: 'POST',
            body: JSON.stringify({ guestSessionId: sessionId }),
          });
        } catch (mErr) {
          console.error('Cart merge notice:', mErr);
        }
      }

      window.location.href = '/account';
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-card p-8 rounded-xl border border-border shadow-xs space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-editorial text-2xl font-light">Welcome Back</h1>
        <p className="text-xs text-muted-foreground">Sign in to manage orders, wishlist, and saved addresses</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Email or Username</label>
          <Input
            type="text"
            placeholder="alex@example.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full">
          Sign In
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
        <span>Don't have an account? </span>
        <a href="/account/register" className="text-primary font-semibold hover:underline">
          Create one now
        </a>
      </div>
    </div>
  );
}

export function RegisterForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser, sessionId } = useAuthStore();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetcher<{ jwt: string; user: any }>('/api/auth/local/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      });

      setUser(res.user, res.jwt);

      if (sessionId) {
        try {
          await fetcher('/api/cart/merge', {
            method: 'POST',
            body: JSON.stringify({ guestSessionId: sessionId }),
          });
        } catch (mErr) {
          console.error('Cart merge notice:', mErr);
        }
      }

      window.location.href = '/account';
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-card p-8 rounded-xl border border-border shadow-xs space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-editorial text-2xl font-light">Create Account</h1>
        <p className="text-xs text-muted-foreground">Join Affeto for exclusive early access and order tracking</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Full Name / Username</label>
          <Input
            type="text"
            placeholder="Alex Vance"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Email Address</label>
          <Input
            type="email"
            placeholder="alex@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full">
          Create Account
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
        <span>Already have an account? </span>
        <a href="/account/login" className="text-primary font-semibold hover:underline">
          Sign In
        </a>
      </div>
    </div>
  );
}
