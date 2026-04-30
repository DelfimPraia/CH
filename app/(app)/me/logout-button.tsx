'use client';

import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  return (
    <form method="post" action="/logout" className="mt-6">
      <button type="submit" className="btn-secondary w-full">
        <LogOut className="h-4 w-4" /> Terminar sessão
      </button>
    </form>
  );
}
