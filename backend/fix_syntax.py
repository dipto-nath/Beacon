import os
import glob

models_dir = "/Users/diptonath/Documents/GitHub/Beacon/backend/app/models"
for file_path in glob.glob(os.path.join(models_dir, "*.py")):
    with open(file_path, "r") as f:
        content = f.read()
        
    if "from sqlalchemy.dialects.postgresql import UUID, " in content:
        content = content.replace("from sqlalchemy.dialects.postgresql import UUID, ", "from sqlalchemy.dialects.postgresql import UUID")
        with open(file_path, "w") as f:
            f.write(content)
