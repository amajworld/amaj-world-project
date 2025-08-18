'use client';

import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { AdConfig } from '@/app/admin/ads/page';
import { getDocuments } from '@/app/actions/firestoreActions';

interface AdBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  adName: string;
  location: AdConfig['location'];
}

const AdBanner = ({ adName, location, className, ...props }: AdBannerProps) => {
  const [adConfig, setAdConfig] = useState<AdConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const scriptContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAdConfig = async () => {
      setLoading(true);
      try {
        const allAds = await getDocuments<AdConfig>('ads');
        const specificAd = allAds.find(ad => ad.name === adName && ad.location === location);
        
        if (specificAd && (specificAd.code || (specificAd.imageUrl && specificAd.destUrl))) {
          setAdConfig(specificAd);
        } else {
          setAdConfig(null); // No valid ad found
        }
      } catch (error) {
        console.error(`Failed to load ad configuration for '${adName}'.`, error);
        setAdConfig(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAdConfig();
  }, [adName, location]);

  useEffect(() => {
    if (adConfig?.code && scriptContainerRef.current) {
        const container = scriptContainerRef.current;
        container.innerHTML = ''; 
        const fragment = document.createRange().createContextualFragment(adConfig.code);
        container.appendChild(fragment);
    }
  }, [adConfig]);
  
  if (loading || !adConfig) {
    return null;
  }
  
  const hasImageAd = adConfig.imageUrl && adConfig.destUrl;
  const hasCodeAd = !!adConfig.code;

  if (!hasImageAd && !hasCodeAd) {
      return null;
  }
  
  return (
    <div className={cn("ad-wrapper mb-8", className)} {...props}>
      {hasCodeAd ? (
        <div ref={scriptContainerRef} className="ad-container-code" />
      ) : hasImageAd ? (
        <a href={adConfig.destUrl!} target="_blank" rel="noopener noreferrer" className="block">
          <Image
            src={adConfig.imageUrl!}
            alt={`Advertisement: ${adConfig.name}`}
            width={728}
            height={90}
            className="w-full h-auto object-contain"
            unoptimized
          />
        </a>
      ) : null}
    </div>
  );
};

export default AdBanner;