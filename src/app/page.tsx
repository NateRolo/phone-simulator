'use client';

import { PhoneSimulator } from '@/components/PhoneSimulator';
import { LandingPage } from '@/components/LandingPage';
import { useState } from 'react';

export default function Home() {
  const [appLaunched, setAppLaunched] = useState(false);

  if (!appLaunched) {
    return <LandingPage onLaunch={() => setAppLaunched(true)} />;
  }

  return <PhoneSimulator />;
}
