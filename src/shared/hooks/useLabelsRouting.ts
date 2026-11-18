import { appPathname } from '@/shared/utils/appBase';
import { useEffect, useState } from 'react';

function isLabelsPath(): boolean {
  return appPathname() === '/labels' || appPathname() === '/labels/';
}

export function useLabelsRouting(): { isLabelsRoute: boolean } {
  const [isLabelsRoute, setIsLabelsRoute] = useState(isLabelsPath);

  useEffect(() => {
    const handlePopState = () => setIsLabelsRoute(isLabelsPath());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return { isLabelsRoute };
}
