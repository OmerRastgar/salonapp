# Saloon Marketplace - Directus Native Booking System

This project is a self-hosted, headless, multi-vendor booking marketplace (a clone of Fresha) tailored for salons and beauty services. It features a complete Directus-native booking system that replaces external scheduling services.

## 🏛️ The Architecture

### 1. The Discovery & Review Layer (Frontend & CMS)
This is the public-facing marketplace where customers browse and book services.

- **The Stack**: Next.js 14 (App Router) powered by Directus CMS
- **The Look**: Built with **Next.js**, **Tailwind CSS**, and **shadcn/ui** for a modern, premium feel
- **The Function**: Acts as a search engine, reputation manager, and booking platform
- **The Magic**: Complete booking flow handled natively within Directus

### 2. The Booking Engine (Directus Native)
All booking logic runs natively within Directus.

- **The Stack**: Directus 10.x with custom collections and flows
- **The Function**: Handles multi-tenant booking, employee management, schedules, and services
- **The Features**: Real-time availability, overlap prevention, email notifications, analytics

---

## 🖥️ The Customer Journey (Step-by-Step)

1.  **Search & Discover**: Customer visits `http://localhost`, searches for services, filters by location/rating
2.  **Evaluate**: Customer clicks on a salon, reads reviews, views services and staff
3.  **Book Service**: Customer clicks "Book Now" and goes through the 5-step booking process:
   - Select Vendor → Select Employee → Select Service → Pick Date → Choose Time
4.  **Confirmation**: Directus automatically emails confirmation and manages the booking
5.  **Vendor Management**: Salon owners manage everything through Directus admin interface

---

## 💼 The Vendor Journey (Directus Native)

This design makes life incredibly easy for salon owners - everything is managed in one place.

- **You Build the Profile**: Create vendor profiles in Directus with photos, services, and staff
- **They Manage Everything**: Vendors get Directus logins to manage employees, services, schedules, and bookings
- **Complete Control**: All business logic, analytics, and customer management happens in Directus
- **Automated Workflows**: Directus flows handle confirmations, notifications, and business rules

---

## 🚀 Getting Started

1.  **Start the Ecosystem**:
    ```bash
    docker-compose up -d --build
    ```

2.  **Access Points**:
    - **Marketplace (Customer Site)**: [http://localhost](http://localhost)
    - **Booking Page**: [http://localhost/booking](http://localhost/booking)
    - **Directus Admin**: [http://localhost:8055](http://localhost:8055)

3.  **Default Credentials**:
    - **Directus Admin**: `admin@admin.com` / `password123`

## ⚙️ Technical Architecture

- **Reverse Proxy**: Nginx (routes traffic to Next.js and Directus)
- **Frontend**: Next.js 14 (App Router) fetching live data from Directus
- **CMS & Booking**: Directus 10.x (headless CMS + native booking system)
- **Database**: PostgreSQL with complete booking schema
- **Business Logic**: Directus Flows for automation and validation
