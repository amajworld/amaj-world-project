'use client';

import React, { useEffect, useState } from 'react';
import type { AdConfig } from '@/app/admin/ads/page';
import { getDocuments } from '@/app/actions/firestoreActions';

const GlobalAdScripts = () => {
  const [adScripts, setAdScripts] = useState<string[]>([]);

  useEffect(() => {
    const fetchGlobalAds = async () => {
      try {
        const allAds = await getDocuments<AdConfig>('ads');
        const globalAds = allAds
          .filter(ad => (ad.location === 'popunder' || ad.location === 'social-bar') && ad.code)
          .map(ad => ad.code!);
        setAdScripts(globalAds);
      } catch (error) {
        console.error("Failed to load or parse ad configuration for global scripts.", error);
      }
    };
    fetchGlobalAds();
  }, []);

  if (adScripts.length === 0) {
    return null;
  }

  return (
    <>
      {adScripts.map((script, index) => (
        <div key={index} dangerouslySetInnerHTML={{ __html: script }} />
      ))}
    </>
  );
};

export default GlobalAdScripts;
