import pandas as pd
from fastapi import HTTPException

def kpis_por_periodo(df: pd.DataFrame):
    if df is None or df.empty:
        raise HTTPException(status_code=422, detail="No hay datos para KPIs")

    if "periodo" not in df.columns:
        raise HTTPException(status_code=422, detail="Columna 'periodo' no encontrada")

    event_col = next(
        (c for c in df.columns if c.lower() in ["event", "evento", "type"]),
        None
    )

    if not event_col:
        raise HTTPException(status_code=422, detail="Columna de eventos no encontrada")

    df[event_col] = df[event_col].astype(str)

    result = {}

    for periodo in df["periodo"].dropna().unique():
        d = df[df["periodo"] == periodo]

        eventos = d[event_col]

        data = {
            "eventos": int(len(d)),
            "pases": int(eventos.str.contains("pase", case=False).sum()),
            "tiros": int(eventos.str.contains("shot|tiro|remate", case=False).sum()),
            "goles": int(eventos.str.contains("goal|gol", case=False).sum()),
        }

        if "xg" in d.columns:
            data["xg_total"] = float(
                pd.to_numeric(d["xg"], errors="coerce").sum()
            )

        result[periodo] = data

    return result
