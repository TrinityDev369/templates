---
name: data-analysis
description: Analyze datasets, generate statistical summaries, detect patterns, create
  visualizations, and produce structured reports. Use when working with CSV, JSON,
  or SQL data sources for exploratory data analysis, trend detection, outlier identification,
  correlation analysis, or building data-driven reports. Triggers on "analyze data",
  "data exploration", "summary statistics", "visualize", "generate report", "find trends",
  "detect outliers", "correlation".
---

# Data Analysis

Analyze structured data from CSV, JSON, and SQL sources. Produce statistical summaries, detect patterns, create visualizations, and deliver structured reports.

## Analysis Workflow

Follow these steps for every analysis task:

1. **Ingest** -- Load the data, identify format (CSV/JSON/SQL), confirm row count and column names.
2. **Profile** -- Run the data exploration checklist below. Understand shape, types, and quality.
3. **Clean** -- Handle missing values, fix types, remove duplicates, flag anomalies.
4. **Analyze** -- Apply appropriate statistical methods based on the question being asked.
5. **Visualize** -- Create charts that answer the question clearly. Follow the visualization guidelines.
6. **Report** -- Structure findings using the reporting template at the end of this skill.

## Data Exploration Checklist

Run through these checks on every new dataset before deeper analysis:

- [ ] **Shape**: Row count, column count (`df.shape`)
- [ ] **Schema**: Column names, data types (`df.dtypes`)
- [ ] **Nulls**: Missing value counts per column (`df.isnull().sum()`)
- [ ] **Duplicates**: Duplicate row count (`df.duplicated().sum()`)
- [ ] **Summary stats**: `df.describe()` for numeric columns, `df.describe(include='object')` for categorical
- [ ] **Cardinality**: Unique value counts for categorical columns (`df.nunique()`)
- [ ] **Distributions**: Histograms for numeric columns, value counts for categorical
- [ ] **Date range**: Min/max for any datetime columns
- [ ] **Sample rows**: First 5 and last 5 rows to spot formatting issues

### Quick Profile Script

```python
import pandas as pd

def profile_dataset(df: pd.DataFrame) -> dict:
    """Generate a comprehensive profile of the dataset."""
    profile = {
        "rows": len(df),
        "columns": len(df.columns),
        "dtypes": df.dtypes.value_counts().to_dict(),
        "missing": df.isnull().sum().to_dict(),
        "missing_pct": (df.isnull().sum() / len(df) * 100).round(2).to_dict(),
        "duplicates": int(df.duplicated().sum()),
        "numeric_summary": df.describe().to_dict(),
        "cardinality": df.nunique().to_dict(),
    }
    # Flag columns with >50% missing
    profile["high_missing"] = [
        col for col, pct in profile["missing_pct"].items() if pct > 50
    ]
    return profile
```

## Loading Data

### CSV

```python
import pandas as pd

# Basic load
df = pd.read_csv("data.csv")

# With options for common issues
df = pd.read_csv(
    "data.csv",
    encoding="utf-8",          # Try "latin-1" if utf-8 fails
    parse_dates=["date_col"],  # Auto-parse date columns
    na_values=["", "N/A", "null", "-"],
    dtype={"zip_code": str},   # Prevent numeric coercion
    low_memory=False,          # For large files with mixed types
)
```

### JSON

```python
# Flat JSON array
df = pd.read_json("data.json")

# Nested JSON -- normalize first
import json
with open("data.json") as f:
    raw = json.load(f)
df = pd.json_normalize(raw, record_path="items", meta=["source", "timestamp"])
```

### SQL

```python
import pandas as pd
import sqlite3  # or: import psycopg2, import sqlalchemy

# SQLite
conn = sqlite3.connect("database.db")
df = pd.read_sql("SELECT * FROM table_name", conn)
conn.close()

# PostgreSQL via SQLAlchemy
from sqlalchemy import create_engine
engine = create_engine(db_url)
df = pd.read_sql("SELECT * FROM table_name", engine)
```

## Statistical Methods

Choose methods based on the analytical question:

### Descriptive Statistics

| Measure | Function | When to Use |
|---------|----------|-------------|
| Central tendency | `df["col"].mean()`, `.median()`, `.mode()` | Summarize typical values |
| Spread | `df["col"].std()`, `.var()`, `.quantile([.25,.75])` | Understand variability |
| Distribution shape | `df["col"].skew()`, `.kurt()` | Check normality assumptions |
| Frequency | `df["col"].value_counts()` | Categorical breakdowns |

### Trend Detection

```python
# Time-series trend with rolling average
df["rolling_mean"] = df["value"].rolling(window=7).mean()

# Linear trend via numpy polyfit
import numpy as np
x = np.arange(len(df))
slope, intercept = np.polyfit(x, df["value"], 1)
trend_direction = "increasing" if slope > 0 else "decreasing"
trend_strength = abs(slope)

# Percent change period-over-period
df["pct_change"] = df["value"].pct_change()
```

