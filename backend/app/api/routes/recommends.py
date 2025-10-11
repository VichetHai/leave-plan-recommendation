import pandas as pd
from sklearn.ensemble import RandomForestRegressor

from typing import Any
from fastapi import APIRouter

from app.api.deps import CurrentUser, SessionDep
from app.models import Message


class RecommendLeavePlanRouter:
    def __init__(self):
        self.router = APIRouter(
            prefix="/recommends",
            tags=["recommends"]
        )
        
        self.router.add_api_route(
            "/leave-plan",
            self.recommend_leave_plan,
            methods=["GET"],
            response_model=Message,
        )

    # ---------------------------
    # Endpoint
    # ---------------------------
    def recommend_leave_plan(
        self, session: SessionDep, current_user: CurrentUser
    ) -> Any:
        """
        Retrieve items.
        """
        data = self.generate_leave_data()
        _, data = self.train_leave_model(data)
        recommendations = self.recommend_leave_days(data, N=18)
        print("Top recommended leave days for:")
        print(recommendations[["day_of_year", "is_bridge",  "team_workload",  "preference_score", "predicted_score"]])
        return Message(message="Leave Recommend Class")
        
    # ---------------------------
    # Helper methods
    # ---------------------------
    def get_holidays(self, data):
        public_holidays = ["2025-01-01", "2025-01-14", "2025-01-07"]
        holidays = pd.to_datetime(public_holidays)
        data["is_holiday"] = data["date"].isin(holidays) | data["weekday"].isin([5,6])
        return data

    def find_bridge_days(self, data):
        data = data.sort_values("date").reset_index(drop=True)
        bridge_day = []
        for i in range(len(data)):
            if data.loc[i, "is_holiday"]:
                bridge_day.append(False)
            elif (i > 0 and data.loc[i-1, "is_holiday"]) and (i < len(data)-1 and data.loc[i+1, "is_holiday"]):
                bridge_day.append(True)
            else:
                bridge_day.append(False)
        data["is_bridge"] = bridge_day
        return data

    def get_team_workloads(self, data):
        team_workload_dict = {
            "2025-01-06": 5,
            "2025-01-02": 3,
            "2025-01-03": 2,
        }
        team_workload_dict = {pd.to_datetime(k): v for k, v in team_workload_dict.items()}
        data["team_workload"] = data["date"].map(team_workload_dict).fillna(data["team_workload"])
        return data

    def set_recommend_rule(self, data):
        total_team = 6
        percentage = 0.5
        data["preference_score"] = (
            (data["weekday"].isin([0, 4])).astype(int) * 1 +  # Monday/Friday bonus
            (data["is_bridge"]).astype(int) * 2 +  # bridge day bonus
            (data["team_workload"] <= total_team * percentage).astype(int) * 1  # 50% workload bonus
        )
        return data

    def generate_leave_data(self, year=2025):
        days = pd.date_range(f"{year}-01-01", periods=365)
        data = pd.DataFrame({
            "day_of_year": days.dayofyear,
            "date": days,
            "weekday": days.weekday,
            "team_workload": 0,
        })
        data = self.get_holidays(data)
        data = self.find_bridge_days(data)
        data = self.get_team_workloads(data)
        data = self.set_recommend_rule(data)
        return data

    def train_leave_model(self, data):
        X = data[["day_of_year", "team_workload"]]
        y = data["preference_score"]
        model = RandomForestRegressor(n_estimators=50, random_state=42)
        model.fit(X, y)
        data["predicted_score"] = model.predict(X)
        return model, data

    def recommend_leave_days(self, data, N=18, min_gap=2, max_workload=4):
        selected_days = []
        sorted_data = data.sort_values("predicted_score", ascending=False)
        for _, row in sorted_data.iterrows():
            if all(abs(row.day_of_year - d) > min_gap for d in selected_days):
                if row.team_workload <= max_workload:
                    selected_days.append(row.day_of_year)
                    if len(selected_days) == N:
                        break
        recommendations = data[data.day_of_year.isin(selected_days)].sort_values("day_of_year")
        return recommendations

router = RecommendLeavePlanRouter().router