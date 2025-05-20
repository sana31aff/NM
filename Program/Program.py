# AI in Energy Efficiency Optimization Report Generator (User Inputs "Before" Values)

def print_section(title, symbol="="):
    print(f"\n{title}")
    print(symbol * len(title))

def display_table(headers, data):
    col_widths = [max(len(str(item)) for item in col) for col in zip(headers, *data)]
    format_str = " | ".join(f"{{:<{w}}}" for w in col_widths)
    print(format_str.format(*headers))
    print("-" * (sum(col_widths) + 3 * (len(headers) - 1)))
    for row in data:
        print(format_str.format(*row))

def get_before_input():
    print("\n🔧 Please enter your system's BEFORE optimization values:")
    be = float(input(" Average Energy Consumption (in kWh/month): "))
    bp = float(input(" Peak Load (in kW): "))
    bco2 = float(input(" CO₂ Emissions (in tons/year): "))
    return be, bp, bco2

def generate_report():
    print_section(" Final Output Report: AI in Energy Efficiency Optimization")

    print_section(" Project Objective", "-")
    print("To develop an AI-driven system that analyzes, predicts, and optimizes energy consumption\n"
          "across selected systems or environments, leading to significant energy savings and improved sustainability.")

    print_section("AI Techniques Used", "-")
    ai_techniques = [
        "- Linear Regression & Random Forest for consumption prediction",
        "- K-Means Clustering for load pattern detection",
        "- Reinforcement Learning for real-time energy control",
        "- Isolation Forest for anomaly detection"
    ]
    for technique in ai_techniques:
        print(technique)

    # Get user input (before values only)
    be, bp, bco2 = get_before_input()

    # Assumed AI improvements
    energy_improve = 35.0   # %
    peak_improve = 38.0     # %
    co2_improve = 38.5      # %
    pred_accuracy = 92.3    # %

    # Calculate "after" values
    ae = round(be * (1 - energy_improve / 100), 2)
    ap = round(bp * (1 - peak_improve / 100), 2)
    aco2 = round(bco2 * (1 - co2_improve / 100), 2)

    print_section("Performance Metrics", "-")
    headers = ["Parameter", "Before AI", "After AI", "Improvement"]
    data = [
        ["Average Energy Consumption", f"{be} kWh/month", f"{ae} kWh/month", f"{energy_improve}%"],
        ["Peak Load", f"{bp} kW", f"{ap} kW", f"{peak_improve}%"],
        ["Prediction Accuracy", "N/A", f"{pred_accuracy}%", "—"],
        ["CO₂ Emissions", f"{bco2} tons/year", f"{aco2} tons/year", f"{co2_improve}%"]
    ]
    display_table(headers, data)

    print_section("Conclusion", "-")
    print("The AI-based energy efficiency system significantly outperforms traditional manual optimization by providing\n"
          "data-driven, automated, and adaptive strategies. The model can be scaled to buildings, data centers, or industrial setups.")

# Run the report generator
generate_report()
