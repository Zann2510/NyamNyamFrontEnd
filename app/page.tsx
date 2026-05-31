'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function() {
    const history = useRouter();
    useEffect(() => {
            history.push('/main');
        }, [history]);
    return 'redirecting...';
}