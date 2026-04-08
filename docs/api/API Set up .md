Directus API Token Setup for AI Agent
This guide explains how to create an API token that your AI assistant (or any automated process) can use to interact with Directus. The token will be used by the Directus MCP (Model Context Protocol) tool to manage collections, fields, roles, policies, flows, and other Directus resources automatically.

Overview
The AI agent needs a way to authenticate with Directus to perform actions like:

Creating collections and fields.

Managing roles and policies.

Building dashboards and flows.

Running tests.

Instead of using an admin account with a password, we’ll create a dedicated API token (static token) assigned to a user with a custom role that has precisely the permissions needed.

Step-by-Step Setup
1. Access Directus Admin UI
Navigate to your Directus instance (e.g., http://localhost:8055).

Log in as an administrator (e.g., admin@admin.com / password123).

2. Create a Dedicated Role for the AI Agent
We’ll create a role named “AI Agent” that will have all necessary permissions.

Go to Settings → Roles & Permissions.

Click Create Role.

Fill in:

Name: AI Agent

Icon: smart_toy (or any)

Description: Automated configuration by AI assistant

Admin Access: No (we don't need full admin rights; we’ll give granular permissions)

App Access: No (the AI doesn’t need to use the Data Studio; it will only use the API)

Click Save.

3. Create a User for the AI Agent
Now create a user that belongs to this role.

Go to Settings → Users & Permissions → Users.

Click Create User.

Fill in:

Email: ai-agent@yourdomain.com (or a placeholder)

Password: Generate a strong password (we won’t use it for login, but it’s required)

Role: Select AI Agent

Status: Active

Click Save.

4. Generate a Static API Token
In the user list, click on the newly created user to edit.

Scroll down to the Token field (if not visible, enable it via the field settings in the user collection).

Click Generate Token (or enter a custom token).

Copy the token and store it securely. You will need it later.

5. Set Permissions for the AI Agent Role
The AI agent needs to be able to manage all collections, fields, roles, policies, flows, and dashboards that we will be working with. Because the AI is performing automated setup, it needs broad permissions, but we can restrict it to the system collections that are relevant.

We’ll grant all actions (create, read, update, delete) on the following collections:

All custom collections we will create (employees, employee_services, employee_schedules, bookings)

System collections needed for setup:

directus_collections

directus_fields

directus_relations

directus_roles

directus_policies

directus_permissions

directus_flows

directus_operations

directus_dashboards

directus_panels

Important: Granting full access to these system collections essentially gives the AI agent the ability to reconfigure Directus entirely. For an automated setup, this is acceptable, but in production you may want to restrict further. Since the AI is trusted and the process is manual (you run it once), this is fine.

How to set permissions:

In Settings → Roles & Permissions, select the AI Agent role.

You’ll see a table of collections. For each collection you want to give access to, click the pencil icon and set the permissions.

For each collection, you typically set:

Create: All fields (or specific ones)

Read: All fields

Update: All fields

Delete: All fields

Item rules: leave blank (no restrictions)

Field rules: leave all fields allowed

Repeat for every collection listed above.

If you prefer to be more restrictive, you can limit field access later. For now, we’ll allow everything.

6. Test the Token
Use curl or any API client to verify the token works.

bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8055/items/employees
You should get a successful response (even if the collection doesn’t exist yet).

7. Store the Token Securely
Add the token to your environment variables or a .env file (never commit it to version control).

The MCP tool will likely read it from an environment variable. Configure it accordingly.

Best Practices
Token Rotation: Generate a new token periodically and update the environment.

Least Privilege: After the initial setup, you may want to revoke the token or reduce permissions if the AI will no longer need them. Alternatively, create a separate token for ongoing maintenance.

Audit Logs: Directus logs all API actions. You can monitor the AI agent’s activities in the Activity log.

Use HTTPS: In production, ensure your Directus instance uses HTTPS to protect the token in transit.

MCP Configuration
If you are using the Directus MCP tool, you will typically configure it with:

text
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=your_api_token_here
The MCP will automatically use the token for all requests.

Troubleshooting
401 Unauthorized: Token is invalid or expired. Regenerate and update.

403 Forbidden: The role does not have the necessary permissions. Check the permissions for the collections the AI is trying to access.

Token not working in MCP: Ensure the MCP is reading the environment variable correctly and that the URL is correct.
