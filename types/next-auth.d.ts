import 'next-auth';
import type { AdapterUser as DefaultAdapterUser } from 'next-auth/adapters';

declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
    faithPreference: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      faithPreference: string;
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    faithPreference: string;
  }
}

declare module 'next-auth/adapters' {
  interface AdapterUser extends DefaultAdapterUser {
    id: string;
    role: string;
    faithPreference: string;
  }
}
