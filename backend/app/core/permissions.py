"""
Role-based access control (RBAC) permissions.
Defines roles, permissions, and access control logic.
"""
from enum import Enum
from typing import Set, Dict

from app.core.exceptions import ForbiddenError, InsufficientRoleError


class Role(str, Enum):
    """User roles in the system."""
    STUDENT = "student"
    COUNSELOR = "counselor"
    WELLBEING_ADMIN = "wellbeing_admin"
    ADMIN = "admin"


class Permission(str, Enum):
    """Granular permissions."""
    VIEW_OWN_CHECK_INS = "view_own_check_ins"
    CREATE_CHECK_IN = "create_check_in"
    VIEW_OWN_MOOD = "view_own_mood"
    VIEW_OWN_ASSESSMENTS = "view_own_assessments"
    CREATE_ASSESSMENT = "create_assessment"
    VIEW_OWN_RECOMMENDATIONS = "view_own_recommendations"
    DISMISS_RECOMMENDATION = "dismiss_recommendation"
    VIEW_RESOURCES = "view_resources"
    VIEW_COUNSELORS = "view_counselors"
    CREATE_COUNSELING_REQUEST = "create_counseling_request"
    VIEW_OWN_APPOINTMENTS = "view_own_appointments"
    CANCEL_OWN_APPOINTMENT = "cancel_own_appointment"
    VIEW_PRIVACY_SUMMARY = "view_privacy_summary"
    REQUEST_DATA_EXPORT = "request_data_export"
    UPDATE_CONSENT = "update_consent"
    REQUEST_DATA_DELETION = "request_data_deletion"
    VIEW_ASSIGNED_CASES = "view_assigned_cases"
    UPDATE_CASE_STATUS = "update_case_status"
    ADD_CASE_NOTES = "add_case_notes"
    UPDATE_OWN_APPOINTMENTS = "update_own_appointments"
    VIEW_COUNSELING_REQUESTS = "view_counseling_requests"
    ASSIGN_COUNSELING_REQUEST = "assign_counseling_request"
    VIEW_CAMPUS_ANALYTICS = "view_campus_analytics"
    VIEW_TRENDS = "view_trends"
    VIEW_STRESS_DISTRIBUTION = "view_stress_distribution"
    VIEW_TOP_FACTORS = "view_top_factors"
    VIEW_ALL_CASES = "view_all_cases"
    MANAGE_RESOURCES = "manage_resources"
    PUBLISH_RESOURCES = "publish_resources"
    MANAGE_USERS = "manage_users"
    VIEW_AUDIT_LOGS = "view_audit_logs"
    SYSTEM_CONFIG = "system_config"


ROLE_PERMISSIONS: Dict[Role, Set[Permission]] = {
    Role.STUDENT: {
        Permission.VIEW_OWN_CHECK_INS, Permission.CREATE_CHECK_IN, Permission.VIEW_OWN_MOOD,
        Permission.VIEW_OWN_ASSESSMENTS, Permission.CREATE_ASSESSMENT, Permission.VIEW_OWN_RECOMMENDATIONS,
        Permission.DISMISS_RECOMMENDATION, Permission.VIEW_RESOURCES, Permission.VIEW_COUNSELORS,
        Permission.CREATE_COUNSELING_REQUEST, Permission.VIEW_OWN_APPOINTMENTS, Permission.CANCEL_OWN_APPOINTMENT,
        Permission.VIEW_PRIVACY_SUMMARY, Permission.REQUEST_DATA_EXPORT, Permission.UPDATE_CONSENT,
        Permission.REQUEST_DATA_DELETION,
    },
    Role.COUNSELOR: {
        Permission.VIEW_ASSIGNED_CASES, Permission.UPDATE_CASE_STATUS, Permission.ADD_CASE_NOTES,
        Permission.VIEW_OWN_APPOINTMENTS, Permission.UPDATE_OWN_APPOINTMENTS,
        Permission.VIEW_COUNSELING_REQUESTS, Permission.ASSIGN_COUNSELING_REQUEST,
    },
    Role.WELLBEING_ADMIN: {
        Permission.VIEW_CAMPUS_ANALYTICS, Permission.VIEW_TRENDS, Permission.VIEW_STRESS_DISTRIBUTION,
        Permission.VIEW_TOP_FACTORS, Permission.VIEW_ALL_CASES, Permission.MANAGE_RESOURCES,
        Permission.PUBLISH_RESOURCES,
    },
    Role.ADMIN: {
        Permission.MANAGE_USERS, Permission.VIEW_AUDIT_LOGS, Permission.SYSTEM_CONFIG,
    },
}

# Grant ADMIN all permissions from every other role
_all_non_admin_perms: Set[Permission] = {
    p for role, perms in ROLE_PERMISSIONS.items() if role != Role.ADMIN for p in perms
}
ROLE_PERMISSIONS[Role.ADMIN] = ROLE_PERMISSIONS[Role.ADMIN] | _all_non_admin_perms

def get_permissions_for_role(role: Role) -> Set[Permission]:
    return ROLE_PERMISSIONS.get(role, set())

def role_has_permission(role: Role, permission: Permission) -> bool:
    return permission in get_permissions_for_role(role)


def require_permission(permission: Permission):
    from fastapi import Depends
    from app.routers.auth import get_current_user
    from app.models.user import User
    async def check_permission(current_user: User = Depends(get_current_user)) -> User:
        if not role_has_permission(current_user.role, permission):
            raise InsufficientRoleError(permission.value)
        return current_user
    return check_permission


def require_role(*roles: Role):
    from fastapi import Depends
    from app.routers.auth import get_current_user
    from app.models.user import User
    async def check_role(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise InsufficientRoleError(", ".join(r.value for r in roles))
        return current_user
    return check_role