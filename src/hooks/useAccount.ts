'use client';

import { useEffect, useState } from 'react';

/** undefined while loading, null when logged out. */
export function useAccount() {
  const [account, setAccount] = useState<{ username: string; email: string | null } | null | undefined>(undefined);
  useEffect(() => {
    fetch('/api/auth/me').then((response) => response.json()).then(
      (data: { username: string | null; email: string | null }) => setAccount(data.username ? { username: data.username, email: data.email } : null),
      () => setAccount(null),
    );
  }, []);
  return account;
}
