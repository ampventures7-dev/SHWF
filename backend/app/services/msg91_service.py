import logging
import httpx
from typing import Optional
from app.core.config import get_settings

logger = logging.getLogger(__name__)


def mask_contact(contact: str) -> str:
    """Mask contact for safe logging without exposing full phone/email."""
    if "@" in contact:
        parts = contact.split("@", 1)
        name, domain = parts[0], parts[1]
        masked_name = name[0] + "***" + name[-1] if len(name) > 2 else "***"
        return f"{masked_name}@{domain}"
    if len(contact) >= 7:
        return contact[:3] + "****" + contact[-4:]
    return "***"


class MSG91Service:
    """
    Service client for dispatching OTPs via MSG91 SMS API.
    Provides stubbed behavior for development/testing and live HTTP integration when credentials exist.
    """

    MSG91_OTP_URL = "https://control.msg91.com/api/v5/otp"

    def __init__(self, auth_key: Optional[str] = None, template_id: Optional[str] = None):
        settings = get_settings()
        self.auth_key = auth_key or settings.MSG91_AUTH_KEY
        self.template_id = template_id or settings.MSG91_TEMPLATE_ID
        self.sender_id = settings.MSG91_SENDER_ID
        self.otp_expiry = settings.MSG91_OTP_EXPIRY

    async def send_otp(self, contact: str, otp_code: str) -> bool:
        """
        Send a 6-digit OTP to the recipient's phone number via MSG91.
        NEVER logs the OTP in plaintext.
        """
        masked = mask_contact(contact)
        # If MSG91 auth key is not configured, run in stub mode (safe development fallback)
        if not self.auth_key:
            logger.info(
                f"[MSG91 STUB] OTP delivery requested for recipient: {masked}. "
                f"(MSG91_AUTH_KEY not set; running in local stub mode)"
            )
            return True

        # Live MSG91 API dispatch
        try:
            # Clean contact to standard phone format
            phone = contact.lstrip("+")
            params = {
                "template_id": self.template_id,
                "mobile": phone,
                "authkey": self.auth_key,
                "otp": otp_code,
                "otp_expiry": self.otp_expiry,
            }
            if self.sender_id:
                params["sender"] = self.sender_id

            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(self.MSG91_OTP_URL, params=params)
                if response.status_code == 200:
                    logger.info(f"MSG91 OTP successfully dispatched to recipient: {masked}")
                    return True
                else:
                    logger.error(
                        f"MSG91 OTP dispatch failed for recipient: {masked} "
                        f"Status: {response.status_code} Body: {response.text}"
                    )
                    return False
        except Exception as e:
            logger.error(f"Exception during MSG91 OTP delivery to recipient {masked}: {str(e)}")
            return False


_msg91_service: Optional[MSG91Service] = None


def get_msg91_service() -> MSG91Service:
    """Dependency provider for MSG91Service."""
    global _msg91_service
    if _msg91_service is None:
        _msg91_service = MSG91Service()
    return _msg91_service


def set_msg91_service(service: MSG91Service) -> None:
    """Override MSG91 service (useful for testing)."""
    global _msg91_service
    _msg91_service = service