### Outlier Identification

```python
# IQR method (robust to non-normal distributions)
Q1 = df["col"].quantile(0.25)
Q3 = df["col"].quantile(0.75)
IQR = Q3 - Q1
lower = Q1 - 1.5 * IQR
upper = Q3 + 1.5 * IQR
outliers = df[(df["col"] < lower) | (df["col"] > upper)]

# Z-score method (assumes roughly normal distribution)
from scipy import stats
z_scores = stats.zscore(df["col"].dropna())
outliers_z = df[abs(z_scores) > 3]
```

### Correlation Analysis

```python
# Pearson correlation matrix (linear relationships)
corr_matrix = df.select_dtypes(include="number").corr()

# Find strong correlations (|r| > 0.7)
strong = []
for i in range(len(corr_matrix.columns)):
    for j in range(i + 1, len(corr_matrix.columns)):
        r = corr_matrix.iloc[i, j]
        if abs(r) > 0.7:
            strong.append((corr_matrix.columns[i], corr_matrix.columns[j], round(r, 3)))

# Spearman rank correlation (non-linear monotonic relationships)
spearman_corr = df.select_dtypes(include="number").corr(method="spearman")
```

### Group Comparisons

```python
# Group-by aggregation
summary = df.groupby("category").agg(
    count=("value", "size"),
    mean=("value", "mean"),
    median=("value", "median"),
    std=("value", "std"),
).round(2)

# Pivot table for cross-tabulation
pivot = pd.pivot_table(
    df,
    values="revenue",
    index="region",
    columns="quarter",
    aggfunc=["sum", "mean"],
)
```

## Visualization Guidelines

### Chart Selection

| Question Type | Chart | When to Use |
|--------------|-------|-------------|
| Trend over time | **Line chart** | Continuous temporal data, 1-5 series |
| Category comparison | **Bar chart** | Comparing discrete groups, <15 categories |
| Distribution | **Histogram** | Numeric variable distribution, bin count matters |
| Relationship | **Scatter plot** | Two continuous variables, looking for correlation |
| Composition | **Stacked bar / pie** | Parts of a whole; prefer stacked bar over pie |
| Density / overlap | **Heatmap** | Correlation matrix, 2D frequency, large category grids |
| Distribution comparison | **Box plot** | Compare distributions across groups |
| Ranked values | **Horizontal bar** | Sorted comparison, long category labels |

### Chart Best Practices

- **Title every chart** with a clear statement of what it shows.
- **Label axes** with units (e.g., "Revenue (USD)", "Time (months)").
- **Start y-axis at zero** for bar charts to avoid misleading comparisons.
- **Limit series** to 5-7 per chart. Use "Other" to group the tail.
- **Sort bars** by value (not alphabetically) unless order is meaningful.
- **Use consistent colors** across related charts in the same report.
- **Add annotations** to call out key data points, thresholds, or events.
- **Remove chartjunk**: no 3D effects, no unnecessary gridlines, no decorative elements.
- **Size for readability**: minimum 10pt font for labels, adequate whitespace.

### Accessible Color Palettes

Use colorblind-friendly palettes. These work for most types of color vision deficiency:

```python
# Categorical (up to 8 groups)
PALETTE_CATEGORICAL = [
    "#4477AA",  # blue
    "#EE6677",  # red
    "#228833",  # green
    "#CCBB44",  # yellow
    "#66CCEE",  # cyan
    "#AA3377",  # purple
    "#BBBBBB",  # grey
    "#EE8866",  # orange
]

# Sequential (low to high)
PALETTE_SEQUENTIAL = "YlOrRd"  # matplotlib built-in, colorblind-safe

# Diverging (negative-neutral-positive)
PALETTE_DIVERGING = "RdYlBu"  # matplotlib built-in, colorblind-safe
```

### Python Visualization Patterns

#### Line Chart (Trends)

```python
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

fig, ax = plt.subplots(figsize=(10, 5))
ax.plot(df["date"], df["value"], color="#4477AA", linewidth=1.5, label="Actual")
ax.plot(df["date"], df["rolling_mean"], color="#EE6677", linewidth=1.5, linestyle="--", label="7-day avg")
ax.set_title("Daily Revenue Trend", fontsize=14, fontweight="bold")
ax.set_xlabel("Date")
ax.set_ylabel("Revenue (USD)")
ax.legend(frameon=False)
ax.xaxis.set_major_formatter(mdates.DateFormatter("%b %Y"))
ax.spines[["top", "right"]].set_visible(False)
plt.tight_layout()
plt.savefig("trend.png", dpi=150, bbox_inches="tight")
plt.show()
```

