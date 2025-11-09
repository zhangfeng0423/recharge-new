---
name: backend-security-coder
description: Expert backend security specialist focused on secure coding practices, vulnerability prevention, and secure architecture implementation. Use when implementing authentication systems, API security, database security, or conducting security code reviews for backend applications.
---

# Backend Security Coder

## Overview

Comprehensive backend security specialist that implements secure coding practices, prevents vulnerabilities, and builds security-first backend applications. Masters input validation, authentication systems, API security, database protection, and secure error handling to resist common attack vectors.

## Core Capabilities

### 1. Secure Coding Foundations
- **Input Validation and Sanitization**: Comprehensive validation frameworks with allowlist approaches
- **Injection Attack Prevention**: SQL injection, NoSQL injection, LDAP injection, command injection prevention
- **Error Handling Security**: Secure error messages, logging without information leakage, graceful degradation
- **Sensitive Data Protection**: Data classification, secure storage patterns, encryption at rest and in transit
- **Secret Management**: Secure credential storage, environment variable best practices, secret rotation strategies

### 2. HTTP Security and Web Protection
- **Security Headers Implementation**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **Cookie Security**: HttpOnly, Secure, SameSite attributes, cookie scoping and domain restrictions
- **CORS Configuration**: Strict CORS policies, preflight request handling, credential-aware CORS
- **Session Management**: Secure session handling, session fixation prevention, timeout management
- **CSRF Protection**: Anti-CSRF tokens, header validation, double-submit cookies, SameSite enforcement

### 3. Database Security
- **Parameterized Queries**: Prepared statements, ORM security configuration, query parameterization
- **Database Authentication**: Connection security, credential management, connection pooling security
- **Data Encryption**: Field-level encryption, transparent data encryption, key management
- **Access Control**: Database user privilege separation, role-based access control
- **Audit Logging**: Database activity monitoring, change tracking, compliance logging

### 4. API Security Implementation
- **Authentication Mechanisms**: JWT security, OAuth 2.0/2.1 implementation, API key management
- **Authorization Patterns**: RBAC, ABAC, scope-based access control, fine-grained permissions
- **API Security Headers**: Rate limiting, input validation, content-type validation
- **API Versioning Security**: Secure version management, backward compatibility security
- **Error Handling**: Consistent error responses, security-aware error messages, logging strategies

### 5. External Request Security
- **Allowlist Management**: Destination allowlisting, URL validation, domain restriction
- **SSRF Prevention**: Server-side request forgery protection, internal network isolation
- **Certificate Validation**: SSL/TLS certificate pinning, certificate authority validation
- **Request Limits**: Timeout configuration, response size limits, resource protection
- **Proxy Security**: Secure proxy configuration, header forwarding restrictions

### 6. Authentication and Authorization
- **Multi-factor Authentication**: TOTP, hardware tokens, biometric integration, backup codes
- **Password Security**: Hashing algorithms (bcrypt, Argon2), salt generation, password policies
- **JWT Implementation**: Secure JWT handling, signature verification, token expiration
- **OAuth Security**: Secure OAuth flows, PKCE implementation, scope validation
- **Session Security**: Secure session tokens, session invalidation, concurrent session management

### 7. Security Monitoring and Logging
- **Security Logging**: Authentication events, authorization failures, suspicious activity tracking
- **Log Sanitization**: Preventing log injection, sensitive data exclusion from logs
- **Audit Trails**: Comprehensive activity logging, tamper-evident logging, log integrity
- **Monitoring Integration**: SIEM integration, alerting on security events, anomaly detection
- **Compliance Logging**: Regulatory requirement compliance, retention policies, log encryption

## Implementation Workflow

### Phase 1: Security Foundation
1. **Threat Assessment**
   - Identify potential attack vectors
   - Assess data sensitivity and compliance requirements
   - Define security requirements and boundaries

2. **Secure Architecture Design**
   - Implement defense-in-depth strategy
   - Design secure authentication flows
   - Plan data protection mechanisms

### Phase 2: Core Security Implementation
1. **Input Validation Framework**
   ```javascript
   // Example: Comprehensive input validation
   const validateInput = (input, schema) => {
     // Type checking
     if (typeof input !== schema.type) {
       throw new ValidationError('Invalid input type');
     }

     // Length validation
     if (schema.minLength && input.length < schema.minLength) {
       throw new ValidationError('Input too short');
     }

     // Pattern validation
     if (schema.pattern && !schema.pattern.test(input)) {
       throw new ValidationError('Invalid input format');
     }

     // Sanitization
     return sanitizeInput(input);
   };
   ```

2. **Database Security Implementation**
   ```sql
   -- Example: Secure database access patterns
   CREATE USER app_user WITH PASSWORD 'secure_password';
   GRANT SELECT, INSERT, UPDATE ON app_table TO app_user;
   REVOKE ALL ON app_table FROM PUBLIC;

   -- Parameterized queries only
   PREPARE secure_query AS SELECT * FROM users WHERE id = $1;
   ```

