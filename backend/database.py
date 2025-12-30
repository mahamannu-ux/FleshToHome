import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


# Create the directory if it doesn't exist (important for Docker!)
db_dir = "/app/data"
if not os.path.exists(db_dir) and os.getenv("K_SERVICE"):
    os.makedirs(db_dir)

# This check allows you to keep using your local DB while developing
# but switches to the /app/data path when deployed to Google Cloud.
if os.getenv("K_SERVICE"):  # K_SERVICE is automatically set by Cloud Run
    SQLALCHEMY_DATABASE_URL = "sqlite:////app/data/freshmeat.db"
else:
    SQLALCHEMY_DATABASE_URL = "sqlite:///./freshmeat.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Dependency to get a DB session for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
