import pandas as pd

def infer_periodo(sheet_name: str) -> str:
    s = sheet_name.lower()
    s = s.replace(" ", "").replace("_", "").replace("-", "")

    if any(k in s for k in ["1er", "1ro", "primer", "1t", "tiempo1"]):
        return "1T"

    if any(k in s for k in ["2do", "segundo", "2t", "tiempo2"]):
        return "2T"

    if any(k in s for k in ["extra", "et", "tiempoextra"]):
        return "ET"

    return "1T"


def load_stats(file_path: str) -> pd.DataFrame:
    if file_path.lower().endswith(".xlsx"):
        xls = pd.ExcelFile(file_path)
        dfs = []

        for sheet in xls.sheet_names:
            df = xls.parse(sheet)

            if df.empty or len(df.columns) == 0:
                continue

            df.columns = df.columns.str.strip().str.lower()
            df["periodo"] = infer_periodo(sheet)

            # ✅ PRINT CORRECTO
            print("HOJA:", sheet, "→ periodo:", df["periodo"].iloc[0])

            dfs.append(df)

        if not dfs:
            raise ValueError("El archivo Excel no contiene hojas válidas")

        return pd.concat(dfs, ignore_index=True)

    # CSV
    df = pd.read_csv(file_path)
    if df.empty:
        raise ValueError("El CSV está vacío")
    df.columns = df.columns.str.strip().str.lower()
    df["periodo"] = "1T"
    return df


