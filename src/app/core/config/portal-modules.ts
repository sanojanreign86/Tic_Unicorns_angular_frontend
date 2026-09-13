export type PortalRole = 'Admin' | 'Student' | 'Both';
export type ActionMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ResourceConfig {
  label: string;
  endpoint: string;
  roles: PortalRole;
  hint?: string;
}

export interface ActionFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'datetime-local' | 'time' | 'textarea' | 'boolean' | 'select';
  required?: boolean;
  placeholder?: string;
  pathParam?: boolean;
  options?: { value: string | number; label: string }[];
  optionsEndpoint?: string;
  optionValueKey?: string;
  optionLabelKey?: string;
}

export interface ActionConfig {
  label: string;
  method: ActionMethod;
  endpoint: string;
  roles: PortalRole;
  tone?: 'primary' | 'secondary' | 'danger';
  fields?: ActionFieldConfig[];
  successMessage: string;
}

export interface PortalModuleConfig {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  roles: PortalRole;
  resources: ResourceConfig[];
  actions: ActionConfig[];
}

const both = (label: string, endpoint: string, hint?: string): ResourceConfig => ({ label, endpoint, roles: 'Both', hint });
const student = (label: string, endpoint: string, hint?: string): ResourceConfig => ({ label, endpoint, roles: 'Student', hint });
const admin = (label: string, endpoint: string, hint?: string): ResourceConfig => ({ label, endpoint, roles: 'Admin', hint });

