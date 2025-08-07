# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of ELLALLE seriously. If you discover a security vulnerability, please follow these steps:

### For Web3/Blockchain Related Issues:
- **Critical**: Contract vulnerabilities, private key exposure, fund loss potential
- **High**: Authentication bypass, unauthorized access to trading functions
- **Medium**: Information disclosure, denial of service

### For Application Security Issues:
- **Critical**: Remote code execution, SQL injection, XSS leading to fund access
- **High**: Authentication bypass, privilege escalation
- **Medium**: Information disclosure, CSRF

### Reporting Process:

1. **Do NOT** create a public GitHub issue for security vulnerabilities
2. Email us at: security@ellalle.com
3. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline:
- **Acknowledgment**: Within 24 hours
- **Initial Assessment**: Within 72 hours  
- **Status Update**: Weekly until resolved
- **Resolution**: Varies by severity (1-30 days)

### Scope:
- ELLALLE web application
- Smart contracts (when deployed)
- API endpoints
- Authentication mechanisms
- Wallet integration security

### Out of Scope:
- Social engineering attacks
- Physical attacks
- Third-party dependencies (report to respective maintainers)
- Issues in development/test environments

### Rewards:
We appreciate security researchers and may provide:
- Public acknowledgment (with permission)
- ELLALLE platform credits
- Bounty rewards for critical findings (TBD)

## Security Best Practices

### For Users:
- Never share your private keys or seed phrases
- Always verify contract addresses before interacting
- Use hardware wallets for large amounts
- Keep your browser and wallet software updated
- Be cautious of phishing attempts

### For Developers:
- Regular security audits
- Principle of least privilege
- Input validation and sanitization
- Secure random number generation
- Rate limiting and DDoS protection
- Encrypted storage of sensitive data

---

**Last Updated**: August 7, 2025
