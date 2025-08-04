from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
import pandas as pd
import io
import json


app = FastAPI()

class CleanRequest(BaseModel):
    file_path: str
    script_content: str

@app.get("/health")
def read_root():
    return {"status": "Data ENgine is running"}

@app.post("/clean")
def clean_data(request: CleanRequest):
    try:
        df = pd.read_csv(request.file_path)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")
    
    try: 
        exec(request.script_content, {'df': df})
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error executing script: {str(e)}")
    
    cleaned_json_string = df.to_json(orient='records')
    return json.loads(cleaned_json_string)