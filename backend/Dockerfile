# Start with an official Python runtime as a parent image
FROM python:3.12-slim

# Set environmental variables
ENV PYTHONUNBUFFERED=true

# Set the working directory in the container
WORKDIR /code

# Update
RUN apt-get update && apt-get -y install libpq-dev gcc

# Copy poetry files
COPY pyproject.toml poetry.lock /code/

# Install poetry and project dependencies
RUN pip install poetry && \
    poetry config virtualenvs.create false && \
    poetry install --no-interaction --no-root --without dev

# Copy the project files into the container
COPY . /code

# Expose the port number that the application will listen on
EXPOSE 8000

# Start the server with uvicorn
CMD ["poetry", "run", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
