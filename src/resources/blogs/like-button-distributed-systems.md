---
title: Scale, Concurrency, and Sybils: Why the Humble "Like" Button is a Distributed Systems Nightmare
date: JUNE 09, 2026
readTime: 10 MIN READ
tags: DISTRIBUTED SYSTEMS, DATABASE, CONCURRENCY, REDIS
summary: A deep dive into high-throughput concurrency, race conditions, atomic increments, message queuing, and how a simple CRUD widget can easily collapse massive production clusters.
---

# Scale, Concurrency, and Sybils: Why the Humble "Like" Button is a Distributed Systems Nightmare

It is the classic tech interview question or starter project: *"Design a like button."* On the surface, it sounds deceptively simple. A user clicks a button, a counter increments by one, and the new total is updated on the screen. It feels like a weekend project.

But in production engineering, the like button is a wolf in sheep's clothing. It is one of the highest-throughput, highest-concurrency write operations an application will ever face. When a viral event occurs—be it a breaking news story, a celebrity tweet, or a massive product launch—millions of users interact with the exact same row in a database at the exact same millisecond.

If implemented naively, this single feature can exhaust database connection pools, cause catastrophic lock contention, introduce accurate-but-impossible race conditions, and ultimately bring down your entire application infrastructure.

In this deep dive, we will incrementally build a backend like-button architecture, moving from a broken toy implementation to a hardened, distributed, and abuse-resistant system.

[like-button-sandbox]



## Phase 1: The Toy Counter (The Naive Counter)

Let's start with the most basic version. Imagine we have a basic database representing a piece of content (like a post), and an API endpoint that handles the click event.

### The Logic

When a user clicks "Like", the backend performs a simple three-step dance:

1. **Read:** Look up the post in the database and fetch the current `likes` count.
2. **Mutate:** Add `1` to that number.
3. **Write:** Save the new number back to the database.

```python
# The Naive Three-Step Dance
def handle_like_naive(post_id):
    # STEP 1: Query the current count
    post = db.query("SELECT likes FROM posts WHERE id = ?", post_id)
    
    # STEP 2: In-memory increment
    new_likes = post.likes + 1
    
    # STEP 3: Persist back to DB
    db.execute("UPDATE posts SET likes = ? WHERE id = ?", new_likes, post_id)
```

### Why this breaks immediately

This logic works perfectly in a single-threaded, single-user development environment. But it lacks two critical elements required for production: **identity** and **idempotency**.

* **Infinite Inflation:** Because the backend just blindly adds `1` every time the endpoint is hit, a single user can click the button 100 times, and the count goes up by 100. There is no concept of a "toggle".
* **The Anonymity Problem:** If a user clicks the button again to *unlike* the post, how does the backend know if this specific user had previously liked it? If we just expose an `unlike` endpoint that decrements the counter blindly, a malicious user can spam decrement requests and drop the post's likes into negative numbers.



## Phase 2: Tracking the Toggle (Who Liked What?)

To solve the tracking problem, we must decouple the *aggregate count* from the *identity of the user*. We cannot just store a raw integer; we must store the state of engagement per user.

### The Refactored Logic

Instead of a single counter, we introduce a **Likes Ledger** (conceptually like a relational join table or a key-value mapping).

```sql
-- Relational Join Table for engagements
CREATE TABLE post_likes (
    post_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
);
```

* When a user hits `LIKE`, the backend checks the ledger for a unique composite key: `user_id:post_id`.
* If the key doesn't exist, the backend creates it and sets the state to `True`.
* If the user hits `UNLIKE`, the backend checks if that key exists. If it does, the backend removes it. If it doesn't, the request is safely ignored.

```python
# The Ledger Engagement Check
def handle_like_ledger(user_id, post_id):
    # Check if this user had already liked the post
    already_liked = db.query(
        "SELECT 1 FROM post_likes WHERE user_id = ? AND post_id = ?",
        user_id, post_id
    )
    
    if not already_liked:
        # Record the engagement link
        db.execute(
            "INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)", 
            user_id, post_id
        )
```

### The High Analytical Cost

