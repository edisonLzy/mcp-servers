#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import { FigmaClient } from './figmaClient.js';
import { ConfigStore } from './auth/configStore.js';
import type { FigmaConfig } from './auth/types.js';

const program = new Command();
const client = new FigmaClient();

program
  .name('figma-mcp')
  .description('CLI for Figma MCP Server')
  .version('0.1.0');

program
  .command('login')
  .description('Set up Figma API authentication')
  .action(async () => {
    try {
      console.log('Welcome to Figma MCP Server setup!');
      console.log('To get your Figma Personal Access Token:');
      console.log('1. Go to https://www.figma.com/developers/api#access-tokens');
      console.log('2. Click "Generate new token"');
      console.log('3. Copy your personal access token\n');

      const { token } = await inquirer.prompt([
        {
          type: 'password',
          name: 'token',
          message: 'Enter your Figma Personal Access Token:',
          validate: (input: string) => {
            if (!input.trim()) {
              return 'Token is required';
            }
            if (!input.startsWith('figd_')) {
              return 'Figma tokens should start with "figd_"';
            }
            return true;
          },
        },
      ]);

      const config: FigmaConfig = {
        personalAccessToken: token.trim(),
      };

      await client.setConfig(config);
      
      // Test the token
      try {
        const user = await client.getCurrentUser();
        console.log(`\n✅ Authentication successful!`);
        console.log(`Hello, ${user.handle} (${user.email})`);
      } catch (error) {
        console.log(`\n❌ Authentication failed. Please check your token.`);
        await client.clearConfig();
        process.exit(1);
      }
    } catch (error) {
      console.error('Error during login:', error);
      process.exit(1);
    }
  });

program
  .command('logout')
  .description('Clear stored Figma credentials')
  .action(async () => {
    try {
      await client.clearConfig();
      console.log('✅ Figma credentials cleared successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      process.exit(1);
    }
  });

program
  .command('whoami')
  .description('Show current Figma user information')
  .action(async () => {
    try {
      const user = await client.getCurrentUser();
      console.log(`User: ${user.handle} (${user.email})`);
      console.log(`ID: ${user.id}`);
      console.log(`Avatar: ${user.img_url}`);
    } catch (error) {
      console.error('Error getting user info:', error);
      process.exit(1);
    }
  });

program
  .command('install')
  .description('Install Figma MCP server to MCP client')
  .option('--client <client>', 'MCP client to install to (cursor, claude-desktop)', 'cursor')
  .option('--global', 'Install globally (system-wide)', false)
  .action(async (options) => {
    try {
      if (!client.isConfigured()) {
        console.log('❌ Figma not configured. Please run "figma-mcp login" first.');
        process.exit(1);
      }

      const configStore = ConfigStore.create();
      const config = await configStore.getConfig();
      
      if (!config) {
        console.log('❌ No configuration found. Please run "figma-mcp login" first.');
        process.exit(1);
      }

      // For now, just show installation instructions
      console.log(`\n📋 Installation instructions for ${options.client}:`);
      
      if (options.client === 'cursor') {
        console.log('\nAdd the following to your Cursor MCP configuration:');
        console.log(JSON.stringify({
          "mcpServers": {
            "figma": {
              "command": "tsx",
              "args": [`${process.cwd()}/src/index.ts`],
              "env": {
                "FIGMA_PAT": config.personalAccessToken
              }
            }
          }
        }, null, 2));
      } else if (options.client === 'claude-desktop') {
        console.log('\nAdd the following to your Claude Desktop configuration:');
        console.log(JSON.stringify({
          "mcpServers": {
            "figma": {
              "command": "tsx",
              "args": [`${process.cwd()}/src/index.ts`],
              "env": {
                "FIGMA_PAT": config.personalAccessToken
              }
            }
          }
        }, null, 2));
      }
      
      console.log('\nMake sure tsx is installed: npm install -g tsx');
    } catch (error) {
      console.error('Error during install:', error);
      process.exit(1);
    }
  });

program.parse();