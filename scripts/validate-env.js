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
    // Get all required variable names for reference
    const allRequiredVars = Object.entries(REQUIRED_ENV_VARS)
      .filter(([_, config]) => config.required)
      .map(([name]) => name);
    
    const errorMessages = [
      '╔════════════════════════════════════════════════════════════════╗',
      '║  🚨 ENVIRONMENT CONFIGURATION ERROR                           ║',
      '║                                                                ║',
      '║  Missing or invalid environment variables detected.            ║',
      '║                                                                ║',
    ];
    
    if (result.missingVariables.length > 0) {
      errorMessages.push('║  Missing required variables:');
      result.missingVariables.forEach(v => {
        errorMessages.push(`║    ❌ ${v}`);
      });
      errorMessages.push('║                                                                ║');
    }
    
    if (result.errors.length > 0) {
      errorMessages.push('║  Invalid variable values:');
      result.errors.forEach(e => {
        errorMessages.push(`║    ❌ ${e.variable}: ${e.message}`);
      });
      errorMessages.push('║                                                                ║');
    }
    
    errorMessages.push(
      '║  📋 ALL REQUIRED VARIABLES:                                   ║',
      '║                                                                ║'
    );
    allRequiredVars.forEach(v => {
      const isMissing = result.missingVariables.includes(v);
      const marker = isMissing ? '❌' : '✅';
      errorMessages.push(`║    ${marker} ${v}`);
    });
    
    errorMessages.push(
      '║                                                                ║',
      '║  🔧 SOLUTION FOR CLOUDFLARE PAGES:                          ║',
      '║                                                                ║',
      '║  1. Go to Cloudflare Dashboard                                ║',
      '║  2. Navigate to: Pages > Your Project > Settings              ║',
      '║  3. Click on "Environment Variables"                          ║',
      '║  4. Add all required variables listed above                   ║',
      '║  5. Make sure to set them for "Production" environment        ║',
      '║  6. Redeploy your site                                        ║',
      '║                                                                ║',
      '╚════════════════════════════════════════════════════════════════╝',
      '',
      'For local development, create a .env.local file with these variables.'
    );
    
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

// Read environment variables directly from process.env
// This works with Cloudflare Pages where env vars are set via the dashboard
// and also works locally with .env.local (Next.js automatically loads it)
const envVars = process.env;

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