#### Bar Chart (Comparisons)

```python
fig, ax = plt.subplots(figsize=(8, 5))
bars = ax.bar(summary.index, summary["mean"], color="#4477AA", edgecolor="white", linewidth=0.5)
ax.bar_label(bars, fmt="%.0f", padding=3)
ax.set_title("Average Value by Category", fontsize=14, fontweight="bold")
ax.set_ylabel("Average Value")
ax.spines[["top", "right"]].set_visible(False)
plt.tight_layout()
plt.savefig("comparison.png", dpi=150, bbox_inches="tight")
plt.show()
```

#### Scatter Plot (Relationships)

```python
fig, ax = plt.subplots(figsize=(7, 7))
ax.scatter(df["x"], df["y"], alpha=0.5, s=30, color="#4477AA", edgecolors="white", linewidth=0.3)
# Trend line
z = np.polyfit(df["x"], df["y"], 1)
p = np.poly1d(z)
ax.plot(df["x"].sort_values(), p(df["x"].sort_values()), color="#EE6677", linestyle="--", linewidth=1.5)
ax.set_title(f"X vs Y (r={df['x'].corr(df['y']):.2f})", fontsize=14, fontweight="bold")
ax.set_xlabel("X")
ax.set_ylabel("Y")
ax.spines[["top", "right"]].set_visible(False)
plt.tight_layout()
plt.savefig("scatter.png", dpi=150, bbox_inches="tight")
plt.show()
```

#### Heatmap (Correlation Matrix)

```python
import seaborn as sns

fig, ax = plt.subplots(figsize=(8, 6))
sns.heatmap(
    corr_matrix,
    annot=True,
    fmt=".2f",
    cmap="RdYlBu",
    center=0,
    vmin=-1,
    vmax=1,
    square=True,
    linewidths=0.5,
    ax=ax,
)
ax.set_title("Correlation Matrix", fontsize=14, fontweight="bold")
plt.tight_layout()
plt.savefig("heatmap.png", dpi=150, bbox_inches="tight")
plt.show()
```

#### Histogram (Distribution)

```python
fig, ax = plt.subplots(figsize=(8, 5))
ax.hist(df["value"], bins=30, color="#4477AA", edgecolor="white", linewidth=0.5, alpha=0.8)
ax.axvline(df["value"].mean(), color="#EE6677", linestyle="--", linewidth=1.5, label=f"Mean: {df['value'].mean():.1f}")
ax.axvline(df["value"].median(), color="#228833", linestyle="--", linewidth=1.5, label=f"Median: {df['value'].median():.1f}")
ax.set_title("Distribution of Values", fontsize=14, fontweight="bold")
ax.set_xlabel("Value")
ax.set_ylabel("Frequency")
ax.legend(frameon=False)
ax.spines[["top", "right"]].set_visible(False)
plt.tight_layout()
plt.savefig("distribution.png", dpi=150, bbox_inches="tight")
plt.show()
```

## SQL Analysis Patterns

Use these patterns when analyzing data directly in a database.

### Aggregation with Grouping

```sql
SELECT
    category,
    COUNT(*)              AS row_count,
    ROUND(AVG(value), 2)  AS avg_value,
    ROUND(STDDEV(value), 2) AS std_value,
    MIN(value)            AS min_value,
    MAX(value)            AS max_value,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value) AS median_value
FROM dataset
GROUP BY category
ORDER BY avg_value DESC;
```

### Time-Series Aggregation

```sql
SELECT
    DATE_TRUNC('month', created_at)  AS month,
    COUNT(*)                         AS total,
    SUM(amount)                      AS total_amount,
    ROUND(AVG(amount), 2)            AS avg_amount
FROM transactions
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;
```

### Window Functions for Running Totals and Moving Averages

```sql
SELECT
    date,
    value,
    SUM(value) OVER (ORDER BY date)                                    AS running_total,
    ROUND(AVG(value) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) AS moving_avg_7d,
    value - LAG(value) OVER (ORDER BY date)                            AS day_over_day_change,
    ROUND((value - LAG(value) OVER (ORDER BY date))::numeric
        / NULLIF(LAG(value) OVER (ORDER BY date), 0) * 100, 2)        AS pct_change
FROM daily_metrics
ORDER BY date;
```

### CTEs for Multi-Step Analysis

