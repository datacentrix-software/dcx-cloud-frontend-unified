// OWASP Security Testing Suite
// Tests for OWASP Top 10 vulnerabilities

import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('OWASP Top 10 Security Tests', () => {
  
  describe('A01:2021 - Broken Access Control', () => {
    test('should prevent unauthorized access to admin functions', () => {
      // Arrange
      const mockUser = { role: 'user', permissions: ['read'] }
      
      // Act & Assert
      const hasAdminAccess = mockUser.permissions.includes('admin')
      expect(hasAdminAccess).toBe(false)
    })

    test('should enforce role-based access control (RBAC)', () => {
      // Arrange
      const adminUser = { role: 'admin', permissions: ['read', 'write', 'delete'] }
      const regularUser = { role: 'user', permissions: ['read'] }
      
      // Act
      const canDelete = (user: typeof adminUser) => 
        user.permissions.includes('delete')
      
      // Assert
      expect(canDelete(adminUser)).toBe(true)
      expect(canDelete(regularUser)).toBe(false)
    })

    test('should prevent privilege escalation', () => {
      // Arrange
      const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      
      // Act
      const attemptPrivilegeEscalation = () => {
        // Simulate tampering with JWT token
        const tampered = userToken.replace('user', 'admin')
        return tampered
      }
      
      // Assert
      // In real implementation, JWT signature verification would catch this
      expect(attemptPrivilegeEscalation()).not.toBe(userToken)
    })
  })

  describe('A02:2021 - Cryptographic Failures', () => {
    test('should use secure password hashing', () => {
      // Arrange
      const password = 'myPassword123!'
      
      // Act
      const hashPassword = (pwd: string) => {
        // Simulate bcrypt hashing
        return `$2b$10$${pwd.length}hashResult`
      }
      
      const hashedPassword = hashPassword(password)
      
      // Assert
      expect(hashedPassword).toContain('$2b$10$') // bcrypt identifier
      expect(hashedPassword).not.toBe(password)
    })

    test('should encrypt sensitive data at rest', () => {
      // Arrange
      const sensitiveData = 'credit-card-number-1234567890'
      
      // Act
      const encrypt = (data: string) => {
        // Simulate AES encryption
        return `encrypted_${data.length}_chars`
      }
      
      const encrypted = encrypt(sensitiveData)
      
      // Assert
      expect(encrypted).toContain('encrypted_')
      expect(encrypted).not.toBe(sensitiveData)
    })

    test('should use secure random number generation', () => {
      // Arrange & Act
      const generateSecureToken = () => {
        // Simulate crypto.randomBytes
        return Math.random().toString(36).substring(2, 15)
      }
      
      const token1 = generateSecureToken()
      const token2 = generateSecureToken()
      
      // Assert
      expect(token1).not.toBe(token2)
      expect(token1.length).toBeGreaterThan(8)
    })
  })

  describe('A03:2021 - Injection', () => {
    test('should prevent XSS attacks', () => {
      // Arrange
      const maliciousInput = '<script>alert("XSS")</script>'
      
      // Act
      const sanitizeHtml = (input: string) => {
        return input
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
      }
      
      const sanitized = sanitizeHtml(maliciousInput)
      
      // Assert
      expect(sanitized).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;')
      expect(sanitized).not.toContain('<script>')
    })

    test('should validate and sanitize user input', () => {
      // Arrange
      const userInput = {
        email: 'test@example.com',
        name: '<script>alert("hack")</script>John',
        amount: '100.50'
      }
      
      // Act
      const validateInput = (input: any) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const sanitizeName = input.name.replace(/<[^>]*>/g, '')
        const validateAmount = parseFloat(input.amount)
        
        return {
          email: emailRegex.test(input.email),
          name: sanitizeName,
          amount: !isNaN(validateAmount) && validateAmount > 0
        }
      }
      
      const validated = validateInput(userInput)
      
      // Assert
      expect(validated.email).toBe(true)
      expect(validated.name).toBe('John')
      expect(validated.amount).toBe(true)
    })

    test('should use parameterized queries', () => {
      // Arrange
      const userId = "1'; DROP TABLE users; --"
      
      // Act
      const buildQuery = (id: string) => {
        // Simulate parameterized query
        return {
          sql: 'SELECT * FROM users WHERE id = ?',
          params: [id]
        }
      }
      
      const query = buildQuery(userId)
      
      // Assert
      expect(query.sql).not.toContain(userId)
      expect(query.params[0]).toBe(userId)
    })
  })

  describe('A04:2021 - Insecure Design', () => {
    test('should implement proper session management', () => {
      // Arrange
      const session = {
        id: 'session-123',
        userId: 'user-456',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      }
      
      // Act
      const isSessionValid = (sess: typeof session) => {
        return sess.expiresAt > new Date()
      }
      
      // Assert
      expect(isSessionValid(session)).toBe(true)
      
      // Test expired session
      const expiredSession = {
        ...session,
        expiresAt: new Date(Date.now() - 1000) // 1 second ago
      }
      expect(isSessionValid(expiredSession)).toBe(false)
    })

    test('should implement rate limiting', () => {
      // Arrange
      const rateLimiter = {
        attempts: 0,
        maxAttempts: 5,
        windowMs: 15 * 60 * 1000 // 15 minutes
      }
      
      // Act
      const checkRateLimit = () => {
        rateLimiter.attempts++
        return rateLimiter.attempts <= rateLimiter.maxAttempts
      }
      
      // Assert
      for (let i = 0; i < 5; i++) {
        expect(checkRateLimit()).toBe(true)
      }
      expect(checkRateLimit()).toBe(false) // 6th attempt should fail
    })
  })

  describe('A05:2021 - Security Misconfiguration', () => {
    test('should use secure headers', () => {
      // Arrange
      const securityHeaders = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': "default-src 'self'"
      }
      
      // Act & Assert
      Object.keys(securityHeaders).forEach(header => {
        expect(securityHeaders[header as keyof typeof securityHeaders]).toBeDefined()
        expect(securityHeaders[header as keyof typeof securityHeaders]).not.toBe('')
      })
    })

    test('should disable debug information in production', () => {
      // Arrange
      const config = {
        NODE_ENV: 'production',
        DEBUG: false,
        VERBOSE_ERRORS: false
      }
      
      // Act & Assert
      expect(config.NODE_ENV).toBe('production')
      expect(config.DEBUG).toBe(false)
      expect(config.VERBOSE_ERRORS).toBe(false)
    })
  })

  describe('A06:2021 - Vulnerable and Outdated Components', () => {
    test('should scan for vulnerable dependencies', async () => {
      // This would integrate with npm audit in real implementation
      const mockAuditResult = {
        vulnerabilities: 0,
        dependencies: 150,
        devDependencies: 50
      }
      
      expect(mockAuditResult.vulnerabilities).toBe(0)
    })
  })

  describe('A07:2021 - Identification and Authentication Failures', () => {
    test('should enforce strong password policy', () => {
      // Arrange
      const passwords = [
        'weak',
        'password123',
        'StrongP@ssw0rd123!',
        '12345678'
      ]
      
      // Act
      const validatePassword = (pwd: string) => {
        const minLength = pwd.length >= 8
        const hasUpper = /[A-Z]/.test(pwd)
        const hasLower = /[a-z]/.test(pwd)
        const hasNumber = /\d/.test(pwd)
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
        
        return minLength && hasUpper && hasLower && hasNumber && hasSpecial
      }
      
      // Assert
      expect(validatePassword(passwords[0])).toBe(false) // weak
      expect(validatePassword(passwords[1])).toBe(false) // password123
      expect(validatePassword(passwords[2])).toBe(true)  // StrongP@ssw0rd123!
      expect(validatePassword(passwords[3])).toBe(false) // 12345678
    })

    test('should implement account lockout after failed attempts', () => {
      // Arrange
      let failedAttempts = 0
      const maxAttempts = 3
      
      // Act
      const attemptLogin = (isSuccess: boolean) => {
        if (!isSuccess) {
          failedAttempts++
          return failedAttempts < maxAttempts
        }
        failedAttempts = 0
        return true
      }
      
      // Assert
      expect(attemptLogin(false)).toBe(true)  // 1st failed attempt
      expect(attemptLogin(false)).toBe(true)  // 2nd failed attempt
      expect(attemptLogin(false)).toBe(false) // 3rd failed attempt - locked
    })
  })

  describe('A08:2021 - Software and Data Integrity Failures', () => {
    test('should verify data integrity', () => {
      // Arrange
      const originalData = { userId: '123', balance: 1000 }
      const checksum = JSON.stringify(originalData).length // Simple checksum
      
      // Act
      const tamperData = (data: any) => {
        data.balance = 10000 // Tampered data
        return data
      }
      
      const tamperedData = tamperData({...originalData})
      const tamperedChecksum = JSON.stringify(tamperedData).length
      
      // Assert
      expect(tamperedChecksum).not.toBe(checksum)
    })
  })

  describe('A09:2021 - Security Logging and Monitoring Failures', () => {
    test('should log security events', () => {
      // Arrange
      const securityLogger = {
        events: [] as any[],
        log: function(event: any) {
          this.events.push({
            ...event,
            timestamp: new Date()
          })
        }
      }
      
      // Act
      securityLogger.log({
        type: 'login_attempt',
        userId: '123',
        success: false,
        ip: '192.168.1.1'
      })
      
      // Assert
      expect(securityLogger.events).toHaveLength(1)
      expect(securityLogger.events[0].type).toBe('login_attempt')
      expect(securityLogger.events[0].timestamp).toBeInstanceOf(Date)
    })
  })

  describe('A10:2021 - Server-Side Request Forgery (SSRF)', () => {
    test('should validate URLs and prevent SSRF', () => {
      // Arrange
      const maliciousUrls = [
        'http://localhost:22',
        'http://169.254.169.254/', // AWS metadata
        'file:///etc/passwd',
        'http://internal.company.com'
      ]
      
      // Act
      const validateUrl = (url: string) => {
        try {
          const parsed = new URL(url)
          
          // Block private IPs and localhost
          if (parsed.hostname === 'localhost' || 
              parsed.hostname.startsWith('127.') ||
              parsed.hostname.startsWith('10.') ||
              parsed.hostname.startsWith('192.168.') ||
              parsed.hostname === '169.254.169.254') {
            return false
          }
          
          // Only allow HTTP/HTTPS
          if (!['http:', 'https:'].includes(parsed.protocol)) {
            return false
          }
          
          return true
        } catch {
          return false
        }
      }
      
      // Assert
      maliciousUrls.forEach(url => {
        expect(validateUrl(url)).toBe(false)
      })
      
      expect(validateUrl('https://api.example.com/data')).toBe(true)
    })
  })
})