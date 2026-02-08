import pandas as pd

def generate_dashboard_data(df: pd.DataFrame):
    """
    Takes the cleaned, categorized DataFrame and calculates
    all 4 sections for the Frontend.
    """
    
    # --- SECTION 1: SUMMARY CARDS ---
    # Total Income: Sum of all positive amounts (excluding internal savings transfers if possible)
    # the positive and negative amounts are determined in the normalizer, so we can directly sum them here.
    total_income = df[df['amount'] > 0]['amount'].sum()
    
    # Total Expenses: Sum of all negative amounts
    total_expenses = abs(df[df['amount'] < 0]['amount'].sum())
    
    # Net Saving: 
    # Option A: Income - Expenses (Net Cash Flow)
    net_saving = total_income - total_expenses
    total_transactions = len(df)

    # --- SECTION 2: SPENDING OVERVIEW (Bar Chart) ---
    # Group by Category and sum amount. 
    # Filter for expenses only (amount < 0)
    spending_df = df[df['amount'] < 0].copy()
    spending_df['abs_amount'] = spending_df['amount'].abs()
    category_summary = spending_df.groupby('category')['abs_amount'].sum().to_dict()

    # --- SECTION 4: INSIGHTS (The Colorful Squares) ---
    insights = []
    
    # Insight 1: Saving Rate
    saving_rate = (net_saving / total_income * 100) if total_income > 0 else 0
    if saving_rate > 20:
        insights.append({"title": "Great Saving Rate", "value": f"{saving_rate:.1f}%", "color": "green", "desc": "You're saving effectively!"})
    elif saving_rate > 0:
         insights.append({"title": "Positive Flow", "value": f"{saving_rate:.1f}%", "color": "blue", "desc": "You're spending less than you earn."})
    else:
         insights.append({"title": "High Spending", "value": f"{saving_rate:.1f}%", "color": "red", "desc": "Expenses exceeded income this period."})

    # Insight 2: Top Expense
    if category_summary:
        top_cat = max(category_summary, key=category_summary.get)
        insights.append({"title": "Top Spending", "value": top_cat, "color": "orange", "desc": f"Highest expense category."})

    return {
        "summary": {
            "total_income": round(total_income, 2),
            "total_expenses": round(total_expenses, 2),
            "net_saving": round(net_saving, 2),
            "total_transactions": total_transactions
        },
        "overview": category_summary,  # For the Bar Chart
        "insights": insights           # For the Colorful Squares
    }