```sql
WITH monthly AS (
    SELECT
        DATE_TRUNC('month', order_date) AS month,
        customer_id,
        SUM(total) AS monthly_spend
    FROM orders
    GROUP BY 1, 2
),
customer_stats AS (
    SELECT
        customer_id,
        COUNT(DISTINCT month)    AS active_months,
        ROUND(AVG(monthly_spend), 2) AS avg_monthly_spend,
        SUM(monthly_spend)       AS lifetime_spend
    FROM monthly
    GROUP BY customer_id
)
SELECT
    CASE
        WHEN lifetime_spend >= 10000 THEN 'high'
        WHEN lifetime_spend >= 1000  THEN 'medium'
        ELSE 'low'
    END AS spend_tier,
    COUNT(*)                          AS customer_count,
    ROUND(AVG(avg_monthly_spend), 2)  AS avg_monthly,
    ROUND(AVG(active_months), 1)      AS avg_active_months
FROM customer_stats
GROUP BY 1
ORDER BY avg_monthly DESC;
```

### Outlier Detection in SQL

```sql
WITH stats AS (
    SELECT
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY value) AS q1,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value) AS q3
    FROM measurements
),
bounds AS (
    SELECT
        q1 - 1.5 * (q3 - q1) AS lower_bound,
        q3 + 1.5 * (q3 - q1) AS upper_bound
    FROM stats
)
SELECT m.*
FROM measurements m, bounds b
WHERE m.value < b.lower_bound OR m.value > b.upper_bound
ORDER BY m.value;
```

## Output Formats

### Console Summary

For quick interactive analysis, print a structured summary:

```python
def print_summary(df: pd.DataFrame, target_col: str) -> None:
    """Print a concise analysis summary to stdout."""
    print(f"Dataset: {len(df):,} rows x {len(df.columns)} columns")
    print(f"Target: {target_col}")
    print(f"  Mean:   {df[target_col].mean():.2f}")
    print(f"  Median: {df[target_col].median():.2f}")
    print(f"  Std:    {df[target_col].std():.2f}")
    print(f"  Min:    {df[target_col].min():.2f}")
    print(f"  Max:    {df[target_col].max():.2f}")
    missing = df[target_col].isnull().sum()
    if missing > 0:
        print(f"  Missing: {missing} ({missing / len(df) * 100:.1f}%)")
    print()
```

### CSV Export

```python
# Export processed data
df.to_csv("output.csv", index=False)

# Export summary table
summary.to_csv("summary.csv")
```

### Chart Export

Save all charts as PNG at 150 DPI minimum. Use `bbox_inches="tight"` to prevent label clipping:

```python
plt.savefig("chart.png", dpi=150, bbox_inches="tight", facecolor="white")
```

## Report Template

Structure every data analysis report with the following sections. Adapt depth to the scope of the analysis.

```markdown
# [Report Title]

**Date**: YYYY-MM-DD
**Analyst**: [name or agent ID]
**Data Source**: [file name, table, or query description]
**Period**: [date range covered]

## Executive Summary

[2-4 sentences. State the primary finding, its magnitude, and the recommended action.
Lead with the most important insight. Write for a reader who will only read this section.]

## Key Findings

1. **[Finding headline]** -- [One sentence with the specific metric or comparison.]
2. **[Finding headline]** -- [One sentence.]
3. **[Finding headline]** -- [One sentence.]

## Methodology

- **Data source**: [origin, freshness, known limitations]
- **Sample size**: [row count after cleaning, any exclusions noted]
- **Methods**: [statistical techniques applied, tools used]
- **Assumptions**: [any assumptions that affect interpretation]

## Detailed Analysis

### [Section per major analytical question]

[Narrative explanation supported by inline metrics and chart references.]

![Chart description](chart_filename.png)

*Figure N: [Caption explaining what the chart shows and the key takeaway.]*

### Data Quality Notes

- [Any missing data, anomalies, or caveats the reader should know.]

## Recommendations

1. **[Action item]** -- [Why, based on which finding, expected impact.]
2. **[Action item]** -- [Why, based on which finding, expected impact.]
3. **[Action item]** -- [Why, based on which finding, expected impact.]

## Appendix

- [Raw summary statistics tables]
- [Full correlation matrix]
- [List of outliers removed and rationale]
```

## Data Cleaning Patterns

Common cleaning operations to run after profiling:

```python
# Drop exact duplicate rows
df = df.drop_duplicates()

# Standardize string columns
df["name"] = df["name"].str.strip().str.lower()

# Parse dates
df["date"] = pd.to_datetime(df["date"], errors="coerce")

# Fill missing numerics with median (robust to outliers)
for col in df.select_dtypes(include="number").columns:
    df[col] = df[col].fillna(df[col].median())

# Fill missing categoricals with mode or explicit "Unknown"
for col in df.select_dtypes(include="object").columns:
    df[col] = df[col].fillna("Unknown")

# Remove columns with >80% missing
threshold = 0.8
high_missing_cols = [c for c in df.columns if df[c].isnull().mean() > threshold]
df = df.drop(columns=high_missing_cols)

# Convert types
df["id"] = df["id"].astype(int)
df["category"] = df["category"].astype("category")
```