To show the total number of likes on a post now, the database has to scan the ledger: `SELECT COUNT(*) FROM likes WHERE post_id = 'post_123'`.

Across millions of rows, running an aggregate count on every single page load is a massive performance bottleneck that melts disk I/O. To keep reads lightning-fast, production systems typically use a **denormalized architecture**—meaning they store a cache counter directly on the post record *and* update the ledger simultaneously.

And that is exactly where the application breaks at scale.



## Phase 3: The Concurrency Nightmare (Enter Race Conditions)

When you maintain both an identity ledger record and an aggregate counter, or when multiple requests try to write to the same row simultaneously without synchronization, you run into severe **lock contention and race conditions**.

### The Concurrency Loop

Imagine a post goes viral, and 50 users click the like button at the exact same millisecond.

1. **Thread A** reads the database and sees `likes = 100`.
2. **Thread B** reads the database at the exact same instant and also sees `likes = 100`.
3. **Thread A** increments the value to `101` and writes it back.
4. **Thread B** increments its snapshot value to `101` and writes it back.

Even though two distinct users liked the post, the final count in the database is `101` instead of `102`. You have successfully lost data.

### The Impact on Production

In a real relational database (like PostgreSQL or MySQL), developers try to fix this using two main approaches, both of which introduce devastating side effects under heavy load:

1. **Pessimistic Locking (`SELECT FOR UPDATE`):** This forces requests to queue up linearly. If 10,000 users click like on a viral post, 9,999 threads are blocked waiting for the database lock to release. Your web server's connection pool fills up, API requests time out, and your entire application crashes.
2. **Atomic In-Place Updates (`SET likes = likes + 1`):** While this avoids losing writes, it still creates a massive write-hotspot on that specific database row, locking the row for every concurrent transaction and delaying other critical updates to that post.

```sql
-- Approach 1: Block all other threads (Creates 504 timeouts)
BEGIN TRANSACTION;
SELECT likes FROM posts WHERE id = 'post_123' FOR UPDATE;
UPDATE posts SET likes = likes + 1 WHERE id = 'post_123';
COMMIT;

-- Approach 2: Atomic update (Row is still held locked on write)
UPDATE posts SET likes = likes + 1 WHERE id = 'post_123';
```



## Phase 4: Scaling Writes via Asynchronous Message Queues

To prevent the database from collapsing under a stampede of concurrent writes, we must introduce an asynchronous, decoupled architecture.

Instead of writing directly to the database synchronously while the user waits, the HTTP web worker takes the incoming request, bundles it into a lightweight **"Like Event"**, drops it into a high-throughput **Message Queue** (like Apache Kafka, RabbitMQ, or AWS SQS), and immediately returns a `202 Accepted` status to the client.

```
[User Click] ──> [Web API Server] ──> [Message Queue (Kafka/SQS)]
                                              │
                                              ▼
                                     [Background Consumer] ──> [Database Update]

```

### The Background Consumer

A dedicated background consumer process pulls messages from this queue at a controlled, sustainable pace and flushes them to the persistent storage layer. Because the queue handles the massive traffic spike, your database never sees the stampede. It receives a smooth, metered stream of updates.

### The Architectural Tradeoff: Eventual Consistency

By decoupling the write, we introduce **eventual consistency**. When a user clicks like, the counter in the database does not update instantly. If they refresh the page a millisecond later, the count might look unchanged until the background consumer catches up.

To hide this from the user, frontend applications use **optimistic UI updates**—locally incrementing the UI counter immediately on the screen while assuming the backend queue will succeed shortly.



## Phase 5: The Sybil Attack (Handling Throwaway Accounts & Mass Reversals)

Now, let's look at a critical product security challenge. What if a malicious actor boots up a botnet of 50,000 throwaway or "Sybil" accounts to artificially inflate a post's popularity?

Your message queue handles the ingest perfectly, the ledger tracks them, and your post metrics soar. Hours later, your anti-fraud team flags these 50,000 accounts and bans them.

**The Challenge:** How do you revert their exact impact on the engagement metrics without losing track of legitimate user behavior or destroying database performance?

