# OWASP Top 10 for Next.js Developers - A Cheatsheet

This guide maps the OWASP Top 10 2021 security risks to specific, actionable advice for Next.js developers.

### A01:2021 - Broken Access Control
**Risk:** Users can act outside of their intended permissions.

**Next.js Actions:**
- **Server Actions:** Always re-verify the user's identity and permissions inside a Server Action. Do not trust the client-side UI to have enforced access control.
  ```typescript
  // app/actions.ts
  'use server';
  import { auth } from '@/lib/auth'; // Your auth function
  
  export async function deletePost(postId: string) {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Authentication required');
    }
    const post = await db.post.findUnique({ where: { id: postId } });
    // Can this user delete this specific post?
    if (post.authorId !== session.user.id && session.user.role !== 'admin') {
      throw new Error('Authorization failed');
    }
    // Proceed with deletion...
  }
  ```
- **Route Handlers (API Routes):** Protect routes by checking the user's session at the beginning of the handler.
- **Middleware:** Use `middleware.ts` to protect entire directories or routes based on user roles or authentication status.

### A02:2021 - Cryptographic Failures
**Risk:** Sensitive data (e.g., passwords, keys) is exposed.

**Next.js Actions:**
- **Use HTTPS:** Enforce HTTPS for your entire site.
- **Secrets Management:** Store all secrets (API keys, database URLs, `AUTH_SECRET`) in environment variables (`.env.local`). **Never** expose server-side secrets to the client by prefixing them with `NEXT_PUBLIC_`.
- **Password Hashing:** Use a strong, slow hashing algorithm like `bcrypt` or `Argon2` to store user passwords.
- **Webhook Verification:** Always verify webhook signatures (see `payment-integration` skill).

### A03:2021 - Injection
**Risk:** Untrusted data leads to SQL injection, XSS, or other command injection.

**Next.js Actions:**
- **Use an ORM:** Use Prisma, Drizzle, or another ORM that provides parameterized queries to prevent SQL injection. Avoid raw SQL queries with template literals.
- **Avoid `dangerouslySetInnerHTML`:** React by default escapes JSX content, preventing XSS. If you must render HTML from a trusted source, sanitize it first with a library like `DOMPurify`.
- **Validate Inputs:** Use a library like `zod` to validate all incoming data from forms (Server Actions) and API requests.

### A04:2021 - Insecure Design
**Risk:** Security was not a consideration during the design and architecture phase.

**Next.js Actions:**
- **Threat Model:** For complex features, think about potential abuse cases. Who can call this action? What happens if they send invalid data?
- **Principle of Least Privilege:** Code running on the server should only have the permissions it needs. A function for reading comments shouldn't be able to delete users.

### A05:2021 - Security Misconfiguration
**Risk:** Default configurations are insecure; security features are not configured correctly.

**Next.js Actions:**
- **Security Headers:** Add security headers (`Content-Security-Policy`, `X-Content-Type-Options`, etc.) in `next.config.js`.
- **Dependency Management:** Keep your dependencies up to date. Run `npm audit`, `yarn audit`, or `pnpm audit` regularly.
- **Disable Detailed Errors in Production:** Ensure `NODE_ENV` is set to `production` to avoid leaking detailed error messages.

### A06:2021 - Vulnerable and Outdated Components
**Risk:** Using libraries with known vulnerabilities.

**Next.js Actions:**
- **Automate Dependency Scanning:** Use GitHub's Dependabot or Snyk to automatically scan your project for vulnerable dependencies.
- **Choose Trusted Libraries:** Prefer well-maintained, popular libraries over obscure ones.

### A07:2021 - Identification and Authentication Failures
**Risk:** Flaws in login systems, session management, or identity verification.

**Next.js Actions:**
- **Use a Robust Auth Solution:** Use NextAuth.js, Clerk, or another battle-tested authentication library.
- **Secure Cookies:** Ensure session cookies are set with `HttpOnly`, `Secure`, and `SameSite=Lax` or `Strict` attributes.
- **Implement Rate Limiting:** Protect login and password reset endpoints from brute-force attacks.

### A08:2021 - Software and Data Integrity Failures
**Risk:** Making assumptions about software updates, critical data, and CI/CD pipelines without verification.

**Next.js Actions:**
- **Verify Webhook Signatures:** As mentioned in A02, this is critical for data integrity.
- **Use Lockfiles:** Your package manager's lockfile (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`) ensures you get the same dependency versions every time. Commit it to your repository.

### A09:2021 - Security Logging and Monitoring Failures
**Risk:** Not having sufficient logging to detect and respond to attacks.

**Next.js Actions:**
- **Log Security-Relevant Events:** Log failed logins, password resets, and attempts to access unauthorized resources.
- **Don't Log Sensitive Data:** Ensure your logs do not contain passwords, API keys, or personal information.
- **Use a Production-Ready Logger:** In production, use a structured logger like Pino instead of `console.log`.

### A10:2021 - Server-Side Request Forgery (SSRF)
**Risk:** An attacker can cause the server to make requests to an arbitrary domain.

**Next.js Actions:**
- **Validate URLs:** If your application fetches data from a URL provided by a user, validate that URL against an allowlist of trusted domains. Do not blindly fetch from any URL.
  ```typescript
  // Unsafe - Attacker can provide 'http://internal-network-service'
  const data = await fetch(req.query.url);

  // Safe
  const allowedDomains = ['example.com', 'api.example.com'];
  const url = new URL(req.query.url);
  if (!allowedDomains.includes(url.hostname)) {
    throw new Error('Invalid domain for fetch');
  }
  const data = await fetch(url);
  ```
