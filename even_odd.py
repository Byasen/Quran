"""
Quran Numerical Pattern Search
===============================
Properties to match:
  - 114 surahs, orders fixed: 1..114
  - Each surah has a verse count: 1..286
  - For each surah: compute (order + verse_count) -> classify as even or odd
  - S_even = sum of (order + verse_count) for surahs where the sum is even
  - S_odd  = sum of (order + verse_count) for surahs where the sum is odd
  - O_total = sum of all orders (fixed = 1+2+...+114 = 6555)
  - V_total = sum of all verse counts
  - Target: two matched pairs from {S_even, S_odd, O_total, V_total}
    i.e. S_odd == O_total AND S_even == V_total  (as seen in the Quran)
    OR   S_even == O_total AND S_odd == V_total

In the Quran:
  O_total  = 6555  (fixed, sum of 1..114)
  V_total  = 6236
  S_odd    = 6555
  S_even   = 6236
  -> S_odd == O_total  and  S_even == V_total   (the two matched pairs)

We search for random verse-count assignments that reproduce this structure.
"""

import random
import time
from datetime import datetime

# ── constants ────────────────────────────────────────────────────────────────
NUM_SURAHS   = 114
MAX_VERSES   = 286
MIN_VERSES   = 1
O_TOTAL      = sum(range(1, NUM_SURAHS + 1))   # 6555, always fixed
QURAN_VTOTAL = 6236                             # target V_total from the image

SUCCESS_FILE = "successes.txt"

# ── helpers ──────────────────────────────────────────────────────────────────

def evaluate(verse_counts):
    """
    Given a list of 114 verse counts, compute the four sums and
    check whether they form two matched pairs.

    Returns (s_odd, s_even, v_total, matched_pair) where matched_pair is
    a string describing the pair or None.
    """
    orders = list(range(1, NUM_SURAHS + 1))
    s_odd  = 0
    s_even = 0
    v_total = sum(verse_counts)

    for order, verses in zip(orders, verse_counts):
        total = order + verses
        if total % 2 == 0:
            s_even += total
        else:
            s_odd  += total

    # Check for matched pairs
    pair = None
    if s_odd == O_TOTAL and s_even == v_total:
        pair = f"S_odd({s_odd}) == O_total({O_TOTAL})  AND  S_even({s_even}) == V_total({v_total})"
    elif s_even == O_TOTAL and s_odd == v_total:
        pair = f"S_even({s_even}) == O_total({O_TOTAL})  AND  S_odd({s_odd}) == V_total({v_total})"
    elif s_odd == v_total and s_even == O_TOTAL:
        pair = f"S_odd({s_odd}) == V_total({v_total})  AND  S_even({s_even}) == O_total({O_TOTAL})"

    return s_odd, s_even, v_total, pair


def random_verses():
    return [random.randint(MIN_VERSES, MAX_VERSES) for _ in range(NUM_SURAHS)]


def log_success(trial_num, verse_counts, s_odd, s_even, v_total, pair_desc):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(SUCCESS_FILE, "a") as f:
        f.write("=" * 70 + "\n")
        f.write(f"[SUCCESS #{trial_num}]  Found at {timestamp}\n")
        f.write(f"  Matched pair : {pair_desc}\n")
        f.write(f"  O_total      : {O_TOTAL}\n")
        f.write(f"  V_total      : {v_total}\n")
        f.write(f"  S_odd        : {s_odd}\n")
        f.write(f"  S_even       : {s_even}\n")
        f.write(f"  Verse counts : {verse_counts}\n\n")


# ── main loop ────────────────────────────────────────────────────────────────

def main():
    print("=" * 70)
    print("  Quran Numerical Pattern Search")
    print(f"  Surahs: {NUM_SURAHS}  |  Max verses: {MAX_VERSES}")
    print(f"  Fixed O_total = {O_TOTAL}")
    print(f"  Looking for: S_odd==O_total & S_even==V_total  (or symmetric)")
    print("=" * 70)
    print()

    trial        = 0
    success_count = 0
    start_time   = time.time()
    report_every = 100_000      # print a status line every N trials

    try:
        while True:
            trial += 1
            verses = random_verses()
            s_odd, s_even, v_total, pair = evaluate(verses)

            # ── progress report ──────────────────────────────────────────────
            if trial % report_every == 0:
                elapsed = time.time() - start_time
                rate    = trial / elapsed
                print(
                    f"Trial {trial:>12,} | "
                    f"elapsed {elapsed:>8.1f}s | "
                    f"rate {rate:>10,.0f}/s | "
                    f"successes {success_count}"
                )

            # ── success check ────────────────────────────────────────────────
            if pair:
                success_count += 1
                elapsed = time.time() - start_time
                print()
                print("★" * 70)
                print(f"  ✅  SUCCESS #{success_count}  at trial {trial:,}  ({elapsed:.2f}s)")
                print(f"  {pair}")
                print(f"  V_total = {v_total}  |  O_total = {O_TOTAL}")
                print(f"  S_odd   = {s_odd}  |  S_even  = {s_even}")
                print("★" * 70)
                print()
                log_success(trial, verses, s_odd, s_even, v_total, pair)

    except KeyboardInterrupt:
        elapsed = time.time() - start_time
        print()
        print("-" * 70)
        print(f"Stopped after {trial:,} trials in {elapsed:.1f}s")
        print(f"Total successes found: {success_count}")
        if success_count:
            print(f"Results saved to: {SUCCESS_FILE}")
        print("-" * 70)


if __name__ == "__main__":
    main()