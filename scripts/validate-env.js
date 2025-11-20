/**
 * Simplified Environment Validation Script
 * This is a JavaScript version of the TypeScript validation for build-time use
 */

const REQUIRED_ENV_VARS = {
  // Critical: Must be defined and valid URL
  WPGRAPHQL_ENDPOINT: {
    required: true,
    validate: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    errorMessage: 'Must be a valid URL to WordPress GraphQL endpoint',
  },
  
  // Critical: Must be defined for security
  REVALIDATE_SECRET: {
    required: true,
    validate: (value) => value && value.length >= 8,
    errorMessage: 'Must be at least 8 characters long',
  },
  
  // Critical: Must be defined and valid URL
  SITE_URL: {
    required: true,
    validate: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    errorMessage: 'Must be a valid URL',
  },
  
  // Required: Site metadata
  SITE_TITLE: {
    required: true,
    validate: (value) => value && value.length > 0,
    errorMessage: 'Cannot be empty',
  },
  
  SITE_DESCRIPTION: {
    required: true,
    validate: (value) => value && value.length > 0,
    errorMessage: 'Cannot be empty',
  },
  
  SITE_NAME: {
    required: true,
    validate: (value) => value && value.length > 0,
    errorMessage: 'Cannot be empty',
  },
  
  SITE_COPYRIGHT: {
    required: true,
    validate: (value) => value && value.length > 0,
    errorMessage: 'Cannot be empty',
  },
  
  // Public: Can be exposed (GA ID is public by nature)
  NEXT_PUBLIC_GA_MEASUREMENT_ID: {
    required: false,
    validate: (value) => !value || /^G-[A-Z0-9]+$/.test(value),
    errorMessage: 'Must be in format G-XXXXXXXXXX',
  },
  
  PUBLIC_GA_DEBUG: {
    required: false,
    validate: (value) => !value || ['true', 'false'].includes(value),
    errorMessage: 'Must be "true" or "false"',
  },
};

// Main validation function
function validateEnvVars(vars) {
  const errors = [];
  const warnings = [];
  const missing = [];
  
  for (const [varName, config] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = vars[varName];
    
    // Check if required variable is missing
    if (config.required && (value === undefined || value === '')) {
      missing.push(varName);
      continue;
    }
    
    // Skip validation for optional empty values
    if (!config.required && (!value || value === '')) {
      continue;
    }
    
    // Validate value if validator exists
    if (config.validate && !config.validate(value)) {
      errors.push({
        variable: varName,
        message: config.errorMessage || `Invalid value for ${varName}`,
      });
    }
  }
  
  return {
    isValid: errors.length === 0 && missing.length === 0,
    errors,
    warnings,
    missingVariables: missing,
  };
}

// Throw error if validation fails
function validateEnvVarsOrThrow(vars) {
  const result = validateEnvVars(vars);
  
  if (!result.isValid) {
    const errorMessages = [
      'Environment validation failed:',
      ...result.missingVariables.map(v => `- Missing required variable: ${v}`),
      ...result.errors.map(e => `- ${e.variable}: ${e.message}`),
    ];
    
    throw new Error(errorMessages.join('\n'));
  }
}

// Log environment status
function logEnvStatus(vars) {
  const result = validateEnvVars(vars);
  
  if (result.isValid) {
    console.log('✅ Environment validation passed');
  } else {
    console.warn('⚠️  Environment validation issues found:');
    
    if (result.missingVariables.length > 0) {
      console.warn('Missing required variables:');
      result.missingVariables.forEach(v => console.warn(`  - ${v}`));
    }
    
    if (result.errors.length > 0) {
      console.warn('Invalid variable values:');
      result.errors.forEach(e => console.warn(`  - ${e.variable}: ${e.message}`));
    }
  }
}

// Load .env.local file
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found');
  process.exit(1);
}

// Load environment variables from .env.local
const envConfig = dotenv.parse(fs.readFileSync(envPath));

// Merge with existing process.env
const envVars = { ...process.env, ...envConfig };

// Run validation
try {
  logEnvStatus(envVars);
  validateEnvVarsOrThrow(envVars);
  console.log('✅ Environment validation passed');
  process.exit(0);
} catch (error) {
  console.error('❌ Environment validation failed:');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
