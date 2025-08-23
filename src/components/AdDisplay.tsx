
'use client';

import type { AdConfig } from "@/app/admin/ads/page";
import Image from "next/image";
import Link from "next/link";

interface AdDisplayProps {
    ad: AdConfig;
}

export default function AdDisplay({ ad }: AdDisplayProps) {
    if (ad.type === 'image') {
        const adContent = (
             <Image
                src={ad.content}
                alt="Advertisement"
                width={728}
                height={90}
                className="mx-auto"
                style={{maxWidth: '100%', height: 'auto'}}
            />
        );

        if (ad.link) {
            return (
                <div className="py-4 bg-gray-100 dark:bg-gray-800 text-center">
                    <Link href={ad.link} target="_blank" rel="noopener noreferrer sponsored">
                       {adContent}
                    </Link>
                </div>
            )
        }
        return (
            <div className="py-4 bg-gray-100 dark:bg-gray-800 text-center">
                {adContent}
            </div>
        )
    }

    if (ad.type === 'code') {
        return (
             <div className="py-4 bg-gray-100 dark:bg-gray-800 text-center" dangerouslySetInnerHTML={{ __html: ad.content }} />
        );
    }
    
    return null;
}
