import React from 'react';
import Button from '@/Components/UI/Button';

export default function DangerButton({
    className = '',
    disabled = false,
    children,
    ...props
}) {
    return (
        <Button
            type="button"
            variant="destructive"
            disabled={disabled}
            className={className}
            {...props}
        >
            {children}
        </Button>
    );
}
