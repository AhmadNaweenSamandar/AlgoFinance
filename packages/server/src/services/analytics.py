import pandas as pd


def generate_dashboard_data(df: pd.DataFrame):
    """
    Takes the cleaned, categorized DataFrame and calculates
    all 4 sections for the Frontend.
    """

    # --- SECTION 1: SUMMARY CARDS ---
    # Total Income: Sum of all positive amounts (excluding internal savings transfers if possible)
    # the positive and negative amounts are determined in the normalizer, so we can directly sum them here.
    total_income = df[df["amount"] > 0]["amount"].sum()

    # Total Expenses: Sum of all negative amounts
    total_expenses = abs(df[df["amount"] < 0]["amount"].sum())

    # Net Saving:
    # Option A: Income - Expenses (Net Cash Flow)
    net_saving = total_income - total_expenses
    total_transactions = len(df)

    # --- SECTION 2: SPENDING (Insights) OVERVIEW for (Bar Chart) in InsightsCharts ---

    # 1. Filter for expenses and get absolute values
    spending_df = df[df["amount"] < 0].copy()
    spending_df["abs_amount"] = spending_df["amount"].abs()

    # 2. Group by category and sum the amounts
    category_grouped = spending_df.groupby("category")["abs_amount"].sum()

    # 3. Calculate total spending to find the percentages
    total_spending = category_grouped.sum()

    # 4. Define Hex colors matching your frontend Tailwind theme
    # (Recharts/Chart.js usually require hex codes, not Tailwind class names)
    CATEGORY_COLORS = {
        "Food": "#10b981",  # Emerald
        "Transport": "#f97316",  # Orange
        "Utilities": "#eab308",  # Yellow
        "Loans": "#ef4444",  # Red
        "Entertainment": "#a855f7",  # Purple
        "Transfers": "#069ea3",  # violet
        "Dining": "#BD0019",  # DarkRed
        "Shopping": "#8B008B",  # DarkMagenta
        "Health": "#3b82f6",  # Blue
        "Income": "#00802f",  # Dark Green
        "Benefits": "#ec4899",  # Pink
        "Bills": "#b17000",  # Amber
        "Cash": "#1A3977",  # Gray
        "Other": "#9ca3af",  # Light Gray
    }

    overview_list = []

    # 5. Build the exact array structure the frontend interface demands
    for cat, amt in category_grouped.items():
        # Calculate percentage (with a safety check to avoid division by zero)
        pct = (amt / total_spending * 100) if total_spending > 0 else 0

        overview_list.append(
            {
                "category": str(cat),
                "amount": round(amt, 2),
                "percentage": round(pct, 1),
                "color": CATEGORY_COLORS.get(
                    str(cat), "#cbd5e1"
                ),  # Default slate color if not found
            }
        )

    # 6. Sort the list from highest spending to lowest (Looks much better in charts!)
    overview_list = sorted(overview_list, key=lambda x: x["amount"], reverse=True)

    # --- SECTION 4: INSIGHTS (The Colorful Squares) ---
    insights = []

    # Insight 1: Saving Rate (UPGRADED)
    saving_rate = (net_saving / total_income * 100) if total_income > 0 else 0
    if saving_rate > 20:
        insights.append(
            {
                "title": "Exceptional Savings",
                "value": f"{saving_rate:.1f}%",
                "color": "green",
                "desc": "You are retaining a substantial portion of your income, successfully building a strong financial safety net.",
            }
        )
    elif saving_rate > 0:
        insights.append(
            {
                "title": "Positive Cash Flow",
                "value": f"{saving_rate:.1f}%",
                "color": "blue",
                "desc": "Your income exceeds your expenses. Consider pushing this rate closer to the 20% benchmark for optimal wealth growth.",
            }
        )
    else:
        insights.append(
            {
                "title": "Deficit Warning",
                "value": f"{saving_rate:.1f}%",
                "color": "red",
                "desc": "Your expenses exceeded your income this period. Review your discretionary spending to close this gap and avoid debt.",
            }
        )

    # Insight 2: Top Expense Category (UPGRADED)
    if overview_list:
        top_cat = overview_list[0]["category"]
        top_amount = overview_list[0].get("amount", 0)

        insights.append(
            {
                "title": "Primary Expenditure",
                "value": top_cat,
                "color": "orange",
                "desc": f"At ${top_amount:.2f}, this is your heaviest spending area. Reducing costs here will have the highest immediate impact on your savings.",
            }
        )

        # Insight 3: Goal Progress
    # Dynamically sets a goal to save 20% of the month's total income
    if total_income > 0:
        target_saving = total_income * 0.20

        if net_saving >= target_saving:
            # They hit or exceeded the 20% goal
            insights.append(
                {
                    "title": "Goal Surpassed",
                    "value": "100%",
                    "color": "emerald",
                    "desc": f"You exceeded the recommended 20% savings target. You successfully secured ${net_saving:,.2f} this period.",
                }
            )
        elif net_saving > 0:
            # They saved money, but haven't hit the 20% threshold yet
            progress_pct = (net_saving / target_saving) * 100
            insights.append(
                {
                    "title": "Goal Progress",
                    "value": f"{progress_pct:.1f}%",
                    "color": "blue",
                    "desc": f"You are {progress_pct:.1f}% of the way to a healthy savings target of ${target_saving:,.2f}. Keep optimizing your expenses!",
                }
            )
        else:
            # They spent more than they made, so progress is 0
            insights.append(
                {
                    "title": "Goal Off-Track",
                    "value": "0%",
                    "color": "red",
                    "desc": f"Expenses outpaced income this period. Your baseline goal for the next cycle should be saving ${target_saving:,.2f}.",
                }
            )

    return {
        "summary": {
            "total_income": round(total_income, 2),
            "total_expenses": round(total_expenses, 2),
            "net_saving": round(net_saving, 2),
            "total_transactions": total_transactions,
        },
        "overview": overview_list,  # For the Bar Chart
        "insights": insights,  # For the Colorful Squares
    }
