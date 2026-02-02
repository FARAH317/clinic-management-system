@echo off
start "Auth Service" cmd /k "cd /d c:\Users\DELL\clinic-management\src\backend\services\auth-service && python app.py"
start "Patient Service" cmd /k "cd /d c:\Users\DELL\clinic-management\src\backend\services\patient-service && python app.py"
start "Appointment Service" cmd /k "cd /d c:\Users\DELL\clinic-management\src\backend\services\appointment-service && python app.py"
start "Prescription Service" cmd /k "cd /d c:\Users\DELL\clinic-management\src\backend\services\prescription-service && python app.py"
start "Medicine Service" cmd /k "cd /d c:\Users\DELL\clinic-management\src\backend\services\medicine-service && python app.py"
start "Doctor Service" cmd /k "cd /d c:\Users\DELL\clinic-management\src\backend\services\doctor-service && python app.py"
start "Billing Service" cmd /k "cd /d c:\Users\DELL\clinic-management\src\backend\services\billing-service && python app.py"
