import pandas as pd
import random

# --- 1. Define the "DNA" of our Data ---
# We map Categories to common Vendors/Keywords
categories = {
    "Income": [
        "PAYROLL DEPOSIT", "DIRECT DEP", "EMPLOYER INC", "E-TRANSFER RECEIVED", 
        "CRA RIT", "TAX REFUND", "INTEREST PAID", "DIVIDEND", "BONUS PAY"
    ],
    "Transport": [
        "UBER * TRIP", "LYFT RIDE", "PRESTO LOAD", "SHELL STATION", "ESSO GAS", 
        "PETRO CANADA", "MTO LICENSE", "PARKING INDIGO", "GREEN P PARKING", 
        "407 ETR", "GO TRANSIT", "EXXON MOBIL", "BP GAS", "CHEVRON"
    ],
    "Food": [
        "MCDONALDS", "STARBUCKS COFFEE", "TIM HORTONS", "SUBWAY SANDWICH", 
        "BURGER KING", "KFC", "POPEYES", "DOMINOS PIZZA", "PIZZA HUT", 
        "UBER EATS", "DOORDASH", "SKIP THE DISHES", "METRO #", "LOBLAWS", 
        "FRESHCO", "NO FRILLS", "WHOLE FOODS", "SOBEYS", "FARM BOY"
    ],
    "Utilities": [
        "HYDRO OTTAWA", "ENBRIDGE GAS", "ROGERS MOBILE", "BELL CANADA", 
        "TELUS MOBILITY", "FIDO SOLUTIONS", "VIRGIN MOBILE", "CITY OF OTTAWA WATER", 
        "AWS WEB SERVICES", "GOOGLE STORAGE", "APPLE ICLOUD", "DROPBOX"
    ],
    "Entertainment": [
        "NETFLIX.COM", "SPOTIFY PREMIUM", "DISNEY PLUS", "APPLE TV", 
        "CINEPLEX ODEON", "STEAM GAMES", "PLAYSTATION NETWORK", "XBOX LIVE", 
        "TICKETMASTER", "EVENTBRITE", "YOUTUBE PREMIUM", "AUDIBLE", "AMAZON MUSIC",
        "AMAZON PRIME VIDEO"
    ],
    "Shopping": [
        "AMZN MKTP", "AMAZON.CA", "WALMART STORE", "COSTCO WHOLESALE", 
        "BEST BUY", "APPLE STORE", "DOLLARAMA", "CANADIAN TIRE", "HOMEDEPOT", 
        "IKEA", "H&M CLOTHING", "ZARA", "UNIQLO", "SEPHORA", "NIKE STORE"
    ],
    "Health": [
        "GOODLIFE FITNESS", "LA FITNESS", "ANYTIME FITNESS", "SHOPPERS DRUG MART", 
        "REXALL PHARMACY", "DENTIST", "OPTOMETRIST", "PHYSIO CLINIC", 
        "RMT MASSAGE", "HOSPITAL PARKING"
    ],
    "Savings": [
        "TRANSFER TO SAV", "TFSA CONTRIBUTION", "RRSP CONTRIB", "WEALTHSIMPLE", 
        "QUESTRADE FUNDING", "AUTO-SAVE", "SAVINGS DEPOSIT"
    ]
}

# Noise to make it look like real bank statements (e.g., "Store #123", "Toronto ON")
locations = ["TORONTO", "OTTAWA", "MISSISSAUGA", "VANCOUVER", "MONTREAL", "CALGARY", "ON", "BC", "QC"]
codes = ["#", "ID:", "STORE", "POS"]

def generate_messy_description(vendor):
    """
    Takes a clean vendor name and messes it up 
    (e.g., 'Starbucks' -> 'STARBUCKS COFFEE #4928 TORONTO')
    """
    # 30% chance to keep it clean
    if random.random() < 0.3:
        return vendor
    
    # 70% chance to add noise
    suffix = ""
    
    # Add a random store number?
    if random.random() < 0.5:
        suffix += f" #{random.randint(100, 9999)}"
    
    # Add a location?
    if random.random() < 0.5:
        suffix += f" {random.choice(locations)}"
        
    # Add random gibberish numbers?
    if random.random() < 0.2:
        suffix += f" {random.randint(100000, 999999)}"

    return f"{vendor}{suffix}"

# --- 2. Generate the Dataset ---
data = []
TARGET_ROWS = 1500 # Let's generate 1,500 rows for good training

print(f"Generating {TARGET_ROWS} rows of synthetic training data...")

for _ in range(TARGET_ROWS):
    # 1. Pick a random category (weighted to make Food/Shopping more common)
    cat_keys = list(categories.keys())
    # Weights: Income(5%), Transport(10%), Food(30%), Utils(10%), Ent(10%), Shop(20%), Health(5%), Save(10%)
    weights = [0.05, 0.1, 0.3, 0.1, 0.1, 0.2, 0.05, 0.1]
    
    chosen_cat = random.choices(cat_keys, weights=weights, k=1)[0]
    
    # 2. Pick a vendor from that category
    chosen_vendor = random.choice(categories[chosen_cat])
    
    # 3. Mess it up
    messy_desc = generate_messy_description(chosen_vendor)
    
    # 4. Add to list
    data.append({"description": messy_desc, "category": chosen_cat})

# --- 3. Save to Excel ---
df = pd.DataFrame(data)

# Shuffle the data so categories aren't grouped together
df = df.sample(frac=1).reset_index(drop=True)

output_file = "training_data.xlsx"
df.to_excel(output_file, index=False)

print(f"Success! Created '{output_file}' with {len(df)} rows.")