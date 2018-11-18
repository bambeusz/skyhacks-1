# Skyhacks #1

Solution to ArcelorMittal - Computer Vision - UIC Wagon recognition - Computer-based solution challenge

### Env requirements
- Node js (v8.12.0)
- npm (5+)

### 1. Install deps
`npm i`

### 2. Download footage
The footage should be located in `/src/footage/Validation`, `/src/footage/Training`, and `/src/footage/Special`. Special is for train `0_50` (or other).

If you put something to `Special` dir, please insert it there respecting the original directory structure: `Special/0_{train}/0_{train}_{left|right}/{files}`

### 3. Run csv generation
```
npm run verify-wagons
```
Grab your coffee, sit back, and relax. This takes approx. 20s-30s per train, so 60 trains gives 30 minutes.

Csv files lay in `/src/verify-wagons/csv` directory.

