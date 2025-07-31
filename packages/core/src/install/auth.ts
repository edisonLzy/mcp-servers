export interface AuthValidator {
  /**
   * Check if authentication is configured and valid
   */
  validate(): Promise<boolean>;
  
  /**
   * Get user-friendly authentication status message
   */
  getStatusMessage(): Promise<string>;
  
  /**
   * Prompt user to configure authentication if needed
   */
  promptConfiguration(): Promise<void>;
  
  /**
   * Get authentication configuration for MCP server
   */
  getAuthConfig(): Promise<Record<string, any>>;
}

export interface AuthValidationResult {
  isValid: boolean;
  message: string;
  config?: Record<string, any>;
}

export interface OAuthValidatorConfig {
  tokenStore: any;
  checkExistingCredentials: (tokenStore: any) => Promise<boolean>;
  loginCommand: () => Promise<void>;
}

export interface PATValidatorConfig {
  configStore: any;
  tokenName: string;
  validationEndpoint?: string;
}

export interface NoAuthValidatorConfig {
  serverName: string;
}