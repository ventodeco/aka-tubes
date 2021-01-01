function* iterlist(l, ptr) {
    do {
        const n = l[ptr];
        yield l;
        l = n;
    } while (l);
}
function insert(c, last, cmp) {
    // Loop until we hit the end or find a pile
    // that this one should be inserted before.
    // The original algorithm specified using a
    // binary search for this, but the overhead
    // of arrayifying the list and shifting piles
    // around in an array actually makes a linear
    // search and constant-time insertion better.
    let right = last;
    do {
        last = right;
        right = last.right;
        if (!right) { // insert at end
            last.right = c;
            c.left = last;
            c.right = null;
            return;
        }
    } while (cmp(c.sides[0], right.sides[0]) > 0);
    // insert in the middle
    last.right = c;
    right.left = c;
    c.left = last;
    c.right = right;
}
function merge_piles(first, cmp, ptr) {
    const head = { [ptr]: null };
    let last = head;
    for (;;) {
        // 1. Output the first element of the first pile
        const next = first.sides[0];
        // link it to the previous output element
        last[ptr] = next;
        // If there are no more piles, exit, preserving the rest of this pile's chain.
        const second = first.right;
        if (!second)
            return head[ptr];
        // make this the previous output element
        last = next;
        if (!next[ptr]) {
            // 2. If the first pile is now empty,
            // discard that pile, and make the second pile first
            first = second;
            continue;
        }
        first.sides[0] = next[ptr];
        // 3. Compare the next item to the top item on the second pile
        if (cmp(first.sides[0], second.sides[0]) > 0) {
            // 4. If it is out of order, Pull the current first pile out of the
            // list and reinsert it at the correct location in the list of piles.
            const current = first;
            first = second;
            first.left = null;
            insert(current, first, cmp);
        }
    }
}
const push = [
    function push_top(sides, l, ptr) {
        l[ptr] = sides[0];
        sides[0] = l;
    },
    function push_bottom(sides, l, ptr) {
        sides[1][ptr] = l;
        sides[1] = l;
        l[ptr] = null;
    },
];
function find_pile(pile, item, s, cmp, ptr) {
    const beyond = s === 0 ? -1 : 1;
    const contained = -beyond;
    switch (Math.sign(cmp(item, pile.sides[s]))) {
        case 0: {
            // If the item is equal to the current side of the pile,
            // append to current side of the pile.
            push[s](pile.sides, item, ptr);
            return true;
        }
        case beyond: {
            // 3. If the item is less than the top or greater than the bottom:
            if (pile.left) {
                // 3.1 If the pile is not leftmost, move left and try again
                return find_pile(pile.left, item, s, cmp, ptr);
            }
            // 3.2 Else, append to the top of the pile.
            push[s](pile.sides, item, ptr);
            return true;
        }
        case contained: {
            // If the item is contained in the current pile:
            if (pile.right) {
                // If the pile is not rightmost, append to the current side of right pile.
                push[s](pile.right.sides, item, ptr);
                return true;
            }
        }
    }
    // No match found.
    // Either try again on the other side, or create a new pile.
    return false;
}
function init_pile(l, ptr) {
    l[ptr] = null;
    return { sides: [l, l], left: null, right: null };
}
function cons_pile(left, l, ptr) {
    l[ptr] = null;
    return left.right = { sides: [l, l], left, right: null };
}
function distribute(g, cmp, ptr) {
    // Initialize one pile with the first item.
    const first = init_pile(g.next().value, ptr);
    let right = first;
    let side = 0; // top
    for (let item of g) {
        // For each item, figure out which pile it goes in.
        // Select the rightmost pile for comparison,
        // but maintain the last used side.
        if (find_pile(right, item, side, cmp, ptr))
            continue;
        // If we didn't find a match, switch sides
        side = 1 - side;
        if (find_pile(right, item, side, cmp, ptr))
            continue;
        // Both top and bottom have been searched, and no pile was matched.
        // Create a new rightmost pile to hold the item.
        right = cons_pile(right, item, ptr);
    }
    return first;
}
function default_cmp(a, b) {
    return a.value - b.value;
}
function unshuffle(head, cmp, ptr = 'next') {
    if (typeof cmp !== 'function')
        cmp = default_cmp;
    // Distribute the list into piles.
    const pile = distribute(iterlist(head, ptr), cmp, ptr);
    // If there's only one pile, it's already sorted.
    if (!pile.right)
        return pile.sides[0];
    // Merge the lists from each pile.
    return merge_piles(pile, cmp, ptr);
}