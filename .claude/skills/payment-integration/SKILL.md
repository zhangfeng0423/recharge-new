---
name: payment-integration
description: Payment integration specialist for secure Stripe, PayPal, and payment processor implementations. Handles checkout flows, subscriptions, webhooks, and PCI compliance. Use when implementing payment features, billing systems, subscription management, or payment processing in web applications.
---

# Payment Integration

## Overview

Comprehensive payment integration specialist that enables secure, reliable payment processing across multiple payment providers. Focuses on implementing checkout flows, subscription billing, webhook handling, and maintaining PCI compliance while providing robust error handling and retry logic.

## Workflow Decision Tree

**When implementing payment features, follow this decision tree:**

```
Payment Integration Request
├─ What type of payment functionality?
│  ├─ One-time payments → Basic Checkout Flow
│  ├─ Subscriptions → Recurring Billing Setup
│  ├─ Webhooks needed → Event Handling Implementation
│  └─ Multiple providers → Multi-provider Strategy
│
├─ Which payment provider?
│  ├─ Stripe → Stripe SDK Implementation
│  ├─ PayPal → PayPal Integration
│  ├─ Square → Square API Setup
│  └─ Custom → Provider-agnostic Architecture
│
└─ Security requirements?
   ├─ Basic → Standard PCI compliance
   ├─ High-volume → Advanced security measures
   └─ Sensitive data → Enhanced data protection
```

## Core Capabilities

### 1. Payment Provider Integration
- **Stripe Integration**: Complete Stripe SDK implementation with Elements, Checkout, and PaymentIntents
- **PayPal Integration**: PayPal JavaScript SDK, smart buttons, and server-side API integration
- **Square Integration**: Square Web Payments SDK and backend API implementation
- **Multi-provider Strategy**: Unified abstraction layer for multiple payment providers

### 2. Checkout Flow Implementation
- **Payment Forms**: Secure payment form creation with proper validation
- **Client-side SDK Integration**: Payment element setup and tokenization
- **Server-side Processing**: Secure payment confirmation and handling
- **Error Handling**: Comprehensive payment error management and user feedback
- **Mobile Optimization**: Responsive payment interfaces for all devices

### 3. Subscription and Recurring Billing
- **Subscription Management**: Create, modify, and cancel subscriptions
- **Billing Cycles**: Handle monthly, yearly, and custom billing periods
- **Proration**: Calculate and handle prorated charges for plan changes
- **Trial Periods**: Implement free trials and promotional periods
- **Failed Payment Recovery**: Automated dunning and retry logic

### 4. Webhook Event Handling
- **Event Processing**: Secure webhook endpoint implementation
- **Signature Verification**: Validate webhook signatures for security
- **Event Types**: Handle payment succeeded, failed, disputes, refunds
- **Idempotency**: Ensure webhook processing is idempotent
- **Event Logging**: Comprehensive webhook event tracking

### 5. Security and Compliance
- **PCI Compliance**: Implement PCI DSS requirements for payment handling
- **Data Protection**: Never log or store sensitive card data
- **Tokenization**: Use payment provider tokenization for secure data handling
- **HTTPS Enforcement**: Ensure all payment communications use HTTPS
- **Input Validation**: Comprehensive validation of payment-related inputs

### 6. Error Handling and Recovery
- **Payment Failures**: Graceful handling of declined payments
- **Retry Logic**: Smart retry strategies for temporary failures
- **User Communication**: Clear error messages and next steps
- **Fallback Methods**: Alternative payment options when primary fails
- **Monitoring**: Payment failure rate tracking and alerting

## Implementation Approach

### Phase 1: Foundation Setup
1. **Environment Configuration**
   ```bash
   # Required environment variables
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   PAYPAL_CLIENT_ID=...
   PAYPAL_CLIENT_SECRET=...
   WEBHOOK_SECRET=whsec_...
   ```

