import os
import glob
import re

models_dir = "/Users/diptonath/Documents/GitHub/Beacon/backend/app/models"
for file_path in glob.glob(os.path.join(models_dir, "*.py")):
    with open(file_path, "r") as f:
        content = f.read()

    changed = False

    # FIX UUID
    if 'Mapped[UUID]' in content or 'Mapped[Optional[UUID]]' in content:
        content = re.sub(r'from uuid import uuid4(.*?)\n', r'from uuid import uuid4, UUID as PyUUID\1\n', content)
        if 'UUID as PyUUID' not in content:
            if 'from uuid import UUID' in content:
                 content = content.replace('from uuid import UUID', 'from uuid import UUID as PyUUID')
            else:
                 content = "import uuid\n" + content
                 content = content.replace('Mapped[UUID]', 'Mapped[uuid.UUID]')
                 content = content.replace('Mapped[Optional[UUID]]', 'Mapped[Optional[uuid.UUID]]')
        content = content.replace('Mapped[UUID]', 'Mapped[PyUUID]')
        content = content.replace('Mapped[Optional[UUID]]', 'Mapped[Optional[PyUUID]]')
        changed = True

    # FIX JSONB -> JSON
    if 'JSONB' in content:
        content = content.replace('from sqlalchemy.dialects.postgresql import UUID, JSONB', 'from sqlalchemy.dialects.postgresql import UUID\nfrom sqlalchemy import JSON')
        content = content.replace('JSONB', 'JSON')
        changed = True

    if changed:
        with open(file_path, "w") as f:
            f.write(content)
