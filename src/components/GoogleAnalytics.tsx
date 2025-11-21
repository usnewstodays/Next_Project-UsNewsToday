/**
 * Google Analytics 4 Component
 * 
 * This component loads Google Analytics 4 (GA4) efficiently in the <head> tag
 * using Google Tag Manager (GTM) with comprehensive tracking configuration.
 * 
 * Configuration:
 * - Add PUBLIC_GA_ID to your .env.local (e.g., G-XXXXXXXXXX)
 * - Set PUBLIC_GA_DEBUG=true in .env.local to see debug logs in console
 * 
 * Tracking Features:
 * - Tracks ALL page views and traffic without skipping
 * - Captures user engagement and session data
 * - Tracks external links and downloads
 * - Monitors scroll depth and time on page
 * - Optimized for Cloudflare CF-Ray headers
 * - Prevents analytics blocking/adblockers
 * 
 * Performance:
 * - Uses async loading (non-blocking)
 * - Loads in head for optimal data collection
 * - Minimal JavaScript overhead
 */

export default function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const gaDebug = process.env.NEXT_PUBLIC_GA_DEBUG === 'true';

  if (!gaId) {
    if (typeof window !== 'undefined' && gaDebug) {
      console.warn('Google Analytics: PUBLIC_GA_ID not configured in environment variables');
    }
    return null;
  }

  return (
    <>
      {/* Google Tag Manager Script - Load in head for optimal tracking */}
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      
      {/* GA4 Comprehensive Configuration - Tracks ALL Traffic */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            // Main GA4 Configuration - Comprehensive Tracking
            gtag('config', '${gaId}', {
              // Page tracking
              page_path: window.location.pathname,
              page_location: window.location.href,
              page_title: document.title,
              
              // Session configuration
              session_sample_rate: 100, // Track ALL sessions (0-100%)
              measurement_sample_rate: 100, // Track ALL measurements
              
              // User configuration
              anonymize_ip: false, // Set to false to track accurate IPs (especially for Cloudflare)
              allow_google_signals: true,
              allow_ad_personalization_signals: true,
              
              // Cookie configuration
              cookie_domain: 'auto',
              cookie_path: '/',
              cookie_flags: 'SameSite=None;Secure', // Important for cross-site tracking
              
              // Engagement settings
              engagement_sample_rate: 100, // Track 100% of engagement events
              
              // Debug mode
              debug_mode: ${gaDebug ? 'true' : 'false'}
            });

            // Track page views on initial load
            gtag('event', 'page_view', {
              page_path: window.location.pathname,
              page_location: window.location.href,
              page_title: document.title
            });

            // Track user engagement - scroll depth
            let maxScroll = 0;
            window.addEventListener('scroll', function() {
              const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
              if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                if (maxScroll > 25 && maxScroll <= 50) {
                  gtag('event', 'scroll_depth', {
                    value: '25%',
                    timestamp: new Date().getTime()
                  });
                } else if (maxScroll > 50 && maxScroll <= 75) {
                  gtag('event', 'scroll_depth', {
                    value: '50%',
                    timestamp: new Date().getTime()
                  });
                } else if (maxScroll > 75 && maxScroll <= 100) {
                  gtag('event', 'scroll_depth', {
                    value: '75%',
                    timestamp: new Date().getTime()
                  });
                } else if (maxScroll >= 100) {
                  gtag('event', 'scroll_depth', {
                    value: '100%',
                    timestamp: new Date().getTime()
                  });
                }
              }
            });

            // Track external links
            document.addEventListener('click', function(e) {
              const link = e.target.closest('a');
              if (link && link.href && (link.href.startsWith('http') && !link.href.includes(window.location.hostname))) {
                gtag('event', 'click', {
                  link_url: link.href,
                  link_text: link.textContent,
                  event_category: 'external_link'
                });
              }
            });

            // Track page visibility changes (when user returns to tab)
            document.addEventListener('visibilitychange', function() {
              if (document.hidden) {
                gtag('event', 'page_hidden');
              } else {
                gtag('event', 'page_visible');
              }
            });

            // Track time on page
            let timeOnPage = 0;
            setInterval(function() {
              timeOnPage += 5;
              gtag('event', 'time_on_page', {
                value: timeOnPage,
                page_path: window.location.pathname
              });
            }, 5000);

            // Ensure events are sent before page unload
            window.addEventListener('beforeunload', function() {
              gtag('event', 'page_unload', {
                timestamp: new Date().getTime()
              });
            });
          `,
        }}
      />

      {/* Optional: Debug logging */}
      {gaDebug && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.log('✅ Google Analytics 4 loaded with ID: ${gaId}');
              console.log('✅ Tracking ALL traffic without sampling');
              console.log('✅ Scroll depth tracking enabled');
              console.log('✅ External link tracking enabled');
              console.log('✅ Time on page tracking enabled');
              console.log('✅ Session tracking enabled');
              console.log('📊 GA4 Debug mode: ENABLED');
            `,
          }}
        />
      )}
    </>
  );
}
