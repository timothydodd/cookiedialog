#!/bin/bash

# Azure Storage Account Deployment Script for CookieDialog
# This script builds and deploys the library and documentation to Azure Storage

set -e

echo "🚀 Starting CookieDialog deployment to Azure Storage..."

# Configuration - Update these with your Azure details
STORAGE_ACCOUNT="cookiedialogstore"
RESOURCE_GROUP="cookiedialog-rg"
CDN_PROFILE="cookiedialog-cdn"
CDN_ENDPOINT="cookiedialog"
CUSTOM_DOMAIN="cookiedialog.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists az; then
    echo -e "${RED}Error: Azure CLI is not installed${NC}"
    echo "Install it from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

# Login to Azure (if not already logged in)
echo "🔐 Checking Azure login status..."
if ! az account show >/dev/null 2>&1; then
    echo "Please login to Azure:"
    az login
fi

# Create resource group if it doesn't exist
echo "📦 Creating resource group if needed..."
az group create --name $RESOURCE_GROUP --location "East US" 2>/dev/null || true

# Create storage account if it doesn't exist
echo "💾 Creating storage account if needed..."
if ! az storage account show --name $STORAGE_ACCOUNT --resource-group $RESOURCE_GROUP >/dev/null 2>&1; then
    az storage account create \
        --name $STORAGE_ACCOUNT \
        --resource-group $RESOURCE_GROUP \
        --location "East US" \
        --sku Standard_LRS \
        --kind StorageV2
fi

# Enable static website hosting
echo "🌐 Enabling static website hosting..."
az storage blob service-properties update \
    --account-name $STORAGE_ACCOUNT \
    --static-website \
    --404-document 404.html \
    --index-document index.html

# Get storage account key
STORAGE_KEY=$(az storage account keys list \
    --resource-group $RESOURCE_GROUP \
    --account-name $STORAGE_ACCOUNT \
    --query '[0].value' \
    --output tsv)

# Build the library
echo -e "${YELLOW}🔨 Building CookieDialog library...${NC}"
npm install
npm run build

# Build documentation
echo -e "${YELLOW}📚 Building documentation site...${NC}"
cd docs
npm install
npm run build
cd ..

# Upload library files to CDN container
echo "📤 Uploading library files to CDN..."
az storage blob upload-batch \
    --account-name $STORAGE_ACCOUNT \
    --account-key $STORAGE_KEY \
    --destination '$web/cdn' \
    --source dist \
    --pattern "*" \
    --overwrite

# Upload documentation files
echo "📤 Uploading documentation site..."
az storage blob upload-batch \
    --account-name $STORAGE_ACCOUNT \
    --account-key $STORAGE_KEY \
    --destination '$web' \
    --source docs/dist \
    --pattern "*" \
    --overwrite

# Upload demo files
echo "📤 Uploading demo files..."
az storage blob upload-batch \
    --account-name $STORAGE_ACCOUNT \
    --account-key $STORAGE_KEY \
    --destination '$web/demo' \
    --source demo \
    --pattern "*" \
    --overwrite

# Create CDN profile if it doesn't exist
echo "🚀 Setting up Azure CDN..."
if ! az cdn profile show --name $CDN_PROFILE --resource-group $RESOURCE_GROUP >/dev/null 2>&1; then
    az cdn profile create \
        --name $CDN_PROFILE \
        --resource-group $RESOURCE_GROUP \
        --sku Standard_Microsoft
fi

# Get the primary web endpoint
WEB_ENDPOINT=$(az storage account show \
    --name $STORAGE_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --query "primaryEndpoints.web" \
    --output tsv | sed 's/https:\/\///' | sed 's/\///')

# Create CDN endpoint if it doesn't exist
if ! az cdn endpoint show --name $CDN_ENDPOINT --profile-name $CDN_PROFILE --resource-group $RESOURCE_GROUP >/dev/null 2>&1; then
    az cdn endpoint create \
        --name $CDN_ENDPOINT \
        --profile-name $CDN_PROFILE \
        --resource-group $RESOURCE_GROUP \
        --origin $WEB_ENDPOINT \
        --origin-host-header $WEB_ENDPOINT \
        --enable-compression
fi

# Configure CDN rules for proper content types
echo "⚙️ Configuring CDN rules..."

# Add caching rules
az cdn endpoint rule add \
    --name CacheControl \
    --resource-group $RESOURCE_GROUP \
    --profile-name $CDN_PROFILE \
    --endpoint-name $CDN_ENDPOINT \
    --order 1 \
    --rule-name "CacheStaticAssets" \
    --match-variable UrlFileExtension \
    --operator Equal \
    --match-value "js" "css" "png" "jpg" "svg" "woff" "woff2" \
    --action-name CacheExpiration \
    --cache-behavior SetIfMissing \
    --cache-duration "30.00:00:00" 2>/dev/null || true

# Purge CDN cache
echo "🧹 Purging CDN cache..."
az cdn endpoint purge \
    --name $CDN_ENDPOINT \
    --profile-name $CDN_PROFILE \
    --resource-group $RESOURCE_GROUP \
    --content-paths "/*"

# Get endpoints
STORAGE_URL="https://${STORAGE_ACCOUNT}.z13.web.core.windows.net"
CDN_URL="https://${CDN_ENDPOINT}.azureedge.net"

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "📌 Your sites are available at:"
echo "   Storage URL: $STORAGE_URL"
echo "   CDN URL: $CDN_URL"
echo ""
echo "📦 CDN URLs for library:"
echo "   CSS: ${CDN_URL}/cdn/cookiedialog.min.css"
echo "   JS: ${CDN_URL}/cdn/cookiedialog.min.js"
echo ""
echo "🌐 Demo page: ${CDN_URL}/demo/"
echo ""
echo "📝 To configure custom domain:"
echo "   az cdn custom-domain create \\"
echo "     --endpoint-name $CDN_ENDPOINT \\"
echo "     --profile-name $CDN_PROFILE \\"
echo "     --resource-group $RESOURCE_GROUP \\"
echo "     --name cookiedialog-custom \\"
echo "     --hostname $CUSTOM_DOMAIN"
echo ""
echo "🔒 Don't forget to enable HTTPS on your custom domain!"