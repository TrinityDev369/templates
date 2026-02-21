'use client';

import { useEffect, useRef, useState } from 'react';
import Giscus from '@giscus/react';

// TODO: fill in your config from https://giscus.app
const REPO = 'owner/repo' as `${string}/${string}`;
const REPO_ID = ''; // TODO
const CATEGORY = 'Announcements'; // TODO
const CATEGORY_ID = ''; // TODO
interface CommentsProps {
  slug: string;
  theme?: 'light' | 'dark' | 'preferred_color_scheme';
  lang?: string;
}

export function Comments({
  slug,
  theme = 'preferred_color_scheme',
  lang = 'en',
}: CommentsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ minHeight: 200 }}>
      {visible && (
        <Giscus
          repo={REPO}
          repoId={REPO_ID}
          category={CATEGORY}
          categoryId={CATEGORY_ID}
          mapping="specific"
          term={slug}
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          theme={theme}
          lang={lang}
          loading="lazy"
        />
      )}
    </div>
  );
}
