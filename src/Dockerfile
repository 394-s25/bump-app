FROM python:3.9-slim

WORKDIR /bump-app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

CMD ["python", "API/app.py"]