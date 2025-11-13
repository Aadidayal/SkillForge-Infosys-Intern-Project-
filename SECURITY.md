# Environment Setup Guide

## 🔐 Security Configuration

This project uses environment-based configuration to protect sensitive information.

### Local Development Setup

1. **Copy your development properties:**
   ```bash
   cp application-dev.properties src/main/resources/application-dev.properties
   ```

2. **The application will automatically use the dev profile** (configured in main application.properties)

3. **Your local credentials are safely stored in `application-dev.properties`** which is excluded from Git

### Production Deployment

1. **Use the production template:**
   ```bash
   cp application-prod.properties.template application-prod.properties
   ```

2. **Replace all template values with actual production credentials**

3. **Set environment variables or use external configuration**

### Environment Variables (Alternative)

You can also use environment variables directly:

```bash
# Database
export DB_USERNAME=your_username
export DB_PASSWORD=your_password

# JWT
export JWT_SECRET=your_jwt_secret

# Cloudinary  
export CLOUDINARY_CLOUD_NAME=your_cloud_name
export CLOUDINARY_API_KEY=your_api_key
export CLOUDINARY_API_SECRET=your_api_secret
```

## 🚨 Important Security Notes

- **NEVER commit** `application-dev.properties` or `application-prod.properties`
- **Always use strong passwords** and secrets in production
- **Rotate credentials regularly** especially JWT secrets
- **Use different databases** for development and production

## ✅ Files Safe for Git

- `src/main/resources/application.properties` (uses environment variables)
- `application-prod.properties.template` (template only, no real credentials)
- All source code files
- Frontend files (excluding .env files)

## ❌ Files to NEVER Commit

- `application-dev.properties`
- `application-prod.properties`
- Any `.env` files
- `add_users_sql.sql`
- Any files with actual credentials