If you simply loop through 50,000 users and run individual decrement logic, you re-introduce massive lock contention on that single post record. Furthermore, if you just decrement the global counter blindly without verifying historical states, you risk messing up the numbers if some of those bot accounts had already manually unliked the post before being banned.

### The Production Solution: Append-Only Event Logs & Batch Processing

To mitigate this, robust systems avoid destructive modifications during fraud cleanups. Instead, they treat the event log as immutable and handle reversals using a deterministic batch-reversal strategy:

1. **The Blacklist Registry:** The banned user IDs are added to a fast-lookup cache or blacklist database table to drop any future incoming traffic from them at the gateway.
2. **Consolidated Delta Calculation:** Instead of hitting the main database row 50,000 times to subtract 1, an administrative script scans the historical event log for interactions tied to the banned accounts. It aggregates the total impact into a single consolidated math equation per post (e.g., *"Post X was liked by 48,200 banned accounts and unliked by 1,800 banned accounts; net adjustment needed: -46,400"*).
3. **Single-Pass Batch Update:** The backend applies the consolidated adjustment to the target post records in a single database transaction pass. This completely eliminates row lock contention and accurately cleans up metrics without risking negative numbers or corrupted state.



## Hidden Technicalities You Cannot Afford to Ignore

If you are designing a high-scale like button architecture, there are a few extra hidden technical nuances you must implement to ensure absolute resilience:

### 1. Write-Back Caching via Redis

Hitting disk storage or standard databases for every single update—even with a message queue—creates drag. To maximize performance, implement a **Write-Back Cache pattern** using **Redis Sets**.

```javascript
// High-performance Redis caching with identity verification
async function handleLikeRequest(userId, postId) {
  // SADD adds to set only if it doesn't exist (O(1) complexity)
  const isNew = await redis.sadd(`post:${postId}:likes`, userId);
  
  if (isNew === 1) {
    // Unique like! Atomically increment cache counts
    await redis.incr(`post:${postId}:count`);
    
    // Smooth async dispatch down the wire
    await messageQueue.publish("likes_events", { userId, postId, action: 'LIKE' });
  } else {
    // Already liked, drop request to protect database
    return { success: false, reason: "duplicate_interaction" };
  }
}
```

* When a user likes a post, execute an atomic `SADD post:123:likes user_456` in Redis.
* If Redis returns `1`, the user hadn't liked it yet. You can then safely execute an inline `INCR post:123:count`.
* If Redis returns `0`, the user is a duplicate clicker—drop the request immediately.
* A background cron job periodically flushes these high-speed Redis counts down to your primary database.

### 2. Idempotency at the Edge

Network connectivity fluctuates on mobile devices. A user might click like, their phone sends the API call, the cellular tower drops, and the application automatically retries the call.

* To prevent duplicate side-effects from a single physical click, generate a unique **Idempotency Key** on the client side (e.g., a hash of `user_id + post_id + action_sequence_number`) and check it against a short-lived cache before processing the event.

### 3. Queue Partition Keys and Ordering Guarantees

If a user rapidly taps the like button over and over (`Like -> Unlike -> Like`), the order of those actions matters down to the millisecond. If your message queue distributes these requests across different servers randomly, the `Unlike` message might get processed *after* the second `Like` message due to network jitter, leaving the user's state permanently broken.

* **The Solution:** Use **Key-Based Partitioning** in your message queue. By routing all messages with a partition key equal to the `post_id` or `user_id` to the exact same queue worker, you guarantee that events from a single entity are processed in strict, sequential chronological order.

## Conclusion

The humble like button is an exceptional microcosm of distributed systems engineering. It forces developers to step away from comfortable monolithic CRUD paradigms and tackle real-world physical limitations: lock contention, network splits, asynchronous state reconciliation, and active malicious Sybil behavior.

By separating the API ingest from database execution via message queues, enforcing strict uniqueness checks on identity ledgers, and applying batched mathematical updates during administrative corrections, you can build a system capable of handling the highest-velocity spikes on the internet without crashing your core application.
