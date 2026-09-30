"""Schemas package exports."""
from app.schemas.auth import (
    Token,
    TokenBase,
    RefreshTokenRequest,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    UserBase,
    UserResponse,
    UserProfileResponse,
    PasswordChangeRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    SSOLoginResponse,
)

from app.schemas.check_in import (
    CheckInCreate,
    CheckInUpdate,
    CheckInResponse,
    CheckInListResponse,
    CheckInStreakResponse,
    CheckInInternalResponse,
)

from app.schemas.mood import (
    MoodDataPoint,
    MoodSummaryResponse,
    MoodPattern,
    MoodPatternsResponse,
)

from app.schemas.assessment import (
    AssessmentCreate,
    AssessmentResponse,
    AssessmentDetailResponse,
    AssessmentListResponse,
    AssessmentInternalResponse,
)

from app.schemas.recommendation import (
    RecommendationResponse,
    RecommendationListResponse,
    DismissRecommendationRequest,
    ClickRecommendationRequest,
)

from app.schemas.resource import (
    ResourceResponse,
    ResourceListResponse,
    ResourceCreate,
    ResourceUpdate,
    ResourceViewTrack,
)

from app.schemas.counseling import (
    CounselingRequestCreate,
    CounselingRequestResponse,
    CounselingRequestListResponse,
    CounselorProfileResponse,
    AppointmentResponse,
    AppointmentListResponse,
    AppointmentCancelRequest,
    CounselingRequestAssignRequest,
    AppointmentUpdateRequest,
)

from app.schemas.privacy import (
    PrivacyPermissionItem,
    PrivacySummaryResponse,
    ConsentUpdateRequest,
    ConsentStatusResponse,
    DataExportRequest,
    DataExportResponse,
    DataDeletionRequest,
    DataDeletionResponse,
)

from app.schemas.analytics import (
    StressDistributionResponse,
    TopFactorItem,
    TopFactorsResponse,
    TrendsDataPoint,
    TrendsResponse,
    AnalyticsOverviewResponse,
)

from app.schemas.support_case import (
    SupportCaseNote,
    SupportCaseResponse,
    SupportCaseListResponse,
    SupportCaseUpdateRequest,
    SupportCaseNoteCreate,
    SupportCaseDetailResponse,
)

__all__ = [
    # Auth
    "Token", "TokenBase", "RefreshTokenRequest", "LoginRequest", "LoginResponse",
    "RegisterRequest", "UserBase", "UserResponse", "UserProfileResponse",
    "PasswordChangeRequest", "ForgotPasswordRequest", "ResetPasswordRequest", "SSOLoginResponse",
    # Check-in
    "CheckInCreate", "CheckInUpdate", "CheckInResponse", "CheckInListResponse",
    "CheckInStreakResponse", "CheckInInternalResponse",
    # Mood
    "MoodDataPoint", "MoodSummaryResponse", "MoodPattern", "MoodPatternsResponse",
    # Assessment
    "AssessmentCreate", "AssessmentResponse", "AssessmentDetailResponse",
    "AssessmentListResponse", "AssessmentInternalResponse",
    # Recommendation
    "RecommendationResponse", "RecommendationListResponse",
    "DismissRecommendationRequest", "ClickRecommendationRequest",
    # Resource
    "ResourceResponse", "ResourceListResponse", "ResourceCreate", "ResourceUpdate", "ResourceViewTrack",
    # Counseling
    "CounselingRequestCreate", "CounselingRequestResponse", "CounselingRequestListResponse",
    "CounselorProfileResponse", "AppointmentResponse", "AppointmentListResponse",
    "AppointmentCancelRequest", "CounselingRequestAssignRequest", "AppointmentUpdateRequest",
    # Privacy
    "PrivacyPermissionItem", "PrivacySummaryResponse", "ConsentUpdateRequest",
    "ConsentStatusResponse", "DataExportRequest", "DataExportResponse",
    "DataDeletionRequest", "DataDeletionResponse",
    # Analytics
    "StressDistributionResponse", "TopFactorItem", "TopFactorsResponse",
    "TrendsDataPoint", "TrendsResponse", "AnalyticsOverviewResponse",
    # Support Case
    "SupportCaseNote", "SupportCaseResponse", "SupportCaseListResponse",
    "SupportCaseUpdateRequest", "SupportCaseNoteCreate", "SupportCaseDetailResponse",
]