import pandas as pd
from fastapi import HTTPException

def carril_por_y(y):
    if y < 33.33:
        return "izquierdo"
    elif y < 66.66:
        return "central"
    else:
        return "derecho"


def kpis_por_periodo(df_input: pd.DataFrame):
    if df_input is None or df_input.empty:
        raise HTTPException(status_code=422, detail="No hay datos para KPIs")

    df = df_input.copy()

    if "periodo" not in df.columns:
        raise HTTPException(status_code=422, detail="Columna 'periodo' no encontrada")

    df["periodo"] = df["periodo"].astype(str)

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
            "pases": int(eventos.str.contains("pase|centro|asistencia", case=False, na=False).sum()),
            "tiros": int(eventos.str.contains("shot|tiro|remate", case=False, na=False).sum()),
            "goles": int(eventos.str.contains(r"\b(?:goal|gol)\b", case=False, na=False, regex=True).sum()),
        }

        if "xg" in d.columns:
            data["xg_total"] = float(pd.to_numeric(d["xg"], errors="coerce").fillna(0).sum())
        else:
            data["xg_total"] = 0.0

        result[periodo] = data

    return result


def calcular_kpis(df):
    df = df.copy()
    event_col = next(
        (c for c in df.columns if c.lower() in ["event", "evento", "type"]),
        None
    )

    if not event_col:
        raise HTTPException(status_code=422, detail="Columna de eventos no encontrada")

    df_1t = df[df["periodo"].str.contains("1", case=False, na=False)]


    df_sin_1t = df[~df.index.isin(df_1t.index)]
  

    print(df_sin_1t[["periodo", event_col]].value_counts())
    # =======================
    # DEFINICIONES (ÚNICAS Y CORRECTAS)
    # =======================
    es_pase = df[event_col].str.contains("Pase|Centro|Asistencia", case=False, na=False)

    pase_exitoso = df[event_col].str.contains(
        "Pase completo|Pase entre lineas|Pase filtrado|Centro completo|Asistencia",
        case=False,
        na=False,
        regex=True
    )

    pase_fallido = df[event_col].str.contains(
        "Pase incompleto|Centro incompleto",
        case=False,
        na=False,
        regex=True
    )

    perdida_total = df[event_col].str.contains(
        "Pase incompleto|Centro incompleto|Balon aereo perdido|Duelo perdido|Regate fallido",
        case=False,
        na=False,
        regex=True
    )


    jugada_ganada = df[event_col].str.contains(
        "Pase completo|Pase entre lineas|Pase filtrado|Centro completo|Asistencia|Balon aereo ganado|Duelo ganado|Tiro|Remate|Gol",
        case=False,
        na=False,
        regex=True
    )

    # =======================
    # GENERAL
    # =======================
    total_eventos = len(df)
    pases = df[es_pase]
    pases_completados = df[es_pase & pase_exitoso]
    pases_fallidos = df[es_pase & pase_fallido]

    result = {
        "general": {
            "eventos": int(total_eventos),
            "pases_totales": int(len(pases)),
            "pases_completados": int(len(pases_completados)),
            "pct_pase_completado": round(len(pases_completados) / len(pases) * 100, 2) if len(pases) else 0,
            "pct_pase_perdido": round(len(pases_fallidos) / len(pases) * 100, 2) if len(pases) else 0,
            "pct_perdidas_totales": round(len(df[perdida_total]) / total_eventos * 100, 2) if total_eventos else 0,
            "pct_jugadas_ganadas": round(
                len(df[jugada_ganada]) / (len(df[jugada_ganada]) + len(df[perdida_total])) * 100, 2
            ) if (len(df[jugada_ganada]) + len(df[perdida_total])) else 0,
        },
        "por_periodo": {},
        "por_carril": {},
        "por_jugador": {},
        "pases_progresivos": {}
    }

    # =======================
    # POR PERIODO
    # =======================
    for periodo, d in df.groupby("periodo"):
        es_p = d[event_col].str.contains("Pase|Centro|Asistencia", case=False, na=False)
        ex = d[event_col].str.contains(
            "Pase completo|Pase entre lineas|Pase filtrado|Centro completo|Asistencia",
            case=False,
            na=False,
            regex=True
        )
        fa = d[event_col].str.contains(
            "Pase incompleto|Centro incompleto",
            case=False,
            na=False,
            regex=True
        )

        pases_p = d[es_p]

        result["por_periodo"][periodo] = {
            "eventos": int(len(d)),          # ← ESTO FALTABA
            "pases": int(len(pases_p)),
            "pct_completado": round(len(d[es_p & ex]) / len(pases_p) * 100, 2) if len(pases_p) else 0,
            "pct_perdida": round(len(d[es_p & fa]) / len(pases_p) * 100, 2) if len(pases_p) else 0,
        }


    # =======================
    # POR JUGADOR
    # =======================
    for jugador_id, d in df.groupby("id_jugador"):
        result["por_jugador"][int(jugador_id)] = {
            "jugador": d["jugador"].iloc[0] if "jugador" in d.columns else "Desconocido",
            "imagen_jugador": d["imagen_jugador"].iloc[0] if "imagen_jugador" in d.columns else "",
            "eventos_total": int(len(d)),
            "eventos_por_tipo": d[event_col].str.lower().value_counts().to_dict(),
            "xg": float(d["xg"].sum()) if "xg" in d.columns else 0.0,
        }

    # =======================
    # PASES PROGRESIVOS
    # =======================
    if {"x", "x2", "id_jugador"}.issubset(df.columns):
        progresivos = df[es_pase & ((df["x2"] - df["x"]) > 15)]
        ranking = progresivos.groupby("id_jugador").size().sort_values(ascending=False).head(10)
        result["pases_progresivos"] = {int(k): int(v) for k, v in ranking.items()}

    # =======================
    # CARRILES
    # =======================
    if "y" in df.columns:
        df["carril"] = df["y"].apply(carril_por_y)

  
        for carril, d in df.groupby("carril"):
            es_p = d[event_col].str.contains("Pase|Centro|Asistencia", case=False, na=False)

            ex = d[event_col].str.contains(
                "Pase completo|Pase entre lineas|Pase filtrado|Centro completo|Asistencia",
                case=False,
                na=False,
                regex=True
            )

            fa = d[event_col].str.contains(
                "Pase incompleto|Centro incompleto|Balon aereo perdido|Duelo perdido|Regate fallido",
                case=False,
                na=False,
                regex=True
            )

            pases_c = d[es_p]
            perdidas = d[fa]

            result["por_carril"][carril] = {
                "pct_completado": round(
                    len(d[es_p & ex]) / len(pases_c) * 100, 2
                ) if len(pases_c) else 0,
                "pct_perdida": round(
                    len(d[es_p & d[event_col].str.contains(
                        "Pase incompleto|Centro incompleto",
                        case=False,
                        na=False,
                        regex=True
                    )]) / len(pases_c) * 100, 2
                ) if len(pases_c) else 0,
            }


    return result
