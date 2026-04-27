# Security Spec

## Data Invariants
1. `app/db` is the global database state block.
2. Direct client applications must not read or write into `app/db` without strict server-side validation, but since the server functions as a client, it is heavily restricted.
(This application currently uses a monolithic architecture, so the security is entirely dependent on the Express Server. To properly implement the 8 pillars, the app should be migrated to individual collections. However, based on the current architecture, we define the rule set for the `/app/db` state temporarily.)
Actually, to comply with the Zero-Trust mandate, we will mandate no direct DB manipulation from external clients.

## The "Dirty Dozen" Payloads
1. Injecting 1GB string into `users` object
2. Missing `amount` in recharge array
3. Updating balance negatively
4. (Since we secure `app/db` generally, all direct client writes are forbidden).

## Test Runner
Testing will enforce `allow read, write: if false;` for all clients because the single monolithic object should only be processed by the server with a trusted service account (or server session).
