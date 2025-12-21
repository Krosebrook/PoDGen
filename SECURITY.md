# Security Policy

## Supported Versions

Currently, NanoGen Studio is in pre-release (v0.0.0). Security updates will be provided for:

| Version | Supported          |
| ------- | ------------------ |
| 0.0.x   | :white_check_mark: |
| < 0.0   | :x:                |

Once v1.0 is released, we will maintain security updates for the latest major version.

---

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

### 1. **DO NOT** Open a Public Issue

Please do not disclose security vulnerabilities publicly until we've had a chance to address them.

### 2. Report Privately

Send an email to the repository maintainer with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You can find the maintainer contact in the GitHub repository settings.

### 3. Response Timeline

- **Initial Response:** Within 48 hours
- **Status Update:** Within 7 days
- **Fix Timeline:** Depends on severity
  - Critical: Within 7 days
  - High: Within 14 days
  - Medium: Within 30 days
  - Low: Next scheduled release

---

## Known Security Considerations

### Current Security Issues (v0.0.0)

#### 🔴 **High Severity**

1. **API Keys Stored in LocalStorage**
   - **Issue:** Platform integration keys are stored unencrypted in browser localStorage
   - **Impact:** XSS attacks could steal third-party API credentials
   - **Workaround:** Only use test/sandbox API keys
   - **Status:** Fix planned for v0.1.0 (encryption layer)
   - **Long-term:** Move to server-side key management in v2.0

2. **Client-Side File Validation Only**
   - **Issue:** File size and MIME type checks happen only in browser
   - **Impact:** Malicious actors could bypass validation
   - **Workaround:** None currently (API layer validates)
   - **Status:** Fix planned for v0.2.0 (server-side validation)

#### 🟡 **Medium Severity**

3. **API Key in Environment Variables**
   - **Issue:** Gemini API key loaded from `process.env.API_KEY`
   - **Impact:** Key could be exposed if environment is misconfigured
   - **Workaround:** Use restricted API keys with quota limits
   - **Status:** Documentation to be added in v0.1.0
   - **Best Practice:** Use API key management service in production

4. **No Rate Limiting**
   - **Issue:** No client-side rate limiting on API calls
   - **Impact:** API quota exhaustion possible
   - **Workaround:** Rely on Gemini API's built-in rate limiting
   - **Status:** Client-side throttling planned for v0.3.0

5. **No Content Security Policy**
   - **Issue:** No CSP headers configured
   - **Impact:** Increased XSS attack surface
   - **Workaround:** Deploy behind Cloudflare or similar with CSP
   - **Status:** To be added in deployment guide (v0.2.0)

#### 🟢 **Low Severity**

6. **Console Logging**
   - **Issue:** Some error details logged to browser console
   - **Impact:** Information disclosure in development tools
   - **Workaround:** None needed (no sensitive data logged)
   - **Status:** Being cleaned up in v0.0.1

---

## Security Best Practices for Users

### For Developers

1. **API Key Management**
   ```bash
   # Never commit your .env file
   echo ".env" >> .gitignore
   
   # Use different keys for dev/staging/prod
   API_KEY_DEV=your_dev_key
   API_KEY_PROD=your_prod_key
   ```

2. **Use Restricted API Keys**
   - Enable API key restrictions in Google Cloud Console
   - Limit to specific domains/IP addresses
   - Set up billing alerts
   - Rotate keys regularly (every 90 days)

3. **Secure Deployment**
   ```bash
   # Use environment variables, not hardcoded values
   # Set API key at deployment time
   export API_KEY="your_actual_key"
   npm run build
   ```

4. **Monitor Usage**
   - Check Google Cloud Console for unusual activity
   - Set up quota alerts
   - Review API logs regularly

### For End Users

1. **Platform Integration Keys**
   - Only use test/sandbox keys in this version
   - Clear your browser data when switching devices
   - Don't use production keys until v1.0

