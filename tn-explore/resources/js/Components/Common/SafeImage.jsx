import React, { useState } from 'react';
import { Image as ImageIcon, MapPin } from 'lucide-react';

export const DEFAULT_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'%3E%3Crect width='800' height='500' fill='%2378350f' opacity='0.15'/%3E%3Cpath d='M0 350 Q 200 250 400 350 T 800 350 L 800 500 L 0 500 Z' fill='%23b45309' opacity='0.25'/%3E%3Ctext x='50%25' y='46%25' font-family='sans-serif' font-size='22' font-weight='bold' fill='%2392400e' text-anchor='middle'%3ETN Explore%3C/text%3E%3Ctext x='50%25' y='55%25' font-family='sans-serif' font-size='14' fill='%2378350f' text-anchor='middle'%3ETamil Nadu Smart Tourism%3C/text%3E%3C/svg%3E";

export default function SafeImage({
    src,
    alt = 'TN Tourism Photo',
    className = '',
    fallbackSrc = DEFAULT_PLACEHOLDER,
    ...props
}) {
    const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
    const [hasError, setHasError] = useState(!src);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            setImgSrc(fallbackSrc);
        }
    };

    return (
        <img
            src={imgSrc || fallbackSrc}
            alt={alt}
            onError={handleError}
            className={className}
            loading="lazy"
            {...props}
        />
    );
}
