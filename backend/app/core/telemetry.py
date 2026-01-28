"""OpenTelemetry instrumentation setup."""

from app.config import settings


def setup_telemetry(app) -> None:
    """
    Set up OpenTelemetry instrumentation.
    
    Args:
        app: FastAPI application instance
    """
    if not settings.otel_enabled:
        return
    
    # Import OpenTelemetry modules inside function to handle missing packages gracefully
    try:
        from opentelemetry import trace
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import BatchSpanProcessor
        from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
        from opentelemetry.sdk.resources import Resource
    except ImportError as e:
        print(f"⚠ OpenTelemetry packages not available, skipping telemetry setup: {e}")
        return
    
    # Try to get OTLP exporter
    try:
        # Try gRPC exporter first
        from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
    except ImportError:
        # Fallback to HTTP exporter if gRPC fails
        try:
            from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
        except ImportError:
            print("⚠ OpenTelemetry exporters not available, skipping telemetry setup")
            return
    
    # Create resource
    resource = Resource.create(
        {
            "service.name": settings.otel_service_name,
            "service.version": "0.1.0",
            "deployment.environment": settings.env,
        }
    )
    
    # Set up tracer provider
    provider = TracerProvider(resource=resource)
    
    # Add OTLP exporter if endpoint is configured
    if settings.otel_exporter_otlp_endpoint:
        try:
            otlp_exporter = OTLPSpanExporter(
                endpoint=settings.otel_exporter_otlp_endpoint,
                insecure=settings.is_development,
            )
            provider.add_span_processor(BatchSpanProcessor(otlp_exporter))
        except Exception as e:
            print(f"⚠ Failed to set up OTLP exporter: {e}")
    
    trace.set_tracer_provider(provider)
    
    # Instrument FastAPI
    try:
        FastAPIInstrumentor.instrument_app(app)
    except Exception as e:
        print(f"⚠ Failed to instrument FastAPI: {e}")

