import pandas as pd
from sklearn.ensemble import RandomForestRegressor

from typing import Any
from fastapi import APIRouter, Query

from app.api.deps import CurrentUser, SessionDep
from app.models import LeaveRecommendations
from app.leave_models.public_holiday_model import PublicHoliday
from sqlmodel import select
from datetime import datetime


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
            response_model=LeaveRecommendations,
        )

    # ---------------------------
    # Endpoint
    # ---------------------------
    def recommend_leave_plan(
        self,
        session: SessionDep,
        current_user: CurrentUser,
        year: int = Query(default=datetime.now().year, description="Year to generate leave recommendations")
    ) -> Any:
        """
        Retrieve items.
        """
        self.year = year

        data = self.generate_leave_data(session=session)
        _, data = self.train_leave_model(data)
        recommendations = self.recommend_leave_days(data, N=18)
        response_list = self.format_recommendations_for_response(recommendations)
        
        return LeaveRecommendations(data=response_list)
        
    # ---------------------------
    # Helper methods
    # ---------------------------
    def format_recommendations_for_response(self, recommendations):
        """
        Convert a DataFrame of recommended leave days to a list of dicts
        matching the Pydantic response model.
        """
        # Select only relevant columns
        response_df = recommendations[["date", "is_bridge", "team_workload", "preference_score", "predicted_score"]]

        # Rename columns to match Pydantic model
        response_df = response_df.rename(columns={"date": "leave_date"})

        # Convert to list of dicts for Pydantic
        response_list = response_df.to_dict(orient="records")
        return response_list
    
    def get_holidays(self, data, session):
        # public_holidays = ["2025-01-01", "2025-01-14", "2025-01-07"]
        statement = select(PublicHoliday.date).where(PublicHoliday.date.like(f"{self.year}-%"))
        results = session.exec(statement)
        public_holidays = results.all()
        print('public_holidays', public_holidays)

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
        # TODO:: integrate with database
        team_workload_dict = {
            "2025-01-06": 5,
            "2025-01-02": 3,
            "2025-01-03": 2,
        }
        team_workload_dict = {pd.to_datetime(k): v for k, v in team_workload_dict.items()}
        data["team_workload"] = data["date"].map(team_workload_dict).fillna(data["team_workload"])
        return data

    def set_recommend_rule(self, data):
        total_team = 6 # TODO:: integrate with database
        percentage = 0.5 # TODO:: integrate with database
        data["preference_score"] = (
            (data["weekday"].isin([0, 4])).astype(int) * 1 +  # Monday/Friday bonus
            (data["is_bridge"]).astype(int) * 2 +  # bridge day bonus
            (data["team_workload"] <= total_team * percentage).astype(int) * 1  # 50% workload bonus
        )
        return data

    def generate_leave_data(self, session):
        days = pd.date_range(f"{self.year}-01-01", periods=365)
        data = pd.DataFrame({
            "day_of_year": days.dayofyear,
            "date": days,
            "weekday": days.weekday,
            "team_workload": 0,
        })
        data = self.get_holidays(data, session)
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