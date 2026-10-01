from fastapi import FastAPI
from app.routers import products


app = FastAPI(title="Shoe store API")

app.include_router(products.router)


@app.get("/health")
def health():
    return {"status": "healthy"}