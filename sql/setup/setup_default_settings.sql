-- Insert default Directus settings

BEGIN;

INSERT INTO directus_settings (
    project_name, 
    project_url, 
    project_color, 
    public_registration, 
    public_registration_verify_email,
    default_language,
    default_appearance,
    auth_login_attempts
) VALUES (
    'Saloon Marketplace',
    'http://localhost:8055',
    '#6644FF',
    true,
    false,
    'en-US',
    'auto',
    25
);

COMMIT;
