// Core install utilities for MCP servers
export * from './auth.js';

export * from './validators.js';

export * from './clients.js';

export * from './handler.js';

// Re-export commonly used types and utilities
export type {
  AuthValidator,
  AuthValidationResult,
  OAuthValidatorConfig,
  PATValidatorConfig,
  NoAuthValidatorConfig
} from './auth.js';

export type {
  MCPClientConfig,
  InstallOptions
} from './clients.js';

export type {
  InstallConfig,
  InstallResult
} from './handler.js';

export {
  createOAuthValidator,
  createPATValidator,
  createNoAuthValidator
} from './validators.js';

export {
  createInstallHandler,
  createInstallCommand
} from './handler.js';

export {
  MCP_CLIENTS,
  getSupportedClients,
  getClientConfig,
  validateClient,
  installMCPServer,
  showInstallationInstructions
} from './clients.js';