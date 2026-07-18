import {
  AuthTokens,
  SignupPayload,
  LoginPayload,
  User,
  BusinessProfile,
  SiteSchema,
  Block,
  VersionSnapshot,
  Template,
  ABTest,
  DynamicRecord,
  Product,
  Booking,
  Order,
  Inventory,
  Contact,
  FormSubmission,
  MessageThread,
  Review
} from './types';

export interface ClientOptions {
  baseUrl?: string;
  initialTokens?: AuthTokens | null;
  onTokensChanged?: (tokens: AuthTokens | null) => void;
}

export class TridopApiClient {
  private baseUrl: string;
  private tokens: AuthTokens | null = null;
  private onTokensChanged?: (tokens: AuthTokens | null) => void;

  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor(options: ClientOptions = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:4000';
    this.tokens = options.initialTokens || null;
    this.onTokensChanged = options.onTokensChanged;
  }

  /** Update active token context programmatically */
  public setTokens(tokens: AuthTokens | null) {
    this.tokens = tokens;
    if (this.onTokensChanged) {
      this.onTokensChanged(tokens);
    }
  }

  /** Fetch current token state */
  public getTokens(): AuthTokens | null {
    return this.tokens;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.tokens?.accessToken) {
      headers['Authorization'] = `Bearer ${this.tokens.accessToken}`;
    }
    return headers;
  }

  private subscribeTokenRefresh(cb: (token: string) => void) {
    this.refreshSubscribers.push(cb);
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((cb) => cb(token));
    this.refreshSubscribers = [];
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: Record<string, any> = {};
      try {
        errorData = await response.json() as any;
      } catch {
        errorData = { message: response.statusText };
      }
      throw {
        statusCode: response.status,
        ...errorData,
      };
    }

    if (response.status === 204) {
      return {} as T;
    }

    try {
      return await response.json() as T;
    } catch {
      return {} as T;
    }
  }

  /**
   * Safe fetch request wrapping headers mapping and automatic JWT token refresh.
   */
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      ...this.getHeaders(),
      ...(options.headers as any),
    };

    const response = await fetch(url, { ...options, headers });

    // Handle token expiry transparently
    if (response.status === 401 && this.tokens?.refreshToken) {
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        try {
          const newTokens = await this.auth.refresh(this.tokens.refreshToken);
          this.setTokens(newTokens);
          this.isRefreshing = false;
          this.onRefreshed(newTokens.accessToken);
        } catch (err) {
          this.isRefreshing = false;
          this.setTokens(null);
          throw err;
        }
      }

      // Suspend requests and await refresh resolution
      const retryPromise = new Promise<T>((resolve, reject) => {
        this.subscribeTokenRefresh(async (token) => {
          try {
            const retryHeaders = {
              ...this.getHeaders(),
              ...(options.headers as any),
              'Authorization': `Bearer ${token}`,
            };
            const retryRes = await fetch(url, { ...options, headers: retryHeaders });
            resolve(await this.handleResponse<T>(retryRes));
          } catch (e) {
            reject(e);
          }
        });
      });

      return retryPromise;
    }

    return this.handleResponse<T>(response);
  }

  /**
   * Custom SSE reader supporting native auth headers and ReadableStream callbacks.
   */
  public subscribeStream(
    path: string,
    callbacks: {
      onMessage: (data: string) => void;
      onError?: (error: any) => void;
      onClose?: () => void;
    }
  ): { unsubscribe: () => void } {
    let active = true;
    const controller = new AbortController();

    const connect = async () => {
      try {
        const url = `${this.baseUrl}${path}`;
        const headers = this.getHeaders();
        const response = await fetch(url, {
          headers,
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`SSE connection failed: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('ReadableStream body reader not accessible');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (active) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';

          for (const part of parts) {
            if (!active) break;
            const line = part.trim();
            if (line.startsWith('data:')) {
              const data = line.slice(5).trim();
              callbacks.onMessage(data);
            }
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        if (callbacks.onError) callbacks.onError(err);
      } finally {
        if (callbacks.onClose) callbacks.onClose();
      }
    };

    connect();

    return {
      unsubscribe: () => {
        active = false;
        controller.abort();
      }
    };
  }

  // ==========================================
  // Auth Module
  // ==========================================
  public auth = {
    signup: (dto: SignupPayload): Promise<AuthTokens> => {
      return this.request<AuthTokens>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    },

    login: (dto: LoginPayload): Promise<AuthTokens> => {
      return this.request<AuthTokens>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    },

    refresh: (refreshToken: string): Promise<AuthTokens> => {
      return this.request<AuthTokens>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    },

    logout: (): Promise<void> => {
      return this.request<void>('/auth/logout', {
        method: 'DELETE',
      });
    }
  };

  // ==========================================
  // Users Module
  // ==========================================
  public users = {
    getMe: (): Promise<User> => {
      return this.request<User>('/users/me');
    },

    updateMe: (dto: Partial<User>): Promise<User> => {
      return this.request<User>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(dto),
      });
    },

    getBusinessProfile: (): Promise<BusinessProfile> => {
      return this.request<BusinessProfile>('/users/me/business-profile');
    },

    upsertBusinessProfile: (dto: Partial<BusinessProfile>): Promise<BusinessProfile> => {
      return this.request<BusinessProfile>('/users/me/business-profile', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    },

    getCategories: (): Promise<any[]> => {
      return this.request<any[]>('/categories');
    }
  };

  // ==========================================
  // Sites Module
  // ==========================================
  public sites = {
    create: (config: any): Promise<SiteSchema> => {
      return this.request<SiteSchema>('/sites', {
        method: 'POST',
        body: JSON.stringify(config),
      });
    },

    list: (): Promise<SiteSchema[]> => {
      return this.request<SiteSchema[]>('/sites');
    },

    get: (id: string): Promise<SiteSchema> => {
      return this.request<SiteSchema>(`/sites/${id}`);
    },

    update: (id: string, config: any): Promise<SiteSchema> => {
      return this.request<SiteSchema>(`/sites/${id}`, {
        method: 'PUT',
        body: JSON.stringify(config),
      });
    },

    delete: (id: string): Promise<void> => {
      return this.request<void>(`/sites/${id}`, {
        method: 'DELETE',
      });
    },

    getBlocks: (id: string): Promise<Block[]> => {
      return this.request<Block[]>(`/sites/${id}/blocks`);
    },

    updateBlock: (id: string, blockId: string, content: any, version: number): Promise<Block> => {
      return this.request<Block>(`/sites/${id}/blocks/${blockId}`, {
        method: 'PUT',
        body: JSON.stringify({ content, version }),
      });
    },

    createVersion: (id: string, message: string): Promise<VersionSnapshot> => {
      return this.request<VersionSnapshot>(`/sites/${id}/versions`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
    },

    listVersions: (id: string): Promise<VersionSnapshot[]> => {
      return this.request<VersionSnapshot[]>(`/sites/${id}/versions`);
    },

    restoreVersion: (id: string, versionId: string): Promise<any> => {
      return this.request<any>(`/sites/${id}/versions/${versionId}/restore`, {
        method: 'POST',
      });
    },

    clone: (id: string): Promise<SiteSchema> => {
      return this.request<SiteSchema>(`/sites/${id}/clone`, {
        method: 'POST',
      });
    },

    export: (id: string): Promise<any> => {
      return this.request<any>(`/sites/${id}/export`, {
        method: 'POST',
      });
    },

    getABTests: (id: string): Promise<ABTest[]> => {
      return this.request<ABTest[]>(`/sites/${id}/ab-tests`);
    },

    createABTest: (id: string, config: any): Promise<ABTest> => {
      return this.request<ABTest>(`/sites/${id}/ab-tests`, {
        method: 'POST',
        body: JSON.stringify({ config }),
      });
    },

    updateABTest: (id: string, testId: string, config: any): Promise<ABTest> => {
      return this.request<ABTest>(`/sites/${id}/ab-tests/${testId}`, {
        method: 'PUT',
        body: JSON.stringify({ config }),
      });
    },

    listTemplates: (): Promise<Template[]> => {
      console.warn('Backend Bug: GET /sites/templates/all routing conflicts with /sites/:id on Express. Expect route error.');
      return this.request<Template[]>('/sites/templates/all');
    },

    applyTemplate: (id: string, templateId: string): Promise<any> => {
      console.warn('Backend Warning: apply-template is an unimplemented backend stub.');
      return this.request<any>(`/sites/${id}/apply-template`, {
        method: 'POST',
        body: JSON.stringify({ templateId }),
      });
    },

    uploadImage: (id: string, fileData: string): Promise<any> => {
      console.warn('Backend Warning: upload-image requires S3 setup and will throw a 500 error.');
      return this.request<any>(`/sites/${id}/upload-image`, {
        method: 'POST',
        body: JSON.stringify({ fileData }),
      });
    },

    createRecord: (id: string, schemaType: string, data: any): Promise<DynamicRecord> => {
      return this.request<DynamicRecord>(`/sites/${id}/records/${schemaType}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    findRecords: (id: string, schemaType: string): Promise<DynamicRecord[]> => {
      return this.request<DynamicRecord[]>(`/sites/${id}/records/${schemaType}`);
    },

    updateRecord: (id: string, schemaType: string, recordId: string, data: any): Promise<DynamicRecord> => {
      return this.request<DynamicRecord>(`/sites/${id}/records/${schemaType}/${recordId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    deleteRecord: (id: string, schemaType: string, recordId: string): Promise<void> => {
      return this.request<void>(`/sites/${id}/records/${schemaType}/${recordId}`, {
        method: 'DELETE',
      });
    }
  };

  // ==========================================
  // Commerce Module
  // ==========================================
  public commerce = {
    createProduct: (data: any): Promise<Product> => {
      return this.request<Product>('/commerce/products', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    listProducts: (siteId: string): Promise<Product[]> => {
      return this.request<Product[]>(`/commerce/products/site/${siteId}`);
    },

    createBooking: (data: any): Promise<Booking> => {
      return this.request<Booking>('/commerce/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    listOrders: (siteId: string): Promise<Order[]> => {
      return this.request<Order[]>(`/commerce/orders/site/${siteId}`);
    },

    updateOrderStatus: (id: string, status: string): Promise<Order> => {
      return this.request<Order>(`/commerce/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    },

    syncInventory: (productId: string, quantity: number): Promise<Inventory> => {
      return this.request<Inventory>('/commerce/inventory/sync', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      });
    },

    checkout: (siteId: string, amount: number, email: string, subaccountCode?: string): Promise<{ url: string }> => {
      return this.request<{ url: string }>('/commerce/checkout', {
        method: 'POST',
        body: JSON.stringify({ siteId, amount, email, subaccountCode }),
      });
    }
  };

  // ==========================================
  // AI Module
  // ==========================================
  public ai = {
    prompt: (prompt: string): Promise<string> => {
      return this.request<string>('/ai/prompt', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });
    },

    generate: (siteId: string, prompt: string): Promise<{ status: 'queued'; jobId: string }> => {
      return this.request<{ status: 'queued'; jobId: string }>('/ai/generate', {
        method: 'POST',
        body: JSON.stringify({ siteId, prompt }),
      });
    },

    getGenerateStatus: (jobId: string): Promise<{ status: string; result?: any }> => {
      return this.request<{ status: string; result?: any }>(`/ai/generate/${jobId}`);
    },

    suggestDomains: (businessName: string, industry?: string): Promise<string[]> => {
      return this.request<string[]>('/ai/suggest-domains', {
        method: 'POST',
        body: JSON.stringify({ businessName, industry }),
      });
    },

    prefill: (businessProfile: any): Promise<any> => {
      return this.request<any>('/ai/prefill', {
        method: 'POST',
        body: JSON.stringify({ businessProfile }),
      });
    },

    assistCopy: (text: string, tone?: string, instruction?: string): Promise<{ text: string }> => {
      return this.request<{ text: string }>('/ai/assist-copy', {
        method: 'POST',
        body: JSON.stringify({ text, tone, instruction }),
      });
    },

    generateImage: (prompt: string): Promise<{ url: string; prompt: string }> => {
      return this.request<{ url: string; prompt: string }>('/ai/generate-image', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });
    },

    generateLegal: (businessName: string, contactEmail: string): Promise<{ privacy: string; terms: string }> => {
      return this.request<{ privacy: string; terms: string }>('/ai/generate-legal', {
        method: 'POST',
        body: JSON.stringify({ businessName, contactEmail }),
      });
    },

    streamPrompt: (sessionId: string, prompt: string): Promise<{ sessionId: string; status: 'streaming' }> => {
      return this.request<{ sessionId: string; status: 'streaming' }>('/ai/stream', {
        method: 'POST',
        body: JSON.stringify({ sessionId, prompt }),
      });
    },

    getQuota: (): Promise<{ used: number; limit: number; remaining: number }> => {
      return this.request<{ used: number; limit: number; remaining: number }>('/ai/quota');
    },

    subscribeAiStream: (callbacks: {
      onMessage: (msg: string) => void;
      onError?: (e: any) => void;
      onClose?: () => void;
    }) => {
      return this.subscribeStream('/ai/stream', callbacks);
    }
  };

  // ==========================================
  // Analytics Module
  // ==========================================
  public analytics = {
    getDashboard: (siteId: string): Promise<any> => {
      console.warn('Backend Bug: GET /analytics/dashboard/site/:siteId uses a protected client method send() and is inaccessible.');
      return this.request<any>(`/analytics/dashboard/site/${siteId}`);
    }
  };

  // ==========================================
  // Deploy Module
  // ==========================================
  public deploy = {
    trigger: (siteId: string, versionId?: string): Promise<any> => {
      console.warn('Backend Bug: POST /deploy/trigger calls non-existent client method triggerDeployment.');
      return this.request<any>('/deploy/trigger', {
        method: 'POST',
        body: JSON.stringify({ siteId, versionId }),
      });
    },

    getStatus: (siteId: string): Promise<any> => {
      console.warn('Backend Bug: GET /deploy/status/:siteId calls non-existent client method getDeploymentStatus.');
      return this.request<any>(`/deploy/status/${siteId}`);
    },

    subscribeDeployStream: (jobId: string, callbacks: {
      onMessage: (msg: string) => void;
      onError?: (e: any) => void;
      onClose?: () => void;
    }) => {
      return this.subscribeStream(`/deploy/${jobId}/stream`, callbacks);
    }
  };

  // ==========================================
  // Domains Module
  // ==========================================
  public domains = {
    search: (query: string): Promise<any> => {
      console.warn('Backend Bug: POST /domains/search calls non-existent client method search.');
      return this.request<any>('/domains/search', {
        method: 'POST',
        body: JSON.stringify({ query }),
      });
    },

    register: (data: any): Promise<any> => {
      console.warn('Backend Bug: POST /domains/register calls non-existent client method register.');
      return this.request<any>('/domains/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    listDomains: (siteId: string): Promise<any> => {
      console.warn('Backend Bug: GET /domains/site/:siteId calls non-existent client method listDomains.');
      return this.request<any>(`/domains/site/${siteId}`);
    }
  };

  // ==========================================
  // Notifications Module
  // ==========================================
  public notifications = {
    subscribeNotifications: (callbacks: {
      onMessage: (msg: string) => void;
      onError?: (e: any) => void;
      onClose?: () => void;
    }) => {
      return this.subscribeStream('/notifications/stream', callbacks);
    }
  };

  // ==========================================
  // Owner (Admin Panel) Module
  // ==========================================
  public owner = {
    getDashboard: (): Promise<any> => {
      console.warn('Backend Bug: /owner routes fail compilation due to missing shared library guards.');
      return this.request<any>('/owner/dashboard');
    },

    listUsers: (limit = 50, offset = 0): Promise<User[]> => {
      console.warn('Backend Bug: /owner routes fail compilation due to missing shared library guards.');
      return this.request<User[]>(`/owner/users?limit=${limit}&offset=${offset}`);
    },

    suspendUser: (id: string): Promise<void> => {
      console.warn('Backend Bug: /owner routes fail compilation due to missing shared library guards.');
      return this.request<void>(`/owner/users/${id}/suspend`, {
        method: 'PUT',
      });
    },

    unsuspendUser: (id: string): Promise<void> => {
      console.warn('Backend Bug: /owner routes fail compilation due to missing shared library guards.');
      return this.request<void>(`/owner/users/${id}/unsuspend`, {
        method: 'PUT',
      });
    },

    impersonateUser: (id: string): Promise<AuthTokens> => {
      console.warn('Backend Bug: /owner routes fail compilation due to missing shared library guards.');
      return this.request<AuthTokens>(`/owner/users/${id}/impersonate`, {
        method: 'POST',
      });
    },

    listAllSites: (limit = 50, offset = 0): Promise<SiteSchema[]> => {
      console.warn('Backend Bug: /owner routes fail compilation due to missing shared library guards.');
      return this.request<SiteSchema[]>(`/owner/sites?limit=${limit}&offset=${offset}`);
    },

    setKillSwitch: (active: boolean): Promise<{ active: boolean }> => {
      console.warn('Backend Bug: /owner routes fail compilation due to missing shared library guards.');
      return this.request<{ active: boolean }>('/owner/kill-switch', {
        method: 'PUT',
        body: JSON.stringify({ active }),
      });
    }
  };
}
