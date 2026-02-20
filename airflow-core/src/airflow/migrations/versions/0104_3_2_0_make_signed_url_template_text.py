#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

"""
Make signed_url_template TEXT to allow for longer signed URL templates.

The signed_url_template column in dag_bundle was VARCHAR(200), which is too short
when using bundles with long bucket names or prefixes (e.g., S3DagBundle), causing
a StringDataRightTruncation error on insert.

Revision ID: a2eda14b6ea8
Revises: f8c9d7e6b5a4
Create Date: 2026-02-20 00:00:00.000000

"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "a2eda14b6ea8"
down_revision = "f8c9d7e6b5a4"
branch_labels = None
depends_on = None
airflow_version = "3.2.0"


def upgrade():
    """Change signed_url_template column in dag_bundle from VARCHAR(200) to TEXT."""
    with op.batch_alter_table("dag_bundle", schema=None) as batch_op:
        batch_op.alter_column(
            "signed_url_template",
            existing_type=sa.String(length=200),
            type_=sa.Text(),
            existing_nullable=True,
        )


def downgrade():
    """Revert signed_url_template column in dag_bundle from TEXT to VARCHAR(200)."""
    with op.batch_alter_table("dag_bundle", schema=None) as batch_op:
        batch_op.alter_column(
            "signed_url_template",
            existing_type=sa.Text(),
            type_=sa.String(length=200),
            existing_nullable=True,
        )
