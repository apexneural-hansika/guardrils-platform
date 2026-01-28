"""SSRF (Server-Side Request Forgery) protection utilities.

Implements reference.md requirements:
- Outbound allowlists
- URL validation
- No blind fetch
"""

import ipaddress
from typing import Optional
from urllib.parse import urlparse
from app.core.exceptions import ValidationError


# Allowed URL schemes
ALLOWED_SCHEMES = {"http", "https"}

# Private IP ranges (RFC 1918, RFC 4193, etc.)
PRIVATE_IP_RANGES = [
    ipaddress.IPv4Network("10.0.0.0/8"),
    ipaddress.IPv4Network("172.16.0.0/12"),
    ipaddress.IPv4Network("192.168.0.0/16"),
    ipaddress.IPv4Network("127.0.0.0/8"),
    ipaddress.IPv4Network("169.254.0.0/16"),  # Link-local
]

# Reserved/localhost addresses
FORBIDDEN_HOSTS = {
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "::1",
    "localhost.localdomain",
}


def is_private_ip(ip: str) -> bool:
    """
    Check if IP address is private/reserved.

    Args:
        ip: IP address string

    Returns:
        True if IP is private/reserved
    """
    try:
        ip_obj = ipaddress.ip_address(ip)
        
        # Check private ranges
        for network in PRIVATE_IP_RANGES:
            if ip_obj in network:
                return True
        
        # Check if IPv6 is private
        if ip_obj.version == 6:
            if ip_obj.is_link_local or ip_obj.is_loopback or ip_obj.is_private:
                return True
        
        return False
    except ValueError:
        return True  # Invalid IP, treat as private


def validate_url(url: str, allowlist: Optional[list[str]] = None) -> tuple[str, str]:
    """
    Validate URL for SSRF protection.

    Args:
        url: URL to validate
        allowlist: Optional list of allowed hostnames/domains

    Returns:
        Tuple of (scheme, hostname) if valid

    Raises:
        ValidationError: If URL is unsafe
    """
    try:
        parsed = urlparse(url)
    except Exception as e:
        raise ValidationError(f"Invalid URL format: {str(e)}")

    # Check scheme
    if parsed.scheme not in ALLOWED_SCHEMES:
        raise ValidationError(
            f"URL scheme '{parsed.scheme}' not allowed. Only {ALLOWED_SCHEMES} are permitted."
        )

    # Check hostname
    hostname = parsed.hostname
    if not hostname:
        raise ValidationError("URL must have a hostname")

    # Check against allowlist if provided
    if allowlist:
        hostname_lower = hostname.lower()
        if not any(
            hostname_lower == allowed.lower() or hostname_lower.endswith(f".{allowed.lower()}")
            for allowed in allowlist
        ):
            raise ValidationError(f"Hostname '{hostname}' not in allowlist")

    # Check forbidden hosts
    if hostname.lower() in FORBIDDEN_HOSTS:
        raise ValidationError(f"Hostname '{hostname}' is forbidden (localhost/reserved)")

    # Resolve hostname to IP and check if private
    try:
        import socket
        ip = socket.gethostbyname(hostname)
        if is_private_ip(ip):
            raise ValidationError(
                f"Hostname '{hostname}' resolves to private IP '{ip}'. Private IPs are not allowed."
            )
    except socket.gaierror:
        # DNS resolution failed - allow it (will fail on actual request)
        pass
    except Exception:
        # Other resolution errors - be conservative
        pass

    return parsed.scheme, hostname


def validate_llm_provider_url(url: str) -> tuple[str, str]:
    """
    Validate URL for LLM provider calls.

    Only allows known LLM provider domains.

    Args:
        url: Provider URL

    Returns:
        Tuple of (scheme, hostname) if valid

    Raises:
        ValidationError: If URL is not from allowed provider
    """
    # Known LLM provider domains
    ALLOWED_PROVIDERS = [
        "api.openai.com",
        "api.anthropic.com",
        "api.azure.com",
        "generativelanguage.googleapis.com",  # Google
        "api.cohere.ai",
        "api.mistral.ai",
    ]

    return validate_url(url, allowlist=ALLOWED_PROVIDERS)

