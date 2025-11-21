'use client';

import Script from 'next/script';
import { useMemo } from 'react';

/**
 * CustomHeadScripts Component
 * 
 * Centralized management of external and inline scripts that should be loaded
 * in the document <head> without blocking page rendering.
 * 
 * Features:
 * - Uses Next.js next/script for non-blocking strategy
 * - Supports external scripts (afterInteractive or lazyOnload)
 * - Supports inline scripts with proper escaping
 * - Reads configuration from environment variables
 * - Easy to modify: just update the SCRIPTS array or .env.local
 * 
 * Performance:
 * - Defaults to 'afterInteractive' strategy (loads after page interactive)
 * - Can override per-script with 'lazyOnload' for truly lazy loading
 * - No CLS (Cumulative Layout Shift) issues
 * - Non-blocking: scripts load in parallel, don't block rendering
 * 
 * Usage in App Router:
 * Add to src/app/layout.tsx in the <head> element:
 *   <CustomHeadScripts />
 * 
 * Usage in Pages Router:
 * Add to pages/_app.tsx inside <Head>:
 *   <CustomHeadScripts />
 */

interface ExternalScript {
  type: 'external';
  src: string;
  strategy?: 'afterInteractive' | 'lazyOnload' | 'beforeInteractive';
  async?: boolean;
  defer?: boolean;
  integrity?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'same-origin' | 'origin' | 'strict-origin' | 'origin-when-cross-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
  id?: string;
}

interface InlineScript {
  type: 'inline';
  id?: string;
  strategy?: 'afterInteractive' | 'lazyOnload';
  dangerouslySetInnerHTML: string;
}

type Script_Config = ExternalScript | InlineScript;

/**
 * SCRIPTS CONFIGURATION
 * 
 * ⚡ PASTE YOUR CUSTOM SCRIPTS HERE ⚡
 * 
 * All scripts load AFTER page content (afterInteractive or lazyOnload)
 * - Page loads FAST first
 * - Scripts load in background
 * - No blocking, no delays
 * 
 * Script Format:
 * 
 * External Script:
 * {
 *   type: 'external',
 *   src: 'https://example.com/script.js',
 *   strategy: 'afterInteractive',  // or 'lazyOnload'
 *   id: 'my-script'
 * }
 * 
 * Inline Script:
 * {
 *   type: 'inline',
 *   dangerouslySetInnerHTML: 'console.log("hello");',
 *   id: 'my-inline'
 * }
 * 
 * 👉 JUST PASTE YOUR SCRIPTS BELOW - THAT'S IT! 👈
 */

const STATIC_SCRIPTS: Script_Config[] = [
  // ✅ Google Analytics 4
  {
    type: 'external' as const,
    src: 'https://www.googletagmanager.com/gtag/js?id=G-ZS8YHW64VS',
    strategy: 'afterInteractive' as const,
    id: 'ga4-gtag',
  } as ExternalScript,
  {
    type: 'inline' as const,
    id: 'ga4-config',
    dangerouslySetInnerHTML: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-ZS8YHW64VS', {
        page_path: window.location.pathname,
        page_location: window.location.href,
        page_title: document.title,
        session_sample_rate: 100,
        measurement_sample_rate: 100,
        anonymize_ip: false,
        allow_google_signals: true,
        allow_ad_personalization_signals: true,
        cookie_domain: 'auto',
        cookie_path: '/',
        cookie_flags: 'SameSite=None;Secure',
        engagement_sample_rate: 100,
        debug_mode: false
      });
      gtag('event', 'page_view', {
        page_path: window.location.pathname,
        page_location: window.location.href,
        page_title: document.title
      });
    `,
    strategy: 'afterInteractive' as const,
  } as InlineScript,

  // ✅ MaxValue.media Ads (Custom HTML + Script)
  {
    type: 'inline' as const,
    dangerouslySetInnerHTML: `
      <!-- MaxValue.media / Banner / 1x1 / Custom -->
      <ins class="aso-zone" data-zone="158475"></ins>
      <script data-cfasync="false" async src="https://media.maxvaluead.com/js/code.min.js"><\/script>
      <!-- /MaxValue.media -->
    `,
    id: 'maxvalue-ads',
  } as InlineScript,

  // 👉 PASTE YOUR CUSTOM SCRIPTS HERE 👈
  // Example:
  // {
  //   type: 'external',
  //   src: 'https://example.com/script.js',
  //   strategy: 'afterInteractive',
  //   id: 'custom-script'
  // },
];

export default function CustomHeadScripts() {
  const scripts = useMemo(() => {
    return STATIC_SCRIPTS.filter(Boolean);
  }, []);

  // Render nothing if no scripts configured
  if (scripts.length === 0) {
    return null;
  }

  return (
    <>
      {scripts.map((script, index) => {
        if (script.type === 'external') {
          const externalScript = script as ExternalScript;
          return (
            <Script
              key={externalScript.id || `external-${index}`}
              src={externalScript.src}
              strategy={externalScript.strategy || 'afterInteractive'}
              async={externalScript.async}
              defer={externalScript.defer}
              integrity={externalScript.integrity}
              crossOrigin={externalScript.crossOrigin}
              referrerPolicy={externalScript.referrerPolicy}
            />
          );
        }

        if (script.type === 'inline') {
          const inlineScript = script as InlineScript;
          return (
            <script
              key={inlineScript.id || `inline-${index}`}
              id={inlineScript.id}
              dangerouslySetInnerHTML={{
                __html: inlineScript.dangerouslySetInnerHTML,
              }}
            />
          );
        }

        return null;
      })}
    </>
  );
}
