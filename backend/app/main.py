from fastapi import FastAPI

app = FastAPI(title="Shoe store API")


@app.get("/health")
def health():
    return {"status": "healthy"}