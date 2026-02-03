# Clinic Management System - Issue Resolution

## Problem
❌ HTTPConnectionPool(host='patient-service', port=5002): Max retries exceeded with url: /api/patients?search=mohammed@gmail.com (Caused by NameResolutionError("<urllib3.connection.HTTPConnection object at 0x00000236CE5AE450>: Failed to resolve 'patient-service' ([Errno 11001] getaddrinfo failed)"))

## Root Cause
The backend services were configured to use Docker service names (e.g., 'patient-service', 'medicine-service') as URLs, but the services are running directly with Python (not in Docker containers). This caused DNS resolution failures when services tried to communicate with each other.

## Solution Applied
✅ Updated all service URLs in backend services to use `localhost` instead of Docker service names:

### Files Modified:
- [x] `src/backend/services/appointment-service/app.py` - Changed PATIENT_SERVICE_URL to `http://localhost:5002`
- [x] `src/backend/services/prescription-service/app.py` - Changed PATIENT_SERVICE_URL and MEDICINE_SERVICE_URL to `http://localhost:5002` and `http://localhost:5005`
- [x] `src/backend/services/billing-service/app.py` - Changed APPOINTMENT_SERVICE_URL, PATIENT_SERVICE_URL, and DOCTOR_SERVICE_URL to `http://localhost:5003`, `http://localhost:5002`, and `http://localhost:5006`

## Testing Required
- [ ] Restart all backend services using `launch_services.bat`
- [ ] Test appointment creation from the dashboard
- [ ] Verify inter-service communication works properly

## Notes
- The frontend is already configured to use localhost URLs for API calls
- Docker compose configuration uses service names for container-to-container communication
- When running in Docker, environment variables should override the localhost defaults