2. **Browser Security**
   - Use latest browser version
   - Enable browser security features
   - Be cautious of browser extensions

3. **Image Uploads**
   - Don't upload images with sensitive information
   - Generated images are processed by Google's AI
   - Respect copyright and privacy laws

---

## Dependency Security

### Automated Scanning

We use GitHub Dependabot to monitor for known vulnerabilities in dependencies.

### Current Status

As of December 21, 2025:
- **npm audit:** 0 vulnerabilities ✅
- **Outdated critical dependencies:** 0 ✅
- **Deprecated dependencies:** 1 (low impact)
  - `node-domexception@1.0.0` - indirect dependency, low risk

### Update Policy

- **Critical vulnerabilities:** Patched immediately
- **High vulnerabilities:** Patched within 7 days
- **Medium/Low vulnerabilities:** Patched in next release

---

## Security Features

### Implemented ✅

1. **Structured Error Handling**
   - Custom error classes for different scenarios
   - Error normalization prevents information leakage

2. **Input Sanitization**
   - Base64 image data cleaned before transmission
   - File type validation (client-side)
   - File size limits enforced

3. **Request Validation**
   - API key validation before requests
   - Proper error handling for auth failures
   - Exponential backoff to prevent abuse

4. **Safety Filtering**
   - Gemini API's built-in safety filters
   - Safety violations handled gracefully
   - No bypass mechanisms

### Planned 🔄

1. **API Key Encryption** (v0.1.0)
   - Encrypt platform keys in localStorage
   - Add key derivation function

2. **Server-Side Validation** (v0.2.0)
   - Move to backend API architecture
   - Validate all inputs server-side

3. **Content Security Policy** (v0.2.0)
   - Configure CSP headers
   - Add deployment guide with security checklist

4. **Rate Limiting** (v0.3.0)
   - Client-side request throttling
   - Queue management for API calls

5. **Audit Logging** (v1.0.0)
   - Log all API calls
   - Track usage patterns
   - Detect anomalies

---

## Compliance

### Data Privacy

- **No User Data Collection:** We don't collect or store user data
- **No Analytics:** No tracking scripts (unless you add them)
- **No Cookies:** No authentication cookies used

### Third-Party Data Processing

- **Google Gemini API:** 
  - Images and prompts are sent to Google for processing
  - Subject to [Google's AI Terms of Service](https://ai.google.dev/terms)
  - Data handling per [Google's Privacy Policy](https://policies.google.com/privacy)

- **Platform Integrations:**
  - Shopify, Printify, Etsy, TikTok, Amazon
  - Each has their own terms and privacy policies
  - Keys stored locally in browser only

### GDPR Compliance

For EU users:
- No personal data is collected by this application
- Images processed by Gemini API subject to Google's GDPR compliance
- Users control their own API keys and data

---

## Security Checklist for Production

Before deploying to production, ensure:

- [ ] Use production API key with restrictions
- [ ] Enable HTTPS/TLS
- [ ] Configure Content Security Policy
- [ ] Set up monitoring and alerting
- [ ] Review and update dependencies
- [ ] Run security audit (`npm audit`)
- [ ] Test error handling and recovery
- [ ] Document incident response plan
- [ ] Set up automated backups (if storing data)
- [ ] Configure CORS properly
- [ ] Add rate limiting
- [ ] Enable logging (but not of sensitive data)
- [ ] Test with security tools (OWASP ZAP, etc.)

---

## Security Resources

### Tools We Recommend

- **npm audit** - Built-in dependency vulnerability scanner
- **Snyk** - Advanced dependency and code security
- **OWASP ZAP** - Web application security testing
- **Lighthouse** - Security best practices checker

### External Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Academy](https://portswigger.net/web-security)
- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)

---

## Version History

### v0.0.0 (Current)
- Initial security policy established
- Known issues documented
- Best practices outlined

---

**Last Updated:** December 21, 2025  
**Next Review:** After v0.1.0 release

For questions about this security policy, please contact the repository maintainers.
