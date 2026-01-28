"""Initial migration: create all tables

Revision ID: 001_initial
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enums (with IF NOT EXISTS check)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE policy_status AS ENUM ('draft', 'active', 'deprecated', 'archived');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE policy_scope AS ENUM ('llm.input', 'llm.output', 'tool.call', 'tool.result', 'data.access', 'all');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE incident_status AS ENUM ('open', 'investigating', 'resolved', 'false_positive');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    
    # Organizations
    op.create_table(
        'organizations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(100), nullable=False, unique=True),
        sa.Column('settings', postgresql.JSON(astext_type=sa.Text()), server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
    )
    
    # Users
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('org_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('name', sa.String(255)),
        sa.Column('role', sa.String(50), server_default='member'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['org_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('org_id', 'email', name='uq_users_org_email'),
    )
    
    # API Keys
    op.create_table(
        'api_keys',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('org_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('key_hash', sa.String(64), nullable=False, unique=True),
        sa.Column('key_prefix', sa.String(12), nullable=False),
        sa.Column('scopes', postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column('last_used_at', sa.DateTime(timezone=True)),
        sa.Column('expires_at', sa.DateTime(timezone=True)),
        sa.Column('created_by', postgresql.UUID(as_uuid=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['org_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id']),
    )
    
    # Apps
    op.create_table(
        'apps',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('org_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(100), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('owners', postgresql.ARRAY(postgresql.UUID(as_uuid=True)), nullable=False),
        sa.Column('settings', postgresql.JSON(astext_type=sa.Text()), server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['org_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('org_id', 'slug', name='uq_apps_org_slug'),
    )
    
    # Environments
    op.create_table(
        'environments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('app_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(50), nullable=False),
        sa.Column('is_production', sa.Boolean(), server_default='false'),
        sa.Column('settings', postgresql.JSON(astext_type=sa.Text()), server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['app_id'], ['apps.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('app_id', 'name', name='uq_environments_app_name'),
    )
    
    # Policies
    op.create_table(
        'policies',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('org_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(100), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('scope', postgresql.ENUM('llm.input', 'llm.output', 'tool.call', 'tool.result', 'data.access', 'all', name='policy_scope', create_type=False), nullable=False),
        sa.Column('status', postgresql.ENUM('draft', 'active', 'deprecated', 'archived', name='policy_status', create_type=False), server_default='draft'),
        sa.Column('tags', postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column('created_by', postgresql.UUID(as_uuid=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['org_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id']),
        sa.UniqueConstraint('org_id', 'slug', name='uq_policies_org_slug'),
    )
    
    # Policy Versions
    op.create_table(
        'policy_versions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('policy_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.Column('content_yaml', sa.Text(), nullable=False),
        sa.Column('content_json', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('content_hash', sa.String(64), nullable=False),
        sa.Column('changelog', sa.Text()),
        sa.Column('is_published', sa.Boolean(), server_default='false'),
        sa.Column('approved_by', postgresql.UUID(as_uuid=True)),
        sa.Column('approved_at', sa.DateTime(timezone=True)),
        sa.Column('created_by', postgresql.UUID(as_uuid=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['policy_id'], ['policies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['approved_by'], ['users.id']),
        sa.ForeignKeyConstraint(['created_by'], ['users.id']),
        sa.UniqueConstraint('policy_id', 'version', name='uq_policy_versions_policy_version'),
    )
    op.create_index('idx_policy_versions_published', 'policy_versions', ['policy_id', 'is_published'], postgresql_where=sa.text('is_published = TRUE'))
    
    # Policy Assignments
    op.create_table(
        'policy_assignments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('policy_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('policy_version_id', postgresql.UUID(as_uuid=True)),
        sa.Column('target_type', sa.String(20), nullable=False),
        sa.Column('target_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('priority', sa.Integer(), server_default='100'),
        sa.Column('enabled', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['policy_id'], ['policies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['policy_version_id'], ['policy_versions.id']),
        sa.UniqueConstraint('policy_id', 'target_type', 'target_id', name='uq_policy_assignments'),
    )
    op.create_index('idx_policy_assignments_target', 'policy_assignments', ['target_type', 'target_id', 'enabled'])
    
    # Requests
    op.create_table(
        'requests',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('trace_id', sa.String(64), nullable=False, unique=True),
        sa.Column('org_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('app_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('env_id', postgresql.UUID(as_uuid=True)),
        sa.Column('user_id', sa.String(255)),
        sa.Column('session_id', sa.String(255)),
        sa.Column('scope', postgresql.ENUM('llm.input', 'llm.output', 'tool.call', 'tool.result', 'data.access', 'all', name='policy_scope', create_type=False), nullable=False),
        sa.Column('input_hash', sa.String(64)),
        sa.Column('input_preview', sa.String(500)),
        sa.Column('token_count', sa.Integer()),
        sa.Column('model', sa.String(100)),
        sa.Column('metadata', postgresql.JSON(astext_type=sa.Text()), server_default='{}'),
        sa.Column('ip_address', postgresql.INET()),
        sa.Column('user_agent', sa.String()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
    )
    op.create_index('idx_requests_created_at', 'requests', ['created_at'])
    op.create_index('idx_requests_app_env', 'requests', ['app_id', 'env_id', 'created_at'])
    op.create_index('idx_requests_user', 'requests', ['org_id', 'user_id', 'created_at'])
    
    # Decisions
    op.create_table(
        'decisions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('request_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('trace_id', sa.String(64), nullable=False),
        sa.Column('policy_id', postgresql.UUID(as_uuid=True)),
        sa.Column('policy_version_id', postgresql.UUID(as_uuid=True)),
        sa.Column('policy_version_hash', sa.String(64)),
        sa.Column('action', sa.String(20), nullable=False),
        sa.Column('reason', sa.Text()),
        sa.Column('confidence', sa.Float()),
        sa.Column('latency_ms', sa.Integer()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['request_id'], ['requests.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['policy_id'], ['policies.id']),
        sa.ForeignKeyConstraint(['policy_version_id'], ['policy_versions.id']),
    )
    op.create_index('idx_decisions_trace', 'decisions', ['trace_id'])
    
    # Violations
    op.create_table(
        'violations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('request_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('trace_id', sa.String(64), nullable=False),
        sa.Column('check_name', sa.String(100), nullable=False),
        sa.Column('check_version', sa.String(20)),
        sa.Column('severity', sa.String(20), nullable=False),
        sa.Column('category', sa.String(50)),
        sa.Column('message', sa.Text()),
        sa.Column('evidence', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('location_start', sa.Integer()),
        sa.Column('location_end', sa.Integer()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['request_id'], ['requests.id'], ondelete='CASCADE'),
    )
    op.create_index('idx_violations_severity', 'violations', ['severity', 'created_at'])
    op.create_index('idx_violations_check', 'violations', ['check_name', 'created_at'])
    
    # Incidents
    op.create_table(
        'incidents',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('org_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('violation_ids', postgresql.ARRAY(postgresql.UUID(as_uuid=True)), nullable=False),
        sa.Column('status', postgresql.ENUM('open', 'investigating', 'resolved', 'false_positive', name='incident_status', create_type=False), server_default='open'),
        sa.Column('severity', sa.String(20), nullable=False),
        sa.Column('assigned_to', postgresql.UUID(as_uuid=True)),
        sa.Column('resolved_at', sa.DateTime(timezone=True)),
        sa.Column('resolution_notes', sa.Text()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['org_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['assigned_to'], ['users.id']),
    )
    
    # Incident Notes
    op.create_table(
        'incident_notes',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('incident_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True)),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['incident_id'], ['incidents.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
    )
    
    # Create triggers for updated_at
    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)
    
    op.execute("""
        CREATE TRIGGER update_organizations_updated_at
        BEFORE UPDATE ON organizations
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    """)
    
    op.execute("""
        CREATE TRIGGER update_apps_updated_at
        BEFORE UPDATE ON apps
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    """)
    
    op.execute("""
        CREATE TRIGGER update_policies_updated_at
        BEFORE UPDATE ON policies
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    """)
    
    op.execute("""
        CREATE TRIGGER update_policy_assignments_updated_at
        BEFORE UPDATE ON policy_assignments
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    """)
    
    op.execute("""
        CREATE TRIGGER update_incidents_updated_at
        BEFORE UPDATE ON incidents
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    """)
    
    # Set array defaults (using raw SQL to avoid asyncpg parameterization issues)
    op.execute("ALTER TABLE api_keys ALTER COLUMN scopes SET DEFAULT ARRAY[]::TEXT[]")
    op.execute("ALTER TABLE apps ALTER COLUMN owners SET DEFAULT ARRAY[]::UUID[]")
    op.execute("ALTER TABLE policies ALTER COLUMN tags SET DEFAULT ARRAY[]::TEXT[]")
    op.execute("ALTER TABLE incidents ALTER COLUMN violation_ids SET DEFAULT ARRAY[]::UUID[]")


def downgrade() -> None:
    # Drop triggers
    op.execute("DROP TRIGGER IF EXISTS update_incidents_updated_at ON incidents")
    op.execute("DROP TRIGGER IF EXISTS update_policy_assignments_updated_at ON policy_assignments")
    op.execute("DROP TRIGGER IF EXISTS update_policies_updated_at ON policies")
    op.execute("DROP TRIGGER IF EXISTS update_apps_updated_at ON apps")
    op.execute("DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations")
    op.execute("DROP FUNCTION IF EXISTS update_updated_at()")
    
    # Drop tables in reverse order
    op.drop_table('incident_notes')
    op.drop_table('incidents')
    op.drop_table('violations')
    op.drop_table('decisions')
    op.drop_table('requests')
    op.drop_table('policy_assignments')
    op.drop_table('policy_versions')
    op.drop_table('policies')
    op.drop_table('environments')
    op.drop_table('apps')
    op.drop_table('api_keys')
    op.drop_table('users')
    op.drop_table('organizations')
    
    # Drop enums
    op.execute("DROP TYPE IF EXISTS incident_status")
    op.execute("DROP TYPE IF EXISTS policy_scope")
    op.execute("DROP TYPE IF EXISTS policy_status")

