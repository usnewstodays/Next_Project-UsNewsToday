// Dummy analytics events file - clone from Astro
// In production, these would be actual analytics event tracking utilities

export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  SEARCH: 'search',
  POST_VIEW: 'post_view',
  CATEGORY_VIEW: 'category_view',
  AUTHOR_VIEW: 'author_view',
};

export function trackPageView(path: string, title: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', ANALYTICS_EVENTS.PAGE_VIEW, {
      page_path: path,
      page_title: title,
    });
  }
}

export function trackSearch(query: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', ANALYTICS_EVENTS.SEARCH, {
      search_term: query,
    });
  }
}

export function trackPostView(postId: string, postTitle: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', ANALYTICS_EVENTS.POST_VIEW, {
      content_id: postId,
      content_name: postTitle,
      content_type: 'post',
    });
  }
}
