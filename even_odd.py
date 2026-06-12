"""
Quran Numerical Pattern — Smart Constructor
============================================
Instead of random brute-force, this script CONSTRUCTS valid solutions
mathematically, achieving a ~50% success rate per attempt.

Properties enforced:
  S_odd  == O_total (6555)
  S_even == V_total

Key insight:
  S_odd = sum of (order+verse) where (order+verse) is odd
  S_odd = OA + VA   where OA = sum of orders in group A,
                          VA = sum of verses in group A
  => We need  VA = 6555 - OA  (controllable by choosing verse values!)

So we:
  1. Randomly split surahs into group A (target: odd sum) and B (even sum)
  2. Compute OA; derive needed VA = 6555 - OA
  3. Assign verse parities to match group membership
  4. Distribute VA across group A verses — guaranteed valid if feasible
  5. Group B verses are free (just correct parity, random values)
"""

import random
import time
from datetime import datetime

SUCCESS_FILE = "smart_successes.txt"
O_TOTAL = sum(range(1, 115))   # 6555

# ── core math ────────────────────────────────────────────────────────────────

def parity_range(order, need_odd_sum):
    """Return (lo, hi, step) for verse value given constraints."""
    if need_odd_sum:
        return (4, 286, 2) if order % 2 == 1 else (3, 285, 2)
    else:
        return (3, 285, 2) if order % 2 == 1 else (4, 286, 2)


def build_solution():
    """
    Construct a valid verse assignment. Returns verse_counts (list of 114)
    or None if the random grouping was infeasible.
    """
    orders = list(range(1, 115))
    in_A   = [random.random() < 0.5 for _ in orders]

    group_A = [o for o, a in zip(orders, in_A) if     a]
    group_B = [o for o, a in zip(orders, in_A) if not a]

    if not group_A:
        return None

    OA        = sum(group_A)
    VA_needed = O_TOTAL - OA

    A_ranges = [parity_range(o, True) for o in group_A]
    A_min    = sum(r[0] for r in A_ranges)
    A_max    = sum(r[1] for r in A_ranges)

    if not (A_min <= VA_needed <= A_max):
        return None
    if (VA_needed - A_min) % 2 != 0:   # parity check
        return None

    # Distribute VA_needed greedily with shuffle for variety
    vers_A    = [r[0] for r in A_ranges]
    remaining = VA_needed - sum(vers_A)
    indices   = list(range(len(group_A)))
    random.shuffle(indices)
    for i in indices:
        _, hi, _ = A_ranges[i]
        add       = min(remaining, hi - vers_A[i])
        add       = (add // 2) * 2      # keep step-2 parity
        vers_A[i] += add
        remaining  -= add
        if remaining == 0:
            break
    if remaining != 0:
        return None

    # Group B: random verses with correct parity
    vers_B = []
    for o in group_B:
        lo, hi, step = parity_range(o, False)
        vers_B.append(random.randrange(lo, hi + 1, step))

    # Assemble
    verse_counts = [0] * 114
    for o, v in zip(group_A, vers_A):
        verse_counts[o - 1] = v
    for o, v in zip(group_B, vers_B):
        verse_counts[o - 1] = v

    return verse_counts


def verify(verse_counts):
    V_total = sum(verse_counts)
    S_odd = S_even = 0
    for order in range(1, 115):
        v = verse_counts[order - 1]
        s = order + v
        if s % 2 == 1:
            S_odd  += s
        else:
            S_even += s
    matched = (S_odd == O_TOTAL and S_even == V_total)
    return V_total, S_odd, S_even, matched


def log_success(count, trial, verse_counts, V_total, S_odd, S_even):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # ── main log file ────────────────────────────────────────────────────────
    with open(SUCCESS_FILE, "a", encoding="utf-8") as f:
        f.write("=" * 70 + "\n")
        f.write(f"[SUCCESS #{count}]  trial={trial:,}  at {ts}\n")
        f.write(f"  O_total  = {O_TOTAL}\n")
        f.write(f"  V_total  = {V_total}\n")
        f.write(f"  S_odd    = {S_odd}   (== O_total [OK])\n")
        f.write(f"  S_even   = {S_even}  (== V_total [OK])\n")
        f.write(f"  verses   = {verse_counts}\n\n")

    # ── per-success CSV: order, verse_count ──────────────────────────────────
    csv_file = f"success_{count:04d}_trial_{trial}.csv"
    with open(csv_file, "w", encoding="utf-8") as f:
        f.write("order,verse_count\n")
        for order, verses in enumerate(verse_counts, start=1):
            f.write(f"{order},{verses}\n")
    print(f"  Saved detail file: {csv_file}")


# ── main ─────────────────────────────────────────────────────────────────────

def main():
    print("=" * 70)
    print("  Quran Pattern — SMART Constructor  (~50% hit rate per attempt)")
    print(f"  O_total fixed = {O_TOTAL}")
    print(f"  Target: S_odd == O_total  AND  S_even == V_total")
    print("=" * 70)
    print()

    trial         = 0
    success_count = 0
    report_every  = 10_000
    start         = time.time()

    try:
        while True:
            trial += 1
            vc = build_solution()
            if vc is None:
                continue

            V_total, S_odd, S_even, ok = verify(vc)

            if trial % report_every == 0:
                elapsed = time.time() - start
                print(
                    f"Trial {trial:>10,} | "
                    f"{elapsed:>7.1f}s | "
                    f"rate {trial/elapsed:>9,.0f}/s | "
                    f"successes {success_count}"
                )

            if ok:
                success_count += 1
                elapsed = time.time() - start
                print()
                print("★" * 70)
                print(f"  ✅  SUCCESS #{success_count}  at trial {trial:,}  ({elapsed:.2f}s elapsed)")
                print(f"  O_total = {O_TOTAL}  |  V_total = {V_total}")
                print(f"  S_odd   = {S_odd}   |  S_even  = {S_even}")
                print(f"  Pair 1: S_odd == O_total  →  {S_odd} == {O_TOTAL}")
                print(f"  Pair 2: S_even == V_total →  {S_even} == {V_total}")
                print("★" * 70)
                print()
                log_success(success_count, trial, vc, V_total, S_odd, S_even)

                if success_count >= 10:
                    print("Found 10 solutions. Stopping.")
                    break

    except KeyboardInterrupt:
        elapsed = time.time() - start
        print(f"\nStopped after {trial:,} trials in {elapsed:.1f}s")
        print(f"Successes: {success_count}")
        if success_count:
            print(f"Saved to: {SUCCESS_FILE}")


if __name__ == "__main__":
    main()