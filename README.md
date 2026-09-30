# Husky Statistic

Next.js dashboard generated from `Shoppee Accountant.xlsx`.

## Accounting logic
- **Sales revenue** = sum of `Selling Price` for rows where `Description = Sales`
- **Net sales income** = sum of the workbook's `Income` column
- **Fees** = Transaction Fee + Commission Fee + Service Fee
- **Stock cost sold** = sum of `Total Stock Price`
- **Profit** = Net sales income - Stock cost sold
- **Profit margin** = Profit / Sales revenue
- **Ads spend** = sum of `Ads Price` on `Description = Ads`
- Inventory value = Remaining × Price per item
- Month/product filters are applied to sales metrics; ad spend follows the selected month.

The JSON files under `data/` are generated from the workbook's cached calculated values.

## Run
```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Push to GitHub
Copy the project into the empty `jessicawi/huskyStatistic` repository and commit it to `main`.