export const PORTAL_MODULES: PortalModuleConfig[] = [
  {
    key: 'events', title: 'Events', subtitle: 'Discover events, registrations, seats and payments.', icon: 'events', accent: 'blue', roles: 'Both',
    resources: [both('Events', 'Event'), both('Venues', 'Venue'), student('My registrations', 'EventRegistration/my'), admin('Registrations', 'EventRegistration'), admin('Payments', 'EventPayment'), admin('Seats', 'EventSeat')],
    actions: [
      { label: 'Register for event', method: 'POST', endpoint: 'EventRegistration', roles: 'Student', successMessage: 'Event registration created.', fields: [
        { key: 'eventId', label: 'Event ID', type: 'number', required: true }, { key: 'eventSeatId', label: 'Seat ID (optional)', type: 'number' }
      ] },
      { label: 'Confirm free registration', method: 'POST', endpoint: 'EventRegistration/{eventRegistrationId}/confirm', roles: 'Student', successMessage: 'Registration confirmed.', fields: [{ key: 'eventRegistrationId', label: 'Registration ID', type: 'number', required: true, pathParam: true }] },
      { label: 'Cancel registration', method: 'DELETE', endpoint: 'EventRegistration/{eventRegistrationId}', roles: 'Student', tone: 'danger', successMessage: 'Registration cancelled.', fields: [{ key: 'eventRegistrationId', label: 'Registration ID', type: 'number', required: true, pathParam: true }] },
      { label: 'Create venue', method: 'POST', endpoint: 'Venue', roles: 'Admin', successMessage: 'Venue created.', fields: [
        { key: 'venueName', label: 'Venue name', type: 'text', required: true }, { key: 'capacity', label: 'Capacity', type: 'number', required: true }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'isActive', label: 'Active', type: 'boolean' }
      ] },
      { label: 'Create event', method: 'POST', endpoint: 'Event', roles: 'Admin', successMessage: 'Event created.', fields: [
        { key: 'venueId', label: 'Venue', type: 'select', required: true, optionsEndpoint: 'Venue', optionValueKey: 'venueId', optionLabelKey: 'venueName' }, { key: 'eventName', label: 'Event name', type: 'text', required: true }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'startDateTime', label: 'Start', type: 'datetime-local', required: true }, { key: 'endDateTime', label: 'End', type: 'datetime-local', required: true }, { key: 'isPaid', label: 'Paid event', type: 'boolean' }, { key: 'usesReservedSeating', label: 'Reserved seating', type: 'boolean' }, { key: 'feeAmount', label: 'Fee amount', type: 'number' }, { key: 'holdDurationMinutes', label: 'Hold minutes', type: 'number', required: true }, { key: 'isActive', label: 'Active', type: 'boolean' }
      ] }
    ]
  },
  {
    key: 'labs', title: 'Labs', subtitle: 'Lab spaces, availability, bookings and workstation management.', icon: 'labs', accent: 'purple', roles: 'Both',
    resources: [both('Labs', 'Labs'), student('My bookings', 'Labs/bookings/my', 'Uses the My Bookings endpoint added to the backend.' )],
    actions: [
      { label: 'Create booking', method: 'POST', endpoint: 'Labs/bookings', roles: 'Student', successMessage: 'Lab booking created.', fields: [
        { key: 'labId', label: 'Lab ID', type: 'number', required: true }, { key: 'timeSlotId', label: 'Time slot ID', type: 'number', required: true }, { key: 'labSeatId', label: 'Seat ID (computer lab)', type: 'number' }, { key: 'studentId', label: 'Student ID', type: 'number', required: true }, { key: 'bookingDate', label: 'Booking date', type: 'date', required: true }, { key: 'requestedStartTime', label: 'Requested start time', type: 'time' }, { key: 'requestedHours', label: 'Requested hours', type: 'number' }
      ] },
      { label: 'Cancel booking', method: 'PATCH', endpoint: 'Labs/bookings/{labBookingId}/cancel', roles: 'Student', tone: 'danger', successMessage: 'Lab booking cancelled.', fields: [{ key: 'labBookingId', label: 'Booking ID', type: 'number', required: true, pathParam: true }] },
      { label: 'Create lab', method: 'POST', endpoint: 'Labs', roles: 'Admin', successMessage: 'Lab created.', fields: [
        { key: 'labName', label: 'Lab name', type: 'text', required: true }, { key: 'labType', label: 'Lab type', type: 'select', required: true, options: [{ value: 'Science', label: 'Science lab' }, { value: 'Computer', label: 'Computer lab' }] }, { key: 'capacity', label: 'Capacity', type: 'number', required: true }, { key: 'description', label: 'Description', type: 'textarea' }
      ] }
    ]
  },
  {
    key: 'hostels', title: 'Hostels', subtitle: 'Hostel spaces, applications, allocations and payments.', icon: 'hostels', accent: 'indigo', roles: 'Both',
    resources: [both('Hostels', 'Hostel'), student('My applications', 'Hostel/applications/my'), student('My allocations', 'Hostel/allocations/my'), admin('Applications', 'Hostel/applications'), admin('Allocations', 'Hostel/allocations')],
    actions: [
      { label: 'Hold a bed', method: 'POST', endpoint: 'Hostel/holds/{bedId}', roles: 'Student', successMessage: 'Bed hold created.', fields: [{ key: 'bedId', label: 'Bed ID', type: 'number', required: true, pathParam: true }] },
      { label: 'Submit application', method: 'POST', endpoint: 'Hostel/applications', roles: 'Student', successMessage: 'Hostel application submitted.', fields: [
        { key: 'hostelId', label: 'Hostel', type: 'select', required: true, optionsEndpoint: 'Hostel', optionValueKey: 'hostelId', optionLabelKey: 'hostelName' }, { key: 'holdId', label: 'Hold ID', type: 'number', required: true }, { key: 'district', label: 'District', type: 'text', required: true }, { key: 'province', label: 'Province', type: 'text', required: true }, { key: 'reason', label: 'Reason', type: 'textarea' }
      ] },
      { label: 'Create hostel', method: 'POST', endpoint: 'Hostel', roles: 'Admin', successMessage: 'Hostel created.', fields: [
        { key: 'universityId', label: 'University', type: 'select', required: true, optionsEndpoint: 'AcademicMaster/universities', optionValueKey: 'universityId', optionLabelKey: 'universityName' }, { key: 'hostelName', label: 'Hostel name', type: 'text', required: true }, { key: 'hostelType', label: 'Hostel type', type: 'select', required: true, options: [{ value: 'Boys', label: 'Boys hostel' }, { value: 'Girls', label: 'Girls hostel' }] }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'isActive', label: 'Active', type: 'boolean' }
      ] }
    ]
  },
  {
    key: 'canteen', title: 'Canteen', subtitle: 'Meal packages, subscriptions, usage and canteen operations.', icon: 'canteen', accent: 'amber', roles: 'Both',
    resources: [student('My canteens', 'canteen/my/canteens'), both('Meal packages', 'canteen/packages'), student('My subscriptions', 'canteen/my/subscriptions'), student('My usage', 'canteen/my/usage'), admin('Canteens', 'canteen/canteens')],
    actions: [
      { label: 'Start subscription', method: 'POST', endpoint: 'canteen/subscriptions', roles: 'Student', successMessage: 'Meal subscription created.', fields: [{ key: 'mealPackageId', label: 'Meal package ID', type: 'number', required: true }, { key: 'startDate', label: 'Start date', type: 'date', required: true }] },
      { label: 'Create canteen', method: 'POST', endpoint: 'canteen/canteens', roles: 'Admin', successMessage: 'Canteen created.', fields: [{ key: 'hostelId', label: 'Hostel', type: 'select', required: true, optionsEndpoint: 'Hostel', optionValueKey: 'hostelId', optionLabelKey: 'hostelName' }, { key: 'canteenName', label: 'Canteen name', type: 'text', required: true }, { key: 'description', label: 'Description', type: 'textarea' }] }
    ]
  },
  {
    key: 'certificates', title: 'Certificates', subtitle: 'Request and track official university certificates.', icon: 'certificates', accent: 'cyan', roles: 'Both',
    resources: [student('My requests', 'Certificates/my'), admin('All requests', 'Certificates')],
    actions: [
      { label: 'Request certificate', method: 'POST', endpoint: 'Certificates', roles: 'Student', successMessage: 'Certificate request submitted.', fields: [{ key: 'certificateType', label: 'Type (Bonafide/Transcript/CompletionLetter)', type: 'text', required: true }, { key: 'purpose', label: 'Purpose', type: 'textarea', required: true }] }
    ]
  },
  {
    key: 'complaints', title: 'Complaints', subtitle: 'Submit issues, review statuses and follow resolution history.', icon: 'complaints', accent: 'rose', roles: 'Both',
    resources: [both('Categories', 'Complaints/categories'), student('My complaints', 'Complaints/my'), admin('All complaints', 'Complaints')],
    actions: [
      { label: 'Submit complaint', method: 'POST', endpoint: 'Complaints', roles: 'Student', successMessage: 'Complaint submitted.', fields: [{ key: 'categoryId', label: 'Category ID', type: 'number', required: true }, { key: 'title', label: 'Title', type: 'text', required: true }, { key: 'description', label: 'Description', type: 'textarea', required: true }] },
      { label: 'Create category', method: 'POST', endpoint: 'Complaints/categories', roles: 'Admin', successMessage: 'Complaint category created.', fields: [{ key: 'name', label: 'Name', type: 'text', required: true }, { key: 'description', label: 'Description', type: 'textarea', required: true }] }
    ]
  },
  {
    key: 'fees', title: 'Fees', subtitle: 'Outstanding fees, payments, refunds and fee administration.', icon: 'fees', accent: 'emerald', roles: 'Both',
    resources: [both('Fee types', 'Fees/types'), student('My fees', 'Fees/my'), student('My payments', 'Fees/my/payments'), student('My refunds', 'Fees/my/refunds'), admin('Student fees', 'Fees/student-fees'), admin('Payments', 'Fees/payments'), admin('Refunds', 'Fees/refunds')],
    actions: [
      { label: 'Pay fee', method: 'POST', endpoint: 'Fees/my/{studentFeeId}/pay', roles: 'Student', successMessage: 'Fee payment recorded.', fields: [{ key: 'studentFeeId', label: 'Student fee ID', type: 'number', required: true, pathParam: true }, { key: 'paymentReference', label: 'Payment reference', type: 'text' }] },
      { label: 'Create fee type', method: 'POST', endpoint: 'Fees/types', roles: 'Admin', successMessage: 'Fee type created.', fields: [{ key: 'name', label: 'Name', type: 'text', required: true }, { key: 'description', label: 'Description', type: 'textarea', required: true }, { key: 'amount', label: 'Amount', type: 'number', required: true }] }
    ]
  },
  {
    key: 'gym', title: 'Gym', subtitle: 'Gym locations, availability, bookings and payments.', icon: 'gym', accent: 'violet', roles: 'Both',
    resources: [both('Gyms', 'Gym'), student('My bookings', 'Gym/bookings/my')],
    actions: [
      { label: 'Book gym slot', method: 'POST', endpoint: 'Gym/bookings', roles: 'Student', successMessage: 'Gym booking created.', fields: [{ key: 'slotId', label: 'Slot ID', type: 'number', required: true }] },
      { label: 'Create gym', method: 'POST', endpoint: 'Gym', roles: 'Admin', successMessage: 'Gym created.', fields: [{ key: 'name', label: 'Name', type: 'text', required: true }, { key: 'location', label: 'Location', type: 'text', required: true }, { key: 'capacity', label: 'Capacity', type: 'number', required: true }, { key: 'description', label: 'Description', type: 'textarea', required: true }] }
    ]
  },
  {
    key: 'leave', title: 'Leave', subtitle: 'Leave types, student requests and staff decisions.', icon: 'leave', accent: 'orange', roles: 'Both',
    resources: [both('Leave types', 'Leave/types'), student('My requests', 'Leave/requests/my'), admin('Staff queue', 'Leave/requests/staff')],
    actions: [
      { label: 'Request leave', method: 'POST', endpoint: 'Leave/requests', roles: 'Student', successMessage: 'Leave request submitted.', fields: [{ key: 'leaveTypeId', label: 'Leave type ID', type: 'number', required: true }, { key: 'startDate', label: 'Start date', type: 'date', required: true }, { key: 'endDate', label: 'End date', type: 'date', required: true }, { key: 'reason', label: 'Reason', type: 'textarea', required: true }] },
      { label: 'Create leave type', method: 'POST', endpoint: 'Leave/types', roles: 'Admin', successMessage: 'Leave type created.', fields: [{ key: 'name', label: 'Name', type: 'text', required: true }, { key: 'description', label: 'Description', type: 'textarea' }] }
    ]
  },
  {
    key: 'sports', title: 'Sports', subtitle: 'Sports events, registrations and coach meetings.', icon: 'sports', accent: 'green', roles: 'Both',
    resources: [student('Available events', 'SportsEvent/available'), student('My registrations', 'SportsRegistration/my'), admin('Sports events', 'SportsEvent'), admin('Registrations', 'SportsRegistration'), admin('Coach meetings', 'CoachMeeting')],
    actions: [
      { label: 'Register for sport', method: 'POST', endpoint: 'SportsRegistration', roles: 'Student', successMessage: 'Sports registration submitted.', fields: [{ key: 'sportsEventId', label: 'Sports event ID', type: 'number', required: true }] },
      { label: 'Create sports event', method: 'POST', endpoint: 'SportsEvent', roles: 'Admin', successMessage: 'Sports event created.', fields: [{ key: 'eventName', label: 'Event name', type: 'text', required: true }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'eventDate', label: 'Event date', type: 'date', required: true }, { key: 'startTime', label: 'Start time', type: 'time', required: true }, { key: 'endTime', label: 'End time', type: 'time', required: true }, { key: 'location', label: 'Location', type: 'text' }] }
    ]
  },
  {
    key: 'notifications', title: 'Notifications', subtitle: 'All service updates and account alerts in one inbox.', icon: 'notifications', accent: 'blue', roles: 'Both',
    resources: [both('My notifications', 'Notification/my')],
    actions: [{ label: 'Mark all as read', method: 'PUT', endpoint: 'Notification/read-all', roles: 'Both', successMessage: 'All notifications marked as read.' }]
  },
  {
    key: 'students', title: 'Students', subtitle: 'Student profiles, master list and onboarding data.', icon: 'students', accent: 'blue', roles: 'Admin',
    resources: [admin('Students', 'Student'), admin('Master list', 'StudentMasterList')],
    actions: [
      { label: 'Set hostel eligibility', method: 'PATCH', endpoint: 'StudentMasterList/{masterStudentId}/gender', roles: 'Admin', successMessage: 'Student hostel eligibility updated.', fields: [
        { key: 'masterStudentId', label: 'Student', type: 'select', required: true, pathParam: true, optionsEndpoint: 'StudentMasterList', optionValueKey: 'masterStudentId', optionLabelKey: 'universityStudentId' },
        { key: 'gender', label: 'Gender / hostel eligibility', type: 'select', required: true, options: [{ value: 'Male', label: 'Male — Boys hostel' }, { value: 'Female', label: 'Female — Girls hostel' }] }
      ] },
      { label: 'Create student', method: 'POST', endpoint: 'Student', roles: 'Admin', successMessage: 'Student created.', fields: [
        { key: 'masterStudentId', label: 'Student from master list', type: 'select', required: true, optionsEndpoint: 'StudentMasterList', optionValueKey: 'masterStudentId', optionLabelKey: 'universityStudentId' }, { key: 'firstName', label: 'First name', type: 'text', required: true }, { key: 'lastName', label: 'Last name', type: 'text', required: true }, { key: 'dateOfBirth', label: 'Date of birth', type: 'date' }, { key: 'gender', label: 'Gender', type: 'select', options: [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }] }, { key: 'email', label: 'Email', type: 'text' }, { key: 'phoneNumber', label: 'Phone number', type: 'text' }
      ] }
    ]
  },
  {
    key: 'academic', title: 'Academic Masters', subtitle: 'University, faculty and department reference structure.', icon: 'academic', accent: 'indigo', roles: 'Admin',
    resources: [admin('Universities', 'AcademicMaster/universities'), admin('Departments', 'AcademicMaster/departments'), admin('Academic tree', 'AcademicMaster/tree')], actions: []
  },
  {
    key: 'identity', title: 'Identity & Access', subtitle: 'Users, roles, permissions and staff assignments.', icon: 'identity', accent: 'purple', roles: 'Admin',
    resources: [admin('Users', 'Identity/users'), admin('Roles', 'Identity/roles'), admin('Permissions', 'Identity/permissions'), admin('Identity audit', 'Identity/audit-logs')],
    actions: [{ label: 'Create role', method: 'POST', endpoint: 'Identity/roles', roles: 'Admin', successMessage: 'Role created.', fields: [{ key: 'roleName', label: 'Role name', type: 'text', required: true }, { key: 'description', label: 'Description', type: 'textarea' }] }]
  },
  {
    key: 'system-settings', title: 'System Settings', subtitle: 'Central application settings and reservation controls.', icon: 'system-settings', accent: 'slate', roles: 'Admin',
    resources: [admin('Settings', 'SystemSetting')],
    actions: [{ label: 'Create setting', method: 'POST', endpoint: 'SystemSetting', roles: 'Admin', successMessage: 'System setting created.', fields: [{ key: 'key', label: 'Key', type: 'text', required: true }, { key: 'value', label: 'Value', type: 'text', required: true }, { key: 'description', label: 'Description', type: 'textarea' }] }]
  },
  {
    key: 'audit-logs', title: 'Audit Logs', subtitle: 'Security-sensitive activity and system traceability.', icon: 'audit-logs', accent: 'slate', roles: 'Admin', resources: [admin('Audit logs', 'AuditLog')], actions: []
  }
];

export function getPortalModule(key: string): PortalModuleConfig | undefined {
  return PORTAL_MODULES.find((module) => module.key === key);
}

export function roleCanAccess(configRole: PortalRole, userRole: string): boolean {
  if (configRole === 'Both') return true;
  return configRole.toLowerCase() === userRole.toLowerCase();
}
