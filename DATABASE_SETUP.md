# 🗄️ Database Setup Guide for SkillForge

## Prerequisites
- ✅ SQL Workbench installed
- ⚠️ MySQL Server (needs to be installed)

## Step-by-Step Setup

### 1. Install MySQL Server (if not already done)
1. Download from: https://dev.mysql.com/downloads/mysql/
2. Install with default settings
3. **Remember your root password!**

### 2. Connect using SQL Workbench
1. Open **SQL Workbench**
2. Create new connection:
   - **Connection Name:** SkillForge
   - **Hostname:** `localhost`
   - **Port:** `3306`
   - **Username:** `root`
   - **Password:** [Your MySQL root password]
3. Click **Test Connection** → Should show "Successfully connected"
4. Click **OK**

### 3. Create Database and User
Copy and run this SQL script in SQL Workbench:

```sql
-- Create the database
CREATE DATABASE IF NOT EXISTS skillforge_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Create a dedicated user
CREATE USER IF NOT EXISTS 'skillforge_user'@'localhost' IDENTIFIED BY 'skillforge123';

-- Grant privileges
GRANT ALL PRIVILEGES ON skillforge_db.* TO 'skillforge_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Verify setup
USE skillforge_db;
SELECT 'SkillForge database is ready!' AS Status;
```

### 4. Application Configuration
Your `application.properties` is already configured:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/skillforge_db?useSSL=false&serverTimezone=UTC&createDatabaseIfNotExist=true
spring.datasource.username=skillforge_user
spring.datasource.password=skillforge123
```

### 5. Run the Application
```bash
cd SkillForge
./mvnw spring-boot:run
```

## 🔍 Verify Database Connection

After starting the application, you should see in the logs:
- `Created database table: users`
- `Default admin user created: admin@skillforge.com / admin123`
- `Default instructor user created: instructor@skillforge.com / instructor123`
- `Default student user created: student@skillforge.com / student123`

## 📊 View Data in SQL Workbench

After the app runs, you can check the data:

```sql
USE skillforge_db;

-- Show all tables
SHOW TABLES;

-- View users
SELECT id, email, first_name, last_name, role, enabled, created_at 
FROM users;

-- Check specific user
SELECT * FROM users WHERE role = 'ADMIN';
```

## 🔧 Alternative: Quick Testing with Different Credentials

If you prefer to use root user directly:

**Update application.properties:**
```properties
spring.datasource.username=root
spring.datasource.password=[your_mysql_root_password]
```

**Just create the database:**
```sql
CREATE DATABASE IF NOT EXISTS skillforge_db;
```

## 🚨 Troubleshooting

### MySQL Not Running
```bash
# Windows (as Administrator)
net start mysql80

# Or check Services.msc for MySQL80 service
```

### Connection Refused
- Verify MySQL is running on port 3306
- Check Windows Firewall
- Verify user credentials

### Access Denied
- Double-check username/password
- Ensure user has proper privileges
- Try with root user first

## 🎯 Next Steps

Once database is connected:
1. **Test API endpoints** (see API_TESTS.md)
2. **View user data** in SQL Workbench
3. **Add more users** through registration API
4. **Build course management features**

Your database is now ready for the SkillForge learning platform! 🚀