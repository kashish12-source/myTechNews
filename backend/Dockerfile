FROM python:3.11-slim

WORKDIR /workspace

# Copy requirements list first to cache dependency installation layer
COPY requirements.txt /workspace/backend/requirements.txt

# Install dependencies
RUN pip install --no-cache-dir -r /workspace/backend/requirements.txt

# Copy backend codebase
COPY . /workspace/backend

# Set Python Path to workspace root to resolve backend.app module imports
ENV PYTHONPATH=/workspace
ENV PORT=3001

EXPOSE 3001

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "3001"]
