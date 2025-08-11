from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import io
import json

app = FastAPI()

class CleanRequest(BaseModel):
    file_path: str
    script_content: str

class ProfileRequest(BaseModel):
    file_path: str

@app.get("/health")
def read_root():
    return {"status": "Data Engine is running"}

@app.post("/clean")
def clean_data(payload: CleanRequest):
    # ... (this function is unchanged)
    try:
        df = pd.read_csv(payload.file_path)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found on the server.")
    try:
        exec(payload.script_content, {'df': df})
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error executing script: {str(e)}")
    cleaned_json_string = df.to_json(orient="records")
    return json.loads(cleaned_json_string)

@app.post("/profile")
def get_profile(payload: ProfileRequest):
    try:
        df = pd.read_csv(payload.file_path)

        num_rows, num_cols = df.shape

        info_df = pd.DataFrame({
            'Dtype': df.dtypes.astype(str),
            'Null_Count': df.isnull().sum()
        }).reset_index().rename(columns={'index': 'Column'})

        describe_df = df.describe(include='all').transpose().reset_index().rename(columns={'index': 'Column'})

        profile_df = pd.merge(info_df, describe_df, on='Column', how='left')

        # --- THIS IS THE FIX ---
        # Replace all NaN values with None, which correctly converts to null in JSON
        profile_df = profile_df.where(pd.notnull(profile_df), None)

        return {
            "general_info": {
                "rows": num_rows,
                "columns": num_cols
            },
            "column_profiles": profile_df.to_dict(orient='records')
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error profiling file: {str(e)}")