2. **SDK Installation**
   ```bash
   npm install stripe @stripe/react-stripe-js
   npm install @paypal/react-paypal-js
   npm install square
   ```

3. **Basic Architecture Setup**
   - Payment service abstraction layer
   - Database schema for payment records
   - Error handling framework

### Phase 2: Core Implementation
1. **Client-side Integration**
   - Payment form components
   - Payment element setup
   - Loading and error states

2. **Server-side Processing**
   - Payment intent creation
   - Webhook endpoint setup
   - Database operations

3. **Security Implementation**
   - Input validation
   - Signature verification
   - PCI compliance checks

### Phase 3: Advanced Features
1. **Subscription Management**
   - Subscription lifecycle handling
   - Plan change logic
   - Billing period management

2. **Advanced Webhooks**
   - Complex event handling
   - Idempotency keys
   - Event replay capabilities

3. **Testing and Monitoring**
   - Test mode implementation
   - Payment monitoring dashboards
   - Error tracking and alerting

## Best Practices

### Security First
- **Never log sensitive data**: Card numbers, CVCs, or full payment details
- **Use provider SDKs**: Always use official SDKs for payment processing
- **Validate all inputs**: Comprehensive input validation on both client and server
- **Implement rate limiting**: Prevent abuse of payment endpoints

### Error Handling
- **Graceful degradation**: Always provide fallback options
- **Clear user messages**: Explain payment failures in user-friendly terms
- **Retry strategies**: Implement exponential backoff for retries
- **Comprehensive logging**: Log payment events without sensitive data

### Testing Strategy
- **Test mode first**: Always implement in test/sandbox mode first
- **Edge case testing**: Test all failure scenarios and edge cases
- **Integration testing**: Test the complete payment flow end-to-end
- **Load testing**: Test payment processing under high load

## Example Interactions

**Implementing Stripe Checkout:**
```
"Set up Stripe checkout with payment elements for our e-commerce site"
→ Creates complete Stripe integration with secure payment forms
→ Includes error handling, success states, and webhook processing
```

**Subscription Management:**
```
"Implement subscription billing with monthly plans and trial periods"
→ Creates subscription lifecycle management
→ Handles plan changes, cancellations, and failed payments
```

**Multi-provider Setup:**
```
"Integrate both Stripe and PayPal as payment options"
→ Implements multi-provider payment strategy
→ Creates unified payment interface with provider selection
```

**Webhook Implementation:**
```
"Set up webhooks to handle payment events and update our database"
→ Creates secure webhook endpoints with signature verification
→ Handles all payment event types with proper error handling
```

## Security Checklist

### Required for All Payment Implementations:
- [ ] HTTPS enforced on all payment endpoints
- [ ] Payment provider SDKs properly configured
- [ ] Sensitive data never logged or stored
- [ ] Input validation implemented on all payment data
- [ ] Webhook signature verification implemented
- [ ] Idempotency keys used for payment operations
- [ ] Error handling doesn't expose sensitive information
- [ ] Rate limiting implemented on payment endpoints
- [ ] PCI compliance requirements followed
- [ ] Regular security reviews of payment code

---

This skill focuses on secure, reliable payment processing implementation. Always prioritize security and user experience when working with payment systems.\n## Resources\n\n### scripts/\nSecure, modern scripts for payment processing in Next.js:\n- **`paymentProcessor.ts`**: A comprehensive and secure webhook handler for payment providers like Stripe. This script provides a framework for:\n    - **Secure Signature Verification**: Implements HMAC-SHA256 signature validation to protect against spoofed webhooks.\n    - **Type-Safe Payload Validation**: Uses Zod to define and validate the structure of incoming webhook events, preventing malformed data from being processed.\n    - **Idempotent Processing**: Includes logic and comments on how to track processed event IDs to prevent duplicate handling of the same event.\n    - **Clear Next.js API Route Structure**: Designed specifically for Next.js, including how to handle raw request bodies for verification.
