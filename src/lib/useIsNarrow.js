import { useEffect, useState } from 'react';

// 모바일 폭 감지 훅. 기본 breakpoint 480px 이하를 "narrow"로 본다.
// 외부 요청 없이 window.matchMedia만 사용.
export default function useIsNarrow(maxWidth = 480) {
  const query = `(max-width: ${maxWidth}px)`;

  const getMatch = () => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  };

  const [isNarrow, setIsNarrow] = useState(getMatch);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mql = window.matchMedia(query);
    const onChange = (e) => setIsNarrow(e.matches);
    setIsNarrow(mql.matches);
    // Safari 구버전 호환
    if (mql.addEventListener) mql.addEventListener('change', onChange);
    else mql.addListener(onChange);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', onChange);
      else mql.removeListener(onChange);
    };
  }, [query]);

  return isNarrow;
}
