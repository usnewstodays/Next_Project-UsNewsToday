# Google Analytics & Ads Setup Guide

## Overview
This guide explains how to properly configure Google Analytics 4 (GA4) and custom advertisement scripts in your Next.js project for optimal performance and tracking.

## Google Analytics 4 Setup

### 1. Get Your GA4 Measurement ID
1. Go to [Google Analytics](https://analytics.google.com)
2. Create a new property or select an existing one
3. In **Admin > Data Streams**, click on your web stream
4. Copy your **Measurement ID** (format: `G-XXXXXXXXXX`)

### 2. Configure Environment Variable
Add to `.env.local`:
```
PUBLIC_GA_ID=G-ZS8YHW64VS
PUBLIC_GA_DEBUG=false
```

### 3. How It Works
- GA4 is loaded in the `<head>` tag via the `GoogleAnalytics` component
- Uses Google Tag Manager (GTM) script for reliable tracking
- Loads **asynchronously** to prevent page slowdown
- Automatically sends `page_path` with each page view

### 4. Debug Mode
Set `PUBLIC_GA_DEBUG=true` in `.env.local` to see:
- Debug logs in browser console
- Analytics initialization confirmation
- Event tracking information

### 5. Verify GA4 is Working
1. Build and run your project: `npm run build && npm start`
2. Open your site in a browser
3. Open DevTools Console (F12)
4. Look for: `"Google Analytics 4 loaded with ID: G-..."`
5. Go to Google Analytics real-time section - you should see traffic

---

## Custom Ads Scripts Setup

### 1. Google AdSense

#### Get Your AdSense ID
1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Copy your **Publisher ID** (format: `ca-pub-xxxxxxxxxxxxxxxx`)

#### Configure in `.env.local`
```
NEXT_PUBLIC_ADSENSE_ID=ca-pub-xxxxxxxxxxxxxxxx
```

#### The component automatically:
- Loads the AdSense script
- Initializes AdSense on your pages
- Loads **asynchronously** for performance

### 2. Other Ad Networks

The `CustomAdsScripts` component includes templates for:
- **Mediavine**
- **Adthrive**
- **PropellerAds**
- **Custom scripts**

#### To add another ad network:
1. Open `src/components/CustomAdsScripts.tsx`
2. Uncomment the template for your ad network
3. Replace placeholders with your credentials
4. Set `NEXT_PUBLIC_CUSTOM_ADS_ENABLED=true` in `.env.local`

---

## Performance Optimization

### What We've Done
✅ Scripts load in `<head>` but asynchronously (non-blocking)
✅ Uses `async` attribute to prevent page delays
✅ Pre-connects to external domains for faster connections
✅ Minimal JavaScript overhead
✅ No render-blocking scripts

### Best Practices
1. **Don't load ads below-the-fold immediately**
   - Consider lazy-loading ads that appear after scrolling
   
2. **Monitor Performance**
   - Use Lighthouse (in DevTools) to check Core Web Vitals
   - Target: LCP < 2.5s, CLS < 0.1, FID < 100ms

3. **Ad Density**
   - Recommended: 3 ad units per 1000 words of content
   - Too many ads = worse user experience and lower rankings

4. **Testing**
   - Test in Chrome DevTools with "Slow 3G" network throttling
   - Verify ads load without impacting page speed

---

## File Structure

```
src/
├── components/
│   ├── GoogleAnalytics.tsx      ← GA4 script component
│   └── CustomAdsScripts.tsx     ← Ad networks component
├── app/
│   └── layout.tsx              ← Imports both components in <head>
└── types/
    └── index.ts
```

---

## Environment Variables Reference

### Analytics
| Variable | Required | Format | Example |
|----------|----------|--------|---------|
| `PUBLIC_GA_ID` | Yes | `G-XXXXXXXXXX` | `G-ZS8YHW64VS` |
| `PUBLIC_GA_DEBUG` | No | `true/false` | `false` |

### Advertising
| Variable | Required | Format | Example |
|----------|----------|--------|---------|
| `NEXT_PUBLIC_ADSENSE_ID` | No | `ca-pub-XXXXXXXXXX` | `ca-pub-1234567890` |
| `NEXT_PUBLIC_CUSTOM_ADS_ENABLED` | No | `true/false` | `false` |

---

## Troubleshooting

### GA4 Not Tracking
- **Issue**: Google Analytics shows no traffic
- **Solution**: 
  1. Verify `PUBLIC_GA_ID` is correct in `.env.local`
  2. Rebuild: `npm run build`
  3. Check browser console for errors (F12)
  4. Wait 24-48 hours for historical data to appear in GA4

### AdSense Not Showing Ads
- **Issue**: No ad placeholders appear
- **Solution**:
  1. Verify `NEXT_PUBLIC_ADSENSE_ID` is set
  2. Ensure your AdSense account is approved (takes 5-7 days)
  3. Add `<ins>` tags in your article components for ad placement
  4. Check AdSense dashboard for approval status

### Page Loading Slow
- **Issue**: Page takes too long to load
- **Solution**:
  1. Verify scripts have `async` attribute (they should)
  2. Check Network tab in DevTools for slow requests
  3. Consider lazy-loading ads below the fold
  4. Run Lighthouse for detailed performance report

### CSP (Content Security Policy) Errors
- **Issue**: Console shows CSP violation errors
- **Solution**:
  1. Update your security headers in `src/lib/security.ts`
  2. Add domains to `script-src` allowlist:
     ```
     'https://www.googletagmanager.com'
     'https://pagead2.googlesyndication.com'
     ```

---

## Security Considerations

1. **Never commit `.env.local`** - it contains your tracking IDs
2. **Use HTTPS only** - GA4 and ads require secure connections
3. **Review Privacy Policy** - inform users about tracking
4. **GDPR/CCPA Compliance** - consider adding consent banner
5. **CSP Headers** - properly configure to allow scripts

---

## Next Steps

1. ✅ Add your `PUBLIC_GA_ID` to `.env.local`
2. ✅ (Optional) Add `NEXT_PUBLIC_ADSENSE_ID` if using AdSense
3. ✅ Rebuild: `npm run build`
4. ✅ Test: `npm start`
5. ✅ Verify GA4 is tracking in real-time
6. ✅ Wait 24-48 hours for GA4 to show historical data

---

## Support Resources

- [Google Analytics 4 Documentation](https://support.google.com/analytics/answer/10089681)
- [Google Tag Manager Guide](https://support.google.com/tagmanager)
- [AdSense Help Center](https://support.google.com/adsense)
- [Next.js Head Documentation](https://nextjs.org/docs/app/api-reference/functions/head)

---

**Last Updated**: November 2024
**Status**: ✅ Ready to use