3. **API Security Configuration**
   ```javascript
   // Example: Secure API middleware
   const securityMiddleware = {
     helmet: helmet({
       contentSecurityPolicy: {
         directives: {
           defaultSrc: ["'self'"],
           scriptSrc: ["'self'", "'unsafe-inline'"]
         }
       }
     }),
     rateLimit: rateLimit({
       windowMs: 15 * 60 * 1000, // 15 minutes
       max: 100 // limit each IP to 100 requests per windowMs
     }),
     cors: cors({
       origin: allowedOrigins,
       credentials: true
     })
   };
   ```

### Phase 3: Advanced Security Features
1. **Advanced Authentication**
   - Multi-factor authentication implementation
   - Session management and token rotation
   - OAuth 2.0 secure implementation

2. **Security Monitoring**
   - Real-time threat detection
   - Anomaly detection algorithms
   - Automated security incident response

3. **Compliance Implementation**
   - GDPR compliance measures
   - Industry-specific security standards
   - Regular security audits and penetration testing

## Security Best Practices

### Defense in Depth
- **Multiple Security Layers**: Implement security at multiple levels
- **Principle of Least Privilege**: Minimum necessary access permissions
- **Secure Defaults**: All configurations should be secure by default
- **Fail Securely**: System should fail to a secure state

### Data Protection
- **Encryption Everywhere**: Encrypt data at rest and in transit
- **Key Management**: Secure key generation, storage, and rotation
- **Data Minimization**: Collect and store only necessary data
- **Data Classification**: Classify data by sensitivity level

### Code Security
- **Secure Coding Standards**: Follow established secure coding guidelines
- **Regular Security Reviews**: Conduct frequent security code reviews
- **Dependency Management**: Regularly update and scan dependencies
- **Security Testing**: Include security tests in CI/CD pipeline

## Common Security Patterns

### 1. Secure Authentication Flow
```
User Login Request
├─ Validate input format and length
├─ Check against known malicious patterns
├─ Verify user exists and is active
├─ Validate password with secure hashing
├─ Implement rate limiting
├─ Generate secure session token
├─ Log authentication event (without sensitive data)
└─ Return secure response with proper headers
```

### 2. API Security Implementation
```
API Request Processing
├─ Validate request headers and format
├─ Verify authentication token
├─ Check authorization permissions
├─ Validate request body and parameters
├─ Implement rate limiting check
├─ Process business logic
├─ Sanitize response data
├─ Add security headers
└─ Log request (without sensitive data)
```

### 3. Database Security Pattern
```
Database Operation
├─ Use parameterized queries
├─ Validate input before database access
├─ Implement database access controls
├─ Use least-privilege database users
├─ Encrypt sensitive data
├─ Audit database operations
└─ Handle errors without exposing database structure
```

## Example Security Implementations

**Secure Password Handling:**
```javascript
import bcrypt from 'bcrypt';
import crypto from 'crypto';

class PasswordManager {
  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  static generateSecureToken() {
    return crypto.randomBytes(32).toString('hex');
  }
}
```

**Secure Input Validation:**
```javascript
const validator = require('validator');

class InputValidator {
  static sanitizeEmail(email) {
    if (!validator.isEmail(email)) {
      throw new Error('Invalid email format');
    }
    return validator.normalizeEmail(email);
  }

  static sanitizeString(input, maxLength = 255) {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }
    if (input.length > maxLength) {
      throw new Error('Input too long');
    }
    return validator.escape(input.trim());
  }
}
```

**Secure API Response:**
```javascript
class SecureResponse {
  static success(data, message = 'Success') {
    return {
      success: true,
      message,
      data: this.sanitizeData(data),
      timestamp: new Date().toISOString()
    };
  }

  static error(message, statusCode = 500) {
    return {
      success: false,
      error: {
        message: this.sanitizeErrorMessage(message),
        code: statusCode
      },
      timestamp: new Date().toISOString()
    };
  }

  static sanitizeData(data) {
    // Remove sensitive information from data
    const sanitized = { ...data };
    delete sanitized.password;
    delete sanitized.apiKey;
    delete sanitized.secret;
    return sanitized;
  }
}
```

## Security Testing Checklist

### Required Security Tests:
- [ ] Input validation tests with malicious inputs
- [ ] Authentication bypass attempts
- [ ] SQL injection vulnerability tests
- [ ] XSS and CSRF protection tests
- [ ] Authorization bypass tests
- [ ] Rate limiting effectiveness tests
- [ ] Error handling security tests
- [ ] Session management security tests
- [ ] API security header validation
- [ ] Webhook signature verification tests

### Security Monitoring:
- [ ] Failed login attempt monitoring
- [ ] Suspicious API request detection
- [ ] Anomaly detection in user behavior
- [ ] Real-time security alerts
- [ ] Security incident logging
- [ ] Regular security audit reports

---

This skill focuses on proactive security implementation rather than just security assessment. Every piece of code should be written with security as a primary consideration, not an afterthought.\n## Resources\n\n### scripts/\nPractical security tools for Next.js development:\n- **`securityValidator.ts`**: A command-line tool to scan a Next.js project for common security vulnerabilities. It checks for:\n    - Hardcoded secrets and API keys.\n    - Usage of `dangerouslySetInnerHTML`.\n    - Insecure API routes that don't validate `req.method`.\n    - Weak crypto algorithms.\n- It can also generate a `lib/security-helpers.ts` file with Zod-based validators for environment variables and API request bodies, promoting a secure-by-design pattern.
