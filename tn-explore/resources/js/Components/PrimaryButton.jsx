import React from 'react';
import Button from '@/Components/UI/Button';

export default function PrimaryButton({
    className = '',
    disabled = false,
    children,
    type = 'submit',
    ...props
}) {
    return (
        <Button
            type={type}
            variant="primary"
            disabled={disabled}
            className={className}
            {...props}
        >
            {children}
        </Button>
    );
}
