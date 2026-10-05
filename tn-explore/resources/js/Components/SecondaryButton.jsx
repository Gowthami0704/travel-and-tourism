import React from 'react';
import Button from '@/Components/UI/Button';

export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled = false,
    children,
    ...props
}) {
    return (
        <Button
            type={type}
            variant="secondary"
            disabled={disabled}
            className={className}
            {...props}
        >
            {children}
        </Button>
    );
}
