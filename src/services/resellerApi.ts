/**
 * Reseller API Service - Real Backend Integration
 * 
 * GREEN PHASE: Minimal implementation to make TDD tests pass
 * This service connects to the real backend APIs for reseller functionality
 */

import axios, { AxiosInstance } from 'axios';

interface ApiConfig {
  baseURL?: string;
  useRealBackend?: boolean;
}

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
}

interface Organization {
  id: string;
  name: string;
  type: string;
  parentId?: string;
  userCount?: number;
  vmCount?: number;
  status?: string;
}

interface AuthResponse {
  user: AuthUser;
  roles: string[];
  scopeType: string;
  orgIds: string[];
  accessibleOrganizations: Organization[];
}

interface ResellerOrgTree {
  reseller: Organization;
  customers: Organization[];
}

interface OnboardCustomerData {
  organisation_name: string;
  email: string;
  firstName: string;
  lastName: string;
  city?: string;
  province?: string;
  address?: string;
  postalCode?: string;
}

interface OnboardCustomerResponse {
  user: AuthUser;
  organisation: {
    id: string;
    organisation_name: string;
    organisation_type: string;
    parent_id: string;
  };
  password: string;
}

interface CustomerDetails {
  organisation: Organization & {
    billingStatus: string;
    createdAt: string;
  };
  users: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
  }>;
  virtualMachines: Array<{
    id: string;
    name: string;
    status: string;
    cpu: number;
    memory: number;
  }>;
}

interface InviteUserData {
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  organizationId: string;
}

interface InviteUserResponse {
  user: AuthUser & { isFirstLogin: boolean };
  tempPassword: string;
}

interface ApiError {
  status: number;
  message: string;
  errors?: Array<{ field: string; message: string }>;
  retryable?: boolean;
  type?: string;
}

interface ConnectionTest {
  connected: boolean;
  apiVersion?: string;
  endpoints?: string[];
}

export class ResellerApiService {
  private api: AxiosInstance;
  private config: ApiConfig;

  constructor(config: ApiConfig = {}) {
    this.config = {
      baseURL: config.baseURL || 'http://localhost:8003',
      useRealBackend: config.useRealBackend || false,
      ...config
    };

    this.api = axios.create({
      baseURL: this.config.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Setup response interceptors for error handling
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(this.transformError(error));
      }
    );
  }

  private transformError(error: any): ApiError {
    if (error.name === 'NetworkError' || error.code === 'ECONNREFUSED') {
      return {
        type: 'NetworkError',
        message: 'Unable to connect to server. Please check your connection.',
        retryable: true,
        status: 0
      };
    }

    if (error.response) {
      const { status, data } = error.response;
      return {
        status,
        message: data.message || 'An error occurred',
        errors: data.errors,
        retryable: status >= 500
      };
    }

    return {
      status: 500,
      message: error.message || 'Unknown error',
      retryable: true
    };
  }

  async authenticateUser(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.api.post('/api/auth/login', {
        email,
        password
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getResellerOrgTree(userId: string): Promise<ResellerOrgTree> {
    try {
      const response = await this.api.get('/api/organisation/reseller/customers');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async onboardCustomer(customerData: OnboardCustomerData): Promise<OnboardCustomerResponse> {
    try {
      const response = await this.api.post('/api/organisation/reseller/onboard-customer', customerData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getCustomerDetails(organizationId: string): Promise<CustomerDetails> {
    try {
      const response = await this.api.get(`/api/organisation/${organizationId}/details`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async inviteUserToCustomer(inviteData: InviteUserData): Promise<InviteUserResponse> {
    try {
      const response = await this.api.post('/api/organisation/customer/invite', inviteData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async testConnection(): Promise<ConnectionTest> {
    try {
      const response = await this.api.get('/api/health');
      return {
        connected: true,
        apiVersion: response.data.version,
        endpoints: response.data.endpoints || [
          '/api/organisation/reseller/customers',
          '/api/organisation/reseller/onboard-customer',
          '/api/organisation/customer/invite'
        ]
      };
    } catch (error) {
      return {
        connected: false
      };
    }
  }

  // Method to set authentication token
  setAuthToken(token: string): void {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Method to clear authentication
  clearAuth(): void {
    delete this.api.defaults.headers.common['Authorization'];
  }
}