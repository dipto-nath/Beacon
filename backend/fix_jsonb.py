import os
import glob

models_dir = "/Users/diptonath/Documents/GitHub/Beacon/backend/app/models"
for file_path in glob.glob(os.path.join(models_dir, "*.py")):
    with open(file_path, "r") as f:
        content = f.read()

    changed = False
    if "from sqlalchemy.dialects.postgresql import" in content and "JSONB" in content:
        content = content.replace("JSONB", "")
        if "from sqlalchemy import" in content:
            if "JSON," not in content and "JSON " not in content:
                content = content.replace("from sqlalchemy import (", "from sqlalchemy import (\n    JSON,")
        else:
            content = "from sqlalchemy import JSON\n" + content
        
        content = content.replace("mapped_column(JSONB", "mapped_column(JSON")
        content = content.replace(", JSONB", "")
        content = content.replace("JSONB,", "")
        changed = True

    if changed:
        with open(file_path, "w") as f:
            f.write(content)
