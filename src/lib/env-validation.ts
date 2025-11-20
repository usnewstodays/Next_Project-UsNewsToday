/**
 * Environment Variable Validation & Security
 * This module ensures all required environment variables are set and valid
 * Prevents the application from running without proper configuration
 */

// Define required environment variables and their validation rules
export const REQUIRED_ENV_VARS = {
  // Critical: Must be defined and valid URL
  WPGRAPHQL_ENDPOINT: {
    required: true,
    validate: (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    errorMessage: 'Must be a valid URL to WordPress GraphQL endpoint',
    description: 'WordPress GraphQL API endpoint URL',
  },
  
  // Critical: Must be defined for security
  REVALIDATE_SECRET: {
    required: true,
    validate: (value: string) => value.length >= 8,
    errorMessage: 'Must be at least 8 characters long',
    description: 'Secret key for ISR/on-demand revalidation',
  },
  
  // Critical: Must be defined and valid URL
  SITE_URL: {
    required: true,
    validate: (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    errorMessage: 'Must be a valid URL',
    description: 'Production site URL',
  },
  
  // Required: Site metadata
  SITE_TITLE: {
    required: true,
    validate: (value: string) => value.length > 0,
    errorMessage: 'Cannot be empty',
    description: 'Website title',
  },
  
  SITE_DESCRIPTION: {
    required: true,
    validate: (value: string) => value.length > 0,
    errorMessage: 'Cannot be empty',
    description: 'Website description',
  },
  
  SITE_NAME: {
    required: true,
    validate: (value: string) => value.length > 0,
    errorMessage: 'Cannot be empty',
    description: 'Website name',
  },
  
  SITE_COPYRIGHT: {
    required: true,
    validate: (value: string) => value.length > 0,
    errorMessage: 'Cannot be empty',
    description: 'Copyright notice',
  },
  
  // Public: Can be exposed (GA ID is public by nature)
  PUBLIC_GA_ID: {
    required: false,
    validate: (value: string) => /^G-[A-Z0-9]+$/.test(value),
    errorMessage: 'Must be in format G-XXXXXXXXXX',
    description: 'Google Analytics 4 ID',
  },
  
  PUBLIC_GA_DEBUG: {
    required: false,
    validate: (value: string) => ['true', 'false'].includes(value.toLowerCase()),
    errorMessage: 'Must be "true" or "false"',
    description: 'Enable GA debug logging',
  },
};

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    variable: string;
    message: string;
  }>;
  warnings: string[];
  missingVariables: string[];
}

/**
 * Validate all required environment variables
 * @param vars - Environment variables object (typically process.env)
 * @returns ValidationResult with detailed error information
 */
export function validateEnvVars(vars: Record<string, string | undefined>): ValidationResult {
  const errors: Array<{ variable: string; message: string }> = [];
  const warnings: string[] = [];
  const missingVariables: string[] = [];

  for (const [varName, config] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = vars[varName];

    // Check if variable is set
    if (!value || value.trim() === '') {
      if (config.required) {
        errors.push({
          variable: varName,
          message: `Required environment variable missing: ${varName} (${config.description})`,
        });
        missingVariables.push(varName);
      } else {
        warnings.push(`Optional variable not set: ${varName}`);
      }
      continue;
    }

    // Validate variable format/value
    if (!config.validate(value)) {
      errors.push({
        variable: varName,
        message: `Invalid value for ${varName}: ${config.errorMessage}`,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    missingVariables,
  };
}

/**
 * Throw error if required variables are missing
 * Should be called during build process
 */
export function validateEnvVarsOrThrow(vars: Record<string, string | undefined>): void {
  const result = validateEnvVars(vars);

  if (!result.isValid) {
    const errorDetails = result.errors
      .map((e) => `  ❌ ${e.variable}: ${e.message}`)
      .join('\n');

    const message = `
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║  🚨 ENVIRONMENT CONFIGURATION ERROR                           ║
║                                                                ║
║  The following required environment variables are missing     ║
║  or invalid. The build/deployment will NOT proceed until      ║
║  all issues are resolved.                                     ║
║                                                                ║
${result.errors.map((e) => `║  ❌ ${e.variable}: ${e.message}`).join('\n║\n')}
║                                                                ║
║  SOLUTION:                                                    ║
║  1. Copy .env.example to .env.local                           ║
║  2. Fill in all required values                               ║
║  3. Never commit .env.local to version control                ║
║  4. Try building again                                        ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`;

    throw new Error(message);
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment Warnings:');
    result.warnings.forEach((w) => console.warn(`  ⚠️  ${w}`));
  }
}

/**
 * Get safe environment object that filters out sensitive data
 * Only returns variables that are safe to expose
 */
export function getSafeEnvVars(vars: Record<string, string | undefined>): Record<string, string> {
  const safeVars: Record<string, string> = {};
  const publicPrefix = 'PUBLIC_';

  // Only expose variables that start with PUBLIC_ or are explicitly marked as safe
  for (const [key, value] of Object.entries(vars)) {
    if (key.startsWith(publicPrefix) && value) {
      safeVars[key] = value;
    }
  }

  // Add safe metadata variables
  if (vars.SITE_URL) safeVars.SITE_URL = vars.SITE_URL;
  if (vars.SITE_TITLE) safeVars.SITE_TITLE = vars.SITE_TITLE;
  if (vars.SITE_DESCRIPTION) safeVars.SITE_DESCRIPTION = vars.SITE_DESCRIPTION;
  if (vars.SITE_NAME) safeVars.SITE_NAME = vars.SITE_NAME;
  if (vars.SITE_COPYRIGHT) safeVars.SITE_COPYRIGHT = vars.SITE_COPYRIGHT;

  return safeVars;
}

/**
 * Check if running in production environment
 */
export function isProduction(): boolean {
  const env = process.env.NODE_ENV as string | undefined;
  return env === 'production' || env === 'prod';
}

/**
 * Log environment validation status (safe for logs)
 */
export function logEnvStatus(vars: Record<string, string | undefined>): void {
  const result = validateEnvVars(vars);
  
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Environment Configuration Status:`);
  
  if (result.isValid) {
    console.log('✅ All required environment variables are properly configured');
  } else {
    console.error('❌ Environment configuration incomplete');
    result.errors.forEach((e) => {
      console.error(`  - ${e.variable}: ${e.message}`);
    });
  }
  
  if (result.warnings.length > 0) {
    console.warn('⚠️  Warnings:');
    result.warnings.forEach((w) => console.warn(`  - ${w}`));
  }
}

export default {
  validateEnvVars,
  validateEnvVarsOrThrow,
  getSafeEnvVars,
  isProduction,
  logEnvStatus,
};
