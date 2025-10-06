import pandas as pd
from sklearn.ensemble import RandomForestRegressor


def get_holidays(data):
    # TODO:: query from database
    public_holidays = ["2025-01-01", "2025-01-14", "2025-1-7"]

    holidays = pd.to_datetime(public_holidays)
    data["is_holiday"] = data["date"].isin(holidays) | data["weekday"].isin([5,6])  # Sat or Sun
    return data


def find_bridge_days(data):
    data = data.sort_values("date").reset_index(drop=True)
    bridge_day = []
    for i in range(len(data)):
        if data.loc[i, "is_holiday"]:
            bridge_day.append(False)  # already a holiday
        elif (i > 0 and data.loc[i-1, "is_holiday"]) and (i < len(data)-1 and data.loc[i+1, "is_holiday"]):
            bridge_day.append(True)  # bridge day
        else:
            bridge_day.append(False)
    data["is_bridge"] = bridge_day
    return data


def get_team_workloads(data):
    # TODO:: query from database
    team_workload_dict = {
        "2025-01-06": 5,  # heavy workload
        "2025-01-02": 3,
        "2025-01-03": 2,
    }

    team_workload_dict = {pd.to_datetime(k): v for k, v in team_workload_dict.items()}
    data["team_workload"] = data["date"].map(team_workload_dict).fillna(data["team_workload"]) 
    return data

def set_recommend_rule(data):
    # Recommend base on weekday (mon, fri), is_bridge holiday and lighter workload

    total_team = 6
    percentage = 0.5
    data["preference_score"] = (
        (data["weekday"].isin([0, 4])).astype(int) * 1 + # Monday/Friday bonus
        (data["is_bridge"]).astype(int) * 2 + # bridge day bonus
        (data["team_workload"] <= total_team * percentage).astype(int) * 1 # 50% workload bonus
    )
    return data

# ---------------------------
# 1. generate_leave_data
# ---------------------------
def generate_leave_data(year=2025):
    days = pd.date_range(f"{year}-01-01", periods=365)
    data = pd.DataFrame({
        "day_of_year": days.dayofyear,
        "date": days,
        "weekday": days.weekday,
        "team_workload": 0,  # 1=light, 5=heavy
    })
    data = get_holidays(data)
    data = find_bridge_days(data)
    data = get_team_workloads(data)
    data = set_recommend_rule(data)
    
    return data

# ---------------------------
# 2. Train Random Forest Model
# ---------------------------
def train_leave_model(data):
    X = data[["day_of_year", "team_workload"]]
    y = data["preference_score"]
    model = RandomForestRegressor(n_estimators=50, random_state=42)
    model.fit(X, y)
    data["predicted_score"] = model.predict(X)
    return model, data

# ---------------------------
# 3. Recommend top N leave days
# ---------------------------
def recommend_leave_days(data, N=18, min_gap=2, max_workload=4):
    selected_days = []
    sorted_data = data.sort_values("predicted_score", ascending=False)
    
    for _, row in sorted_data.iterrows():
        # Avoid clustering: gap of at least min_gap days
        if all(abs(row.day_of_year - d) > min_gap for d in selected_days):
            # Skip very heavy workload days
            if row.team_workload <= max_workload:
                selected_days.append(row.day_of_year)
                if len(selected_days) == N:
                    break
    recommendations = data[data.day_of_year.isin(selected_days)].sort_values("day_of_year")
    return recommendations

# ---------------------------
# 4. Main function to run everything
# ---------------------------
def main():
    data = generate_leave_data()
    _, data = train_leave_model(data)
    recommendations = recommend_leave_days(data, N=18)
    print("Top recommended leave days for:")
    print(recommendations[["day_of_year", "is_bridge",  "team_workload",  "preference_score", "predicted_score"]])

# ---------------------------
# Run
# ---------------------------
if __name__ == "__main__":
    